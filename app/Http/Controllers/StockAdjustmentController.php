<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockAdjustmentRequest;
use App\Http\Requests\UpdateStockAdjustmentRequest;
use App\Models\StockAdjustment;
use App\Service\StockOperationService;
use Inertia\Inertia;

class StockAdjustmentController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(StockAdjustment::class, 'adjustment');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stockAdjustmentData = StockAdjustment::with([
            'stock:id,location_id,product_id,batch_id',
            'stock.product:id,name',
            'stock.location:id,name',
            'stock.batch:id,batch_number',
        ])->latest()->get();

        // dd($stockAdjustmentData);
        return Inertia::render('StockAdjustments/Index', [
            'stock_adjustments' => $stockAdjustmentData,
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
    public function store(StoreStockAdjustmentRequest $request, StockOperationService $stockOperationService)
    {
        $validated = $request->validated();
        $stockOperationService->adjustStockOperation(
            stock: $validated['stock_id'],
            quantity: $validated['quantity'],
            unit: $validated['unit'],
            type: $validated['adjustment_type'],
            remarks: $validated['remarks'],
            operationDate: now(),
        );

        return redirect()->route('stocks.index')->with('success', 'Stock adjustment recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(StockAdjustment $stockAdjustment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StockAdjustment $stockAdjustment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStockAdjustmentRequest $request, StockAdjustment $stockAdjustment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StockAdjustment $stockAdjustment)
    {
        //
    }
}
