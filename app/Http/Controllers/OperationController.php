<?php

namespace App\Http\Controllers;

use App\Models\Operation;
use App\Http\Requests\StoreOperationRequest;
use App\Http\Requests\UpdateOperationRequest;
use App\Service\StockOperationService;
use Illuminate\Http\Request;

class OperationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia('Operations/Index', [
            'operations' => Operation::with(['product'])->latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $stock = \App\Models\Stock::with(['product'])
            ->where('status', 'available')
            ->where('quantity', '>', 0)
            ->select(['id', 'product_id', 'batch_id', 'location_id', 'quantity', 'unit', 'sku'])
            ->get();
        return Inertia('Operations/Create', [
            'stocks' => $stock,
            'batches' => \App\Models\Batch::all(['id', 'product_id', 'batch_number', 'expiry_date']),
            'units' => \App\Models\Unit::all(['name', 'unit_type']),
            'locations' => \App\Models\Location::all(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOperationRequest $request, StockOperationService $operationService)
    {
        $validatedData = $request->validate([
            'operationType' => 'required|in:inbound,outbound',
            'product' => 'required|exists:products,id',
            'location' => 'required|exists:locations,id',
            'batch' => 'nullable|exists:batches,id',
            'quantity' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:255',
        ]);

        $stockData = \App\Models\Stock::with(['product'])->where('product_id', $validatedData['product'])
            ->where('location_id', $validatedData['location'])
            ->when($validatedData['batch'], function ($query) use ($validatedData) {
                return $query->where('batch_id', $validatedData['batch']);
            })
            ->firstOrFail();

        $operationQuantity = $validatedData['quantity'];
        $operationType = $validatedData['operationType'];

        if ($operationType === 'inbound') {
            // For inbound operations, call the service for inbound operations
            $operationService->createInboundOperation(
                $stockData->product,
                $stockData,
                $operationQuantity,
                $validatedData['remarks']
            );
        } elseif ($operationType === 'outbound') {
            // For outbound operations, we decrement the stock
            $operationService->createOutboundOperation(
                $stockData->product,
                $stockData,
                $operationQuantity,
                $validatedData['remarks']
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
        //
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
