<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Models\Operation;
use App\Models\Stock;
use App\Service\StockOperationService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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
        ->latest()
        ->get();
        // $operations = Inertia::lazy(fn() => $operationsData);

        $stockQuery = Stock::where('product_id', $stock->product_id)
            ->where('batch_id', $stock->batch_id);

        $totalLocations = $stockQuery->distinct('location_id')->count();
        $totalStockQuantityAcrossLocations = $stockQuery->sum('quantity');

        return Inertia('Stocks/StockCard', [
            'stock' => $stock->load([
                'product:id,name,sku,product_type_id',
                'product.productType:id,name,type_code',
                'location:id,name,warehouse_id',
                'location.warehouse:id,name',
                'batch:id,batch_number,supplier_id',
                'batch.supplier:id,partner_id',
                'batch.supplier.partner:id,name',
                'user:id,name']),
            'operations' => $operations,
            'total_locations' => $totalLocations,
            'total_stock_quantity_across_locations' => $totalStockQuantityAcrossLocations,
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
}
