<?php

namespace App\Http\Controllers;

use App\DTO\StockData;
use App\Http\Requests\StoreOperationRequest;
use App\Http\Requests\UpdateOperationRequest;
use App\Models\Operation;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Warehouse;
use App\Service\BatchAssignmentService;
use App\Service\StockOperationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperationController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Operation::class, 'operation');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia('Operations/Index', [
            'operations' => Operation::with(['product', 'batch', 'location', 'user:id,name'])->latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $stock = Stock::with([
            'product:id,name,sku,unit',
            'product.unit:name,base_unit',
            'batch:id,product_id,batch_number,expiry_date',
            'location:id,name,warehouse_id',
            'location.warehouse:id,name'
        ])->get();
        $products = \App\Models\Product::with(['unit'])->select(['id', 'name', 'sku', 'unit'])->orderBy('sku')->get();
        // // // Ensure products are unique by ID only the products
        // $stock = $stock->unique('batch_id')->values();

        $batches = \App\Models\Batch::all(['id', 'product_id', 'batch_number', 'expiry_date']);

        $units = \App\Models\Unit::all(['name', 'unit_type', 'base_unit']);
        $warehouse = Warehouse::with(['locations'])->get();
        $locations = $warehouse->flatMap(fn ($w) => $w->locations)->unique('id')->values();
        $stockId = $request->get('stock_id');
        $operationType = $request->get('operation_type');
        $stockQuery = $stockId ? $stock->where('id', $stockId)->first() : null;

        $query = Product::query()
            ->when($request->search_term, function ($query, $search) use ($request) {
                $query->when($request->has_stock, function ($query) {
                    $query->whereHas('stocks');
                })
                ->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($request->has_stock, function ($query) {
                $query->withWhereHas('stocks', function ($query) {
                    $query->where('quantity', '>', 0);
                });
            })
            ->with('unit')
            ->select(['id', 'name', 'sku', 'unit'])
            ->paginate(10)
            ->onEachSide(1)
            ->withQueryString();

        $products = $query;
        // : Product::with('unit')->select(['id', 'name', 'sku', 'unit'])->orderBy('sku')->paginate(10)->onEachSide(1);
        return Inertia('Operations/Create', [
            'stocks' => $stock,
            'products' => $products,
            'batches' => $batches,
            'units' => $units,
            'warehouses' => $warehouse,
            'locations' => $locations,
            'stockQuery' => $stockQuery,
            'operationType' => $operationType,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOperationRequest $request, StockOperationService $operationService, BatchAssignmentService $batchAssignmentService)
    {

        $validatedData = $request->validated();

        $validatedData['batch'] = $batchAssignmentService->determineBatch(
            $validatedData['product'],
            $validatedData['batch'],
            $validatedData['operationType'],
            $validatedData['date']
        );
        $stockData = Stock::with(['product'])->where('product_id', $validatedData['product'])
            ->where('location_id', $validatedData['location'])
            ->when($validatedData['batch'], function ($query) use ($validatedData) {
                return $query->where('batch_id', $validatedData['batch']);
            })
            ->first();

        // Append with_container to stockData if provided
        if (isset($validatedData['with_container']) && $stockData) {
            $stockData->with_container = $validatedData['with_container'];
        }

        $operationQuantity = $validatedData['quantity'];
        $operationType = $validatedData['operationType'];

        if ($operationType === 'inbound') {
            if (! $stockData) {
                $stockData = StockData::fromArray([
                    'location_id' => $validatedData['location'],
                    'batch_id' => $validatedData['batch'],
                    'quantity' => $operationQuantity,
                    'minimum_quantity' => 0,
                    'unit' => $validatedData['unit'],
                    'status' => 'available',
                    'remarks' => 'Initial stock created',
                    'date' => $validatedData['date'],
                    'with_container' => $validatedData['with_container'] ?? false,
                    'container_quantity' => $validatedData['container_quantity'] ?? null,
                    'container_unit' => $validatedData['container_unit'] ?? null,
                ]);
            }

            $operationService->createStockOperation(
                'inbound',
                $validatedData['product'],
                $stockData,
                $operationQuantity,
                $validatedData['unit'],
                $validatedData['remarks'] ?? '',
                $validatedData['date'],
                $validatedData['with_container'] ?? false,
            );
        } elseif ($operationType === 'outbound') {
            // For outbound operations, we decrement the stock
            $operationService->createStockOperation(
                'outbound',
                $validatedData['product'],
                $stockData,
                $operationQuantity,
                $validatedData['unit'],
                $validatedData['remarks'] ?? '',
                $validatedData['date'],
                $validatedData['with_container'] ?? false,
            );
        } elseif ($operationType === 'adjustment') {
            $operationService->adjustStockOperation(
                $stockData,
                $operationQuantity,
                $validatedData['unit'],
                $validatedData['adjustmentType'],
                $validatedData['remarks']
            );
        } elseif ($operationType === 'transfer') {
            // $stockData['source_location_id'] = $validatedData['source_location'];
            // $stockData['destination_location_id'] = $validatedData['destination_location'];
            // $operationService->createTransferOperation(
            //     $stockData->product,
            //     $stockData,
            //     $operationQuantity,
            //     $validatedData['unit'],
            //     $validatedData['remarks'] ?? '',
            //     $validatedData['date'],
            // );


            // Call high-level transfer stock operation
            $test = $operationService->createTransferOperation(
                $stockData->product,
                $stockData->batch_id,
                $validatedData['source_location'],
                $validatedData['destination_location'],
                $operationQuantity,
                $validatedData['unit'],
                $validatedData['remarks'] ?? '',
                $validatedData['date'],
            );
        } else if($operationType === 'return') {
            if(!$stockData)
            {
                $stockData = [
                    'location_id' => $validatedData['location'],
                    'batch_id' => $validatedData['batch'],
                    'quantity' => $operationQuantity,
                    'minimum_quantity' => 0,
                    'unit' => $validatedData['unit'],
                    'status' => 'available',
                    'remarks' => 'Initial stock created from return operation',
                    'date' => $validatedData['date'],
                    'with_container' => $validatedData['with_container'] ?? false,
                    'container_quantity' => $validatedData['container_quantity'] ?? null,
                    'container_unit' => $validatedData['container_unit'] ?? null,
                ];
            }
            $operationService->createReturnOperation(
                $stockData->product ?? $validatedData['product'],
                $stockData,
                $operationQuantity,
                $validatedData['unit'],
                $validatedData['remarks'] ?? '',
                $validatedData['date'],
            );

        } else {
            return redirect()->back()->withErrors(['operationType' => 'Invalid operation type.']);
        }

        return redirect()->route('operations.index')->with('success', 'Operation created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Operation $operation)
    {
        $this->authorize('view', $operation);

        return Inertia('Operations/Show', [
            'operation' => $operation->load(['product', 'batch', 'location']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Operation $operation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOperationRequest $request, Operation $operation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Operation $operation)
    {
        //
    }
}
