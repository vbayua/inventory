<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOperationRequest;
use App\Http\Requests\UpdateOperationRequest;
use App\Models\Operation;
use App\Models\Stock;
use App\Service\BatchAssignmentService;
use App\Service\StockOperationService;
use Illuminate\Http\Request;

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
        $this->authorize('viewAny', Operation::class);

        return Inertia('Operations/Index', [
            'operations' => Operation::with(['product', 'batch', 'location', 'user:id,name'])->latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Caches
        $this->authorize('create', Operation::class);

        $stock = \App\Models\Stock::with(['product.unit'])
            ->select([
                'id',
                'product_id',
                'batch_id',
                'location_id',
                'quantity',
                'unit',
                'sku',
            ])
            ->get();
        $products = \App\Models\Product::with(['unit'])->select(['id', 'name', 'sku', 'unit'])->get();
        // // // Ensure products are unique by ID only the products
        // $stock = $stock->unique('batch_id')->values();

        $batches = \App\Models\Batch::all(['id', 'product_id', 'batch_number', 'expiry_date']);

        $units = \App\Models\Unit::all(['name', 'unit_type', 'base_unit']);
        $locations = \App\Models\Location::all(['id', 'name']);
        $stockId = $request->get('stock_id');
        $operationType = $request->get('operation_type');
        $stockQuery = $stockId ? $stock->where('id', $stockId)->first() : null;

        return Inertia('Operations/Create', [
            'stocks' => $stock,
            'products' => $products,
            'batches' => $batches,
            'units' => $units,
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
        $this->authorize('create', Operation::class);

        $validatedData = $request->validate([
            'operationType' => 'required|in:inbound,outbound,adjustment,transfer',
            'adjustmentType' => 'required|in:addition,subtraction',
            'product' => 'required|exists:products,id',
            'location' => 'required_unless:operationType,transfer|exists:locations,id',
            'batch' => 'required|exists:batches,id',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|exists:units,name',
            'date' => 'required|date',
            'remarks' => 'nullable|string|max:255',
            'source_location' => 'nullable|required_if:operationType,transfer|exists:locations,id',
            'destination_location' => 'nullable|required_if:operationType,transfer|exists:locations,id',
            'with_container' => 'nullable|boolean',
            'container_quantity' => 'nullable|numeric|min:0',
            'container_unit' => 'nullable|exists:units,name',
        ]);

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
                $stockData = [
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
                ];
                $operationService->createInitialStock(
                    $validatedData['product'],
                    $stockData
                );
            } else {
                // For inbound operations, call the service for inbound operations
                $operationService->createInboundOperation(
                    $stockData->product,
                    $stockData,
                    $operationQuantity,
                    $validatedData['unit'],
                    $validatedData['remarks'] ?? '',
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
                $validatedData['remarks'] ?? '',
                $validatedData['date'],
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

            dd($test);

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
