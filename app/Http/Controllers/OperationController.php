<?php

namespace App\Http\Controllers;

use App\Models\Operation;
use App\Http\Requests\StoreOperationRequest;
use App\Http\Requests\UpdateOperationRequest;
use App\Service\StockOperationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OperationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia('Operations/Index', [
            'operations' => Operation::with(['product', 'batch', 'location'])->latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Caches

        $stock = Cache::remember('stocks', 60, function () {
            return \App\Models\Stock::with(['product.unit'])
                ->select([
                    "id",
                    "product_id",
                    "batch_id",
                    "location_id",
                    "quantity",
                    "unit",
                    "sku"
                ])
                ->get();
        });

        // // // Ensure products are unique by ID only the products
        // $stock = $stock->unique('batch_id')->values();

        $batches = Cache::remember('batches', 60, function () {
            return \App\Models\Batch::all(['id', 'product_id', 'batch_number', 'expiry_date']);
        });

        $units = Cache::remember('units', 60, function () {
            return \App\Models\Unit::all(['name', 'unit_type', 'base_unit']);
        });
        $locations = Cache::remember('locations', 60, function () {
            return \App\Models\Location::all(['id', 'name']);
        });

        return Inertia('Operations/Create', [
            'stocks' => $stock,
            'batches' => $batches,
            'units' => $units,
            'locations' => $locations,
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
            'unit' => 'required|exists:units,name',
            'date' => 'required|date',
            'remarks' => 'nullable|string|max:255',
        ]);

        $stockData = \App\Models\Stock::with(['product'])->where('product_id', $validatedData['product'])
            ->where('location_id', $validatedData['location'])
            ->when($validatedData['batch'], function ($query) use ($validatedData) {
                return $query->where('batch_id', $validatedData['batch']);
            })
            ->first();

        $operationQuantity = $validatedData['quantity'];
        $operationType = $validatedData['operationType'];

        if ($operationType === 'inbound') {
            if (!$stockData) {
                $stockData = $operationService->createInitialStock(
                    $validatedData['product'],
                    [
                        'location_id' => $validatedData['location'],
                        'batch_id' => $validatedData['batch'],
                        'quantity' => $operationQuantity,
                        'unit' => $validatedData['unit'],
                        'status' => 'available',
                        'remarks' => 'Initial stock created',
                        'date' => $validatedData['date'],
                    ]
                );
            } else {
                // For inbound operations, call the service for inbound operations
                $operationService->createInboundOperation(
                    $stockData->product,
                    $stockData,
                    $operationQuantity,
                    $validatedData['unit'],
                    $validatedData['remarks'],
                    $validatedData['date'],
                );
            }
        } elseif ($operationType === 'outbound') {
            // For outbound operations, we decrement the stock
            $operationService->createOutboundOperation(
                $stockData->product,
                $stockData,
                $operationQuantity,
                $validatedData['unit'],
                $validatedData['remarks'],
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
