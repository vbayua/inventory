<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Partner;
use App\Models\Product;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Suppliers/Index', [
            'suppliers' => Supplier::with('partner')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $relatedPartnerIds = Supplier::pluck('partner_id')->all();
        return Inertia::render('Suppliers/Create', [
            'partners' => Inertia::lazy(fn() => Partner::select('id', 'name')
                ->whereNotIn('id', $relatedPartnerIds)
                ->orderBy('name')
                ->get()),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupplierRequest $request)
    {
        $validated = $request->validated();
        Supplier::create($validated);

        return redirect()->route('supplier.index')->with('success', 'Supplier created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        $supplier->load(['products.categories', 'partner']);
        $productsFromSupplier = $supplier->products;
        $totalProducts = $productsFromSupplier->count();
        $relatedProductIds = $productsFromSupplier->pluck('id')->all();

        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
            'products' => $productsFromSupplier,
            'totalProducts' => $totalProducts,
            'allProducts' => Inertia::lazy(
                fn() => Product::select('id', 'name', 'sku')
                    ->whereNotIn('id', $relatedProductIds)
                    ->orderBy('name')
                    ->get()
            ),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Edit', [
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name
            ],
        ]);
    }

    public function assignProduct(Request $request, Supplier $supplier)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id', // Make sure every product ID is valid
        ]);

        $productIds = $request->input('product_ids');

        $supplier->products()->syncWithoutDetaching($productIds);

        return to_route('supplier.show', $supplier)->with('success', 'Products successfuly added to' . $supplier->name);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $validated = $request->validated();
        $supplier->update($validated);

        return redirect()->route('supplier.show', $supplier->id)
            ->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('supplier.index')->with('success', 'Supplier deleted successfully.');
    }
}
