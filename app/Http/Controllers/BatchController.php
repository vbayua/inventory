<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBatchRequest;
use App\Http\Requests\UpdateBatchRequest;
use App\Models\Batch;
use App\Models\Product;
use App\Models\Supplier;
use App\Service\BatchAssignmentService;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Validators\ValidationException;

class BatchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Batches/Index', [
            'batches' => Batch::with('product:id,name,sku')->orderBy('created_at', 'desc')->get(),
            'count' => Batch::count(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Batches/Create', [
            'products' => Product::select('id', 'name', 'sku')->with(
                'suppliers:id,partner_id',
                'suppliers.partner:id,name'
            )->get(),
            'suppliers' => Supplier::with('partner:id,name')->select('id', 'partner_id')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBatchRequest $request, BatchAssignmentService $batchAssignmentService)
    {
        try {
            DB::transaction(function () use ($request, $batchAssignmentService) {
                $batch = $request->validated();
                $operationDate = $batch['operation_date'] ?? now();
                $batchAssignmentService->determineBatch(
                    $batch['product_id'],
                    operationDate: $operationDate,
                    supplierId: $batch['supplier_id'],
                    minQty: $batch['minimum_quantity'] ?? 0,
                    manufactureDate: $batch['manufacture_date'] ?? null,
                    expiryDate: $batch['expiry_date'] ?? null,
                );
            });
        } catch (ModelNotFoundException $e) {
            return redirect()->route('batch.index')->with('error', 'Product not found.');
        } catch (ValidationException $e) {
            return redirect()->route('batch.index')->with('error', $e->getMessage());
        } catch (Exception $e) {
            return back()->withErrors($e->getMessage());
        }

        return redirect()->route('batch.index')->with('success', 'Batch created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Batch $batch)
    {
        $batch->load(['product:id,name', 'supplier:id,partner_id', 'supplier.partner:id,name']);

        return Inertia::render('Batches/Show', ['batch' => $batch]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Batch $batch)
    {
        $batch->load('product:id,name', 'supplier:id,partner_id', 'supplier.partner:id,name');

        return Inertia::render('Batches/Edit', [
            'product' => $batch->product,
            'batch' => $batch,
            'supplier' => $batch->supplier,
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
