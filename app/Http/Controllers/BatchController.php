<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
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
    public function store(StoreBatchRequest $request)
    {
        DB::transaction(function () use ($request) {
            $batch = $request->validated();
            // $product = \App\Models\Product::findOrFail($batch['product_id']);

            $originalBatchNumber = $batch['batch_number'];
            $newBatchNumber = $originalBatchNumber;
            $counter = 1;

            while (Batch::where('batch_number', $newBatchNumber)->exists()) {
                $newBatchNumber = $originalBatchNumber . $counter;
                $counter++;
            }

            $batch['batch_number'] = $newBatchNumber;

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
