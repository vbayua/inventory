<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use App\Service\BatchAssigmentService;
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
            'products' => \App\Models\Product::select('id', 'name', 'sku')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBatchRequest $request, BatchAssigmentService $batchAssigmentService)
    {
        DB::transaction(function () use ($request, $batchAssigmentService) {
            $batch = $request->validated();
            $batch['batch_number'] = $batchAssigmentService->generateBatchNumber(
                $batch['product_id'],
                $batch['batch_number']
            );
            Batch::create($batch);
        });


        return redirect()->route('batch.index')->with('success', 'Batch created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Batch $batch)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Batch $batch)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBatchRequest $request, Batch $batch)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Batch $batch)
    {
        //
    }
}
