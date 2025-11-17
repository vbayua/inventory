<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use App\Service\BatchAssignmentService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BatchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Batches/Index', [
            'batches' => Batch::with('product:id,name')->orderBy('created_at', 'desc')->get(),
            'count' => Batch::count(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Batches/Create', [
            'products' => \App\Models\Product::select('id', 'name', 'sku')->with(
                'suppliers:id,partner_id',
                'suppliers.partner:id,name'
            )->get(),
            'suppliers' => \App\Models\Supplier::with('partner:id,name')->select('id', 'partner_id')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBatchRequest $request, BatchAssignmentService $batchAssignmentService)
    {
        DB::transaction(function () use ($request, $batchAssignmentService) {
            $batch = $request->validated();
            $batchAssignmentService->determineBatch($batch['product_id'], supplierId: $batch['supplier_id']);
        });

        return redirect()->route('batch.index')->with('success', 'Batch created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Batch $batch)
    {
        $batch->load(['product:id,name', 'supplier:id,name']);
        return Inertia::render('Batches/Show', ['batch' => $batch]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Batch $batch)
    {
        $batch->load('product', 'supplier');
        return Inertia::render('Batches/Edit', [
            'product' => $batch->product,
            'batch' => $batch,
            'supplier' => $batch->supplier
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBatchRequest $request, Batch $batch)
    {
        DB::transaction(function () use ($request, $batch) {
            $validated = $request->validated();
            $batch->update($validated);
        });
        return redirect()->route('batch.show', $batch->id)->with('success', 'Batch Updated Successfuly');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Batch $batch)
    {
        //
    }
}
