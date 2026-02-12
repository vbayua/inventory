<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Models\Operation;
use App\Models\Stock;
use App\Service\StockOperationService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class StockController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Stock::class, 'stock');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Check parameter for filtering stocks by status
        // $stocks = Stock::with(['product:id,name,sku.productType:id,name,type_code', 'location:id,name.warehouse:id,name', 'batch:id,batch_number.supplier:id,name'])->get();
        $stocks = Stock::with([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
        ])->get();

        return Inertia('Stocks/Index', [
            'stocks' => $stocks,
            'stats' => [
                'total_items' => Stock::count(),
                'total_locations' => Stock::distinct('location_id')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStockRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Stock $stock)
    {
        $operationsData = Operation::with([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name'
        ])
        ->where('product_id', $stock->product_id)
        ->where('location_id', $stock->location_id)
        ->where('batch_id', $stock->batch_id)
        ->latest()
        ->get();
        $operations = Inertia::lazy(fn() => $operationsData);


        // dd($operations);

        return Inertia('Stocks/Show', [
            'stock' => $stock->load([
                'product:id,name,sku,product_type_id',
                'product.productType:id,name,type_code',
                'location:id,name,warehouse_id',
                'location.warehouse:id,name',
                'batch:id,batch_number,supplier_id,minimum_quantity',
                'batch.supplier:id,partner_id',
                'batch.supplier.partner:id,name',
                'user:id,name'
            ]),
            'operations' => $operations,
        ]);
    }

    /**
     * Display the stock card for the specified resource.
     */
    public function stockCard(Stock $stock)
    {
        $operations = Operation::with([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name'
        ])
        ->where('product_id', $stock->product_id)
        ->where('batch_id', $stock->batch_id)
        ->orderBy('operation_date', 'asc')
        ->orderBy('id', 'asc')
        ->get();
        // $operations = Inertia::lazy(fn() => $operationsData);

        $totalLocations = Stock::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id)->distinct('location_id')->count();
        $totalStockQuantityAcrossLocations = Stock::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id)
            ->sum('quantity');

            // Compute delta for each operation type
               $operationDeltas = $operations->map(function ($op) {
                   $type = $op->operation_type;

                   // Normalize types to your domain semantics
                   // inbound => +qty, outbound => -qty, adjustment(addition) => +qty, adjustment(subtraction) => -qty,
                   // return => +qty, transfer => 0 (when aggregating across locations)
                   $qty = (float) $op->quantity;

                   $delta = 0.0;
                   if ($type === 'inbound') {
                       $delta = +$qty;
                   } elseif ($type === 'outbound') {
                       $delta = -$qty;
                   } elseif ($type === 'adjustment') {
                       // When stored, remarks or a dedicated field may indicate addition/subtraction.
                       // If you persist adjustmentType, use it here; otherwise infer from remarks.
                       // Example assumes you have "addition"/"subtraction" in remarks, adjust to your actual data.
                       $adj = null;
                       if (isset($op->remarks)) {
                           $r = strtolower($op->remarks);
                           if (str_contains($r, 'addition')) $adj = 'addition';
                           if (str_contains($r, 'subtraction')) $adj = 'subtraction';
                       }
                       if ($adj === 'subtraction') {
                           $delta = -$qty;
                       } else {
                           $delta = +$qty;
                       }
                   } elseif ($type === 'return') {
                       $delta = +$qty;
                   } elseif ($type === 'transfer') {
                       // Aggregated card across locations: neutralize transfers
                       $delta = 0.0;
                   } else {
                       // Unknown type -> neutral
                       $delta = 0.0;
                   }

                   // Attach the computed delta
                   $op->delta = $delta;
                   return $op;
               });

               $netSum = $operationDeltas->sum('delta');

               // Opening balance so final balance equals current total across locations
               $openingBalance = (float) $totalStockQuantityAcrossLocations - (float) $netSum;

               // Build running balance sequence
               $running = 0.0;
               $operationsWithBalance = $operationDeltas->map(function ($op) use (&$running, $openingBalance) {
                   $running += (float) $op->delta;
                   $op->balance = $openingBalance + $running;
                   return $op;
               });

        // dd($operationsWithBalance, $openingBalance);
        return Inertia('Stocks/StockCard', [
            'stock' => $stock->load([
                'product:id,name,sku,product_type_id',
                'product.productType:id,name,type_code',
                'location:id,name,warehouse_id',
                'location.warehouse:id,name',
                'batch:id,batch_number,supplier_id,expiry_date,manufacture_date',
                'batch.supplier:id,partner_id',
                'batch.supplier.partner:id,name',
                'user:id,name']),
            'operations' => $operationsWithBalance,
            'total_locations' => $totalLocations,
            'total_stock_quantity_across_locations' => $totalStockQuantityAcrossLocations,
            'opening_balance' => $openingBalance,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Stock $stock)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStockRequest $request, Stock $stock, StockOperationService $stockService)
    {
        DB::transaction(function () use ($request, $stock, $stockService) {
            $data = $request->validated();

            $batch = $stock->batch()->lockForUpdate()->first();
            // Use incoming values if present; otherwise fall back to current model values
            $minQty = array_key_exists('minimum_quantity', $data) ? $data['minimum_quantity'] : $batch->minimum_quantity;
            $qty = array_key_exists('quantity', $data) ? $data['quantity'] : $stock->quantity;

            // Compute status based on the effective quantities
            $data['status'] = $stockService->setStockStatus($qty, $minQty);

            // Persist all changes in a single update
            $batch->update($data);
        });

        return redirect()->route('stocks.show', $stock)->with('success', 'Stock updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock)
    {
        //
    }

    public function exportStockCard(Stock $stock)
    {
        $fileName = 'stock_card_' . $stock->product->sku . '_' . $stock->batch->batch_number . '.xlsx';
        $operation = Operation::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id)
            ->where('location_id', $stock->location_id)
            ->first();
        return Excel::download(new \App\Exports\StockCardExport($operation), $fileName);
    }

    public function export(Stock $stock)
    {
        $exportTime = now()->format('Ymd_His');
        $fileName = $stock->product->sku . '_' . $stock->batch->batch_number . '_' . $stock->location->name . '_' . $exportTime;
        $range = request()->query('range', 'all');
        $exportRange = $range ?? 'all';

        if ($exportRange === '30d') {
            $cutoffDate = now()->subDays(30);
        } elseif ($exportRange === '90d') {
            $cutoffDate = now()->subDays(90);
        } elseif ($exportRange === '180d') {
            $cutoffDate = now()->subDays(180);
        } elseif($exportRange === '1y') {
            $cutoffDate = now()->subYear();
        } elseif ($exportRange === 'this_month') {
            $cutoffDate = now()->startOfMonth();
        } elseif ($exportRange === 'this_year') {
            $cutoffDate = now()->startOfYear();
        } else {
            $cutoffDate = null; // 'all' range
        }

        $stock->load([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id,expiry_date,manufacture_date',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name']);
        $totalLocations = Stock::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id)->distinct('location_id')->count();
        $totalStockQuantityAcrossLocations = Stock::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id)
            ->sum('quantity');

        $stock->total_locations = $totalLocations;
        $stock->total_quantity = $totalStockQuantityAcrossLocations;

        return Excel::download(new \App\Exports\StockExport($stock, $cutoffDate), $fileName . '.xlsx', \Maatwebsite\Excel\Excel::XLSX);

    }

    public function exportStockCardPdf(Stock $stock)
    {
        $range = request()->query('range', 'all');
        $exportRange = $range ?? 'all';

        $exportTime = now()->format('Ymd_His');

        if ($exportRange === '30d') {
            $cutoffDate = now()->subDays(30);
        } elseif ($exportRange === '90d') {
            $cutoffDate = now()->subDays(90);
        } elseif ($exportRange === '180d') {
            $cutoffDate = now()->subDays(180);
        } elseif($exportRange === '1y') {
            $cutoffDate = now()->subYear();
        } elseif ($exportRange === 'this_month') {
            $cutoffDate = now()->startOfMonth();
        } elseif ($exportRange === 'this_year') {
            $cutoffDate = now()->startOfYear();
        } else {
            $cutoffDate = null; // 'all' range
        }

        $fileName = 'stock_card_' . $stock->product->sku . '_' . $stock->batch->batch_number . '_' . $exportTime . '.pdf';

        $stock->load([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id,expiry_date,manufacture_date',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name']);

        $operations = Operation::with([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name'
        ])
        ->where('product_id', $stock->product_id)
        ->where('batch_id', $stock->batch_id)
        ->whereBetween('operation_date', [($cutoffDate ?? \Carbon\Carbon::parse('1900-01-01')), now()])
        ->orderBy('operation_date', 'asc')
        ->orderBy('id', 'asc')
        ->get();

        $totalLocations = Stock::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id)->distinct('location_id')->count();
        $totalStockQuantityAcrossLocations = Stock::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id)
            ->sum('quantity');
        $stock->total_locations = $totalLocations;

            $operationDeltas = $operations->map(function ($op) {
                $type = $op->operation_type;

                // Normalize types to your domain semantics
                // inbound => +qty, outbound => -qty, adjustment(addition) => +qty, adjustment(subtraction) => -qty,
                // return => +qty, transfer => 0 (when aggregating across locations)
                $qty = (float) $op->quantity;

                $delta = 0.0;
                if ($type === 'initial') {
                    $delta = +$qty;
                } elseif ($type === 'inbound') {
                    $delta = +$qty;
                } elseif ($type === 'outbound') {
                    $delta = -$qty;
                } elseif ($type === 'adjustment') {
                    // When stored, remarks or a dedicated field may indicate addition/subtraction.
                    // If you persist adjustmentType, use it here; otherwise infer from remarks.
                    // Example assumes you have "addition"/"subtraction" in remarks, adjust to your actual data.
                    $adj = null;
                    if (isset($op->remarks)) {
                        $r = strtolower($op->remarks);
                        if (str_contains($r, 'addition')) $adj = 'addition';
                        if (str_contains($r, 'subtraction')) $adj = 'subtraction';
                    }
                    if ($adj === 'subtraction') {
                        $delta = -$qty;
                    } else {
                        $delta = +$qty;
                    }
                } elseif ($type === 'return') {
                    $delta = +$qty;
                } elseif ($type === 'transfer') {
                    // Aggregated card across locations: neutralize transfers
                    $delta = 0.0;
                } elseif($type === 'transfer_in') {
                    $delta = +$qty;
                } elseif($type === 'transfer_out') {
                    $delta = -$qty;
                } else {
                    // Unknown type -> neutral
                    $delta = 0.0;
                }

                // Attach the computed delta
                $op->delta = $delta;
                return $op;
            });

            $netSum = $operationDeltas->sum('delta');

            // Opening balance so final balance equals current total in location
            $openingBalance = (float) $totalStockQuantityAcrossLocations - (float) $netSum;

            // Build running balance sequence
            $running = 0.0;
            $operationsWithBalance = $operationDeltas->map(function ($op) use (&$running, $openingBalance) {
                $running += (float) $op->delta;
                $op->balance = $openingBalance + $running;
                return $op;
            });

            // Data periode
            $dataPeriode = $cutoffDate ? $cutoffDate->format('d/m/Y') . ' to ' . now()->format('d/m/Y') : 'All Time';

        return Excel::download(new \App\Exports\StockCardViewAllExport($operationsWithBalance, $stock, $dataPeriode), $fileName, \Maatwebsite\Excel\Excel::MPDF);

    }

    public function exportStockCardByLocation(Stock $stock)
    {
        $exportTime = now()->format('Ymd_His');
        $fileName = $stock->product->sku . '_' . $stock->batch->batch_number . '_' . $stock->location->name . '_' . $exportTime . '.xlsx';

        $stock->load([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id,expiry_date,manufacture_date',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name']);

        $operations = Operation::with([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name'
        ])
        ->where('product_id', $stock->product_id)
        ->where('batch_id', $stock->batch_id)
        ->where('location_id', $stock->location_id)
        ->orderBy('operation_date', 'asc')
        ->orderBy('id', 'asc')
        ->get();


        // Calculate opening balance based on total stock quantity from Stock model, one location
        $totalStockInLocation = $stock->quantity;

        $operationDeltas = $operations->map(function ($op) {
            $type = $op->operation_type;

            // Normalize types to your domain semantics
            // inbound => +qty, outbound => -qty, adjustment(addition) => +qty, adjustment(subtraction) => -qty,
            // return => +qty, transfer => 0 (when aggregating across locations)
            $qty = (float) $op->quantity;

            $delta = 0.0;
            if ($type === 'inbound') {
                $delta = +$qty;
            } elseif ($type === 'outbound') {
                $delta = -$qty;
            } elseif ($type === 'adjustment') {
                // When stored, remarks or a dedicated field may indicate addition/subtraction.
                // If you persist adjustmentType, use it here; otherwise infer from remarks.
                // Example assumes you have "addition"/"subtraction" in remarks, adjust to your actual data.
                $adj = null;
                if (isset($op->remarks)) {
                    $r = strtolower($op->remarks);
                    if (str_contains($r, 'addition')) $adj = 'addition';
                    if (str_contains($r, 'subtraction')) $adj = 'subtraction';
                }
                if ($adj === 'subtraction') {
                    $delta = -$qty;
                } else {
                    $delta = +$qty;
                }
            } elseif ($type === 'return') {
                $delta = +$qty;
            } elseif ($type === 'transfer') {
                // Aggregated card across locations: neutralize transfers
                $delta = 0.0;
            } else {
                // Unknown type -> neutral
                $delta = 0.0;
            }

            // Attach the computed delta
            $op->delta = $delta;
            return $op;
        });

        $netSum = $operationDeltas->sum('delta');

        // Opening balance so final balance equals current total in location
        $openingBalance = (float) $totalStockInLocation - (float) $netSum;

        // Build running balance sequence
        $running = 0.0;
        $operationsWithBalance = $operationDeltas->map(function ($op) use (&$running, $openingBalance) {
            $running += (float) $op->delta;
            $op->balance = $openingBalance + $running;
            return $op;
        });

        return Excel::download(new \App\Exports\StockCardLocationExport($operationsWithBalance, $stock, $totalStockInLocation), $fileName);
    }

    public function exportPdf(Stock $stock)
    {
        $range = request()->query('range', 'all');
        $exportRange = $range ?? 'all';

        if ($exportRange === '90d') {
            $cutoffDate = now()->subDays(90);
        } elseif ($exportRange === '180d') {
            $cutoffDate = now()->subDays(180);
        } elseif($exportRange === '1y') {
            $cutoffDate = now()->subYear();
        } else {
            $cutoffDate = null; // 'all' range
        }
        $exportTime = now()->format('Ymd_His');
        $fileName = $stock->product->sku . '_' . $stock->batch->batch_number . '_' . $stock->location->name . '_' . $exportTime . '.xlsx';

        $stock->load([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id,expiry_date,manufacture_date',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name']);

        $operations = Operation::with([
            'product:id,name,sku,product_type_id',
            'product.productType:id,name,type_code',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name',
            'batch:id,batch_number,supplier_id',
            'batch.supplier:id,partner_id',
            'batch.supplier.partner:id,name',
            'user:id,name'
        ])
        ->where('product_id', $stock->product_id)
        ->where('batch_id', $stock->batch_id)
        ->where('location_id', $stock->location_id)
        ->whereBetween('operation_date', [($cutoffDate ?? \Carbon\Carbon::parse('1900-01-01')), now()])
        ->orderBy('operation_date', 'asc')
        ->orderBy('id', 'asc')
        ->get();


        // Calculate opening balance based on total stock quantity from Stock model, one location
        $totalStockInLocation = $stock->quantity;

        $operationDeltas = $operations->map(function ($op) {
            $type = $op->operation_type;

            // Normalize types to your domain semantics
            // inbound => +qty, outbound => -qty, adjustment(addition) => +qty, adjustment(subtraction) => -qty,
            // return => +qty, transfer => 0 (when aggregating across locations)
            $qty = (float) $op->quantity;

            $delta = 0.0;
            if ($type === 'inbound') {
                $delta = +$qty;
            } elseif ($type === 'outbound') {
                $delta = -$qty;
            } elseif ($type === 'adjustment') {
                // When stored, remarks or a dedicated field may indicate addition/subtraction.
                // If you persist adjustmentType, use it here; otherwise infer from remarks.
                // Example assumes you have "addition"/"subtraction" in remarks, adjust to your actual data.
                $adj = null;
                if (isset($op->remarks)) {
                    $r = strtolower($op->remarks);
                    if (str_contains($r, 'addition')) $adj = 'addition';
                    if (str_contains($r, 'subtraction')) $adj = 'subtraction';
                }
                if ($adj === 'subtraction') {
                    $delta = -$qty;
                } else {
                    $delta = +$qty;
                }
            } elseif ($type === 'return') {
                $delta = +$qty;
            } elseif ($type === 'transfer') {
                // Aggregated card across locations: neutralize transfers
                $delta = 0.0;
            } elseif($type === 'transfer_in') {
                $delta = +$qty;
            } elseif($type === 'transfer_out') {
                $delta = -$qty;
            } else {
                // Unknown type -> neutral
                $delta = 0.0;
            }

            // Attach the computed delta
            $op->delta = $delta;
            return $op;
        });

        $netSum = $operationDeltas->sum('delta');

        // Opening balance so final balance equals current total in location
        $openingBalance = (float) $totalStockInLocation - (float) $netSum;

        // Build running balance sequence
        $running = 0.0;
        $operationsWithBalance = $operationDeltas->map(function ($op) use (&$running, $openingBalance) {
            $running += (float) $op->delta;
            $op->balance = $openingBalance + $running;
            return $op;
        });

        // Data periode
        $dataPeriode = $cutoffDate ? $cutoffDate->format('d/m/Y') . ' to ' . now()->format('d/m/Y') : 'All Time';

        // Use PDF
        return Excel::download(new \App\Exports\StockCardViewExport($operationsWithBalance, $stock, $dataPeriode), $fileName, \Maatwebsite\Excel\Excel::MPDF);
    }
}
