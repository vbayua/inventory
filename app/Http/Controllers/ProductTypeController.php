<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductTypeRequest;
use App\Http\Requests\UpdateProductTypeRequest;
use App\Models\Location;
use App\Models\ProductType;
use App\Rules\Permissions\Product\ProductPermissions;
use Inertia\Inertia;

class ProductTypeController extends Controller
{
    public function index(ProductPermissions $permissions)
    {
        return Inertia::render('ProductTypes/Index', [
            'productTypes' => ProductType::all(),
            $permissions,
        ]);
    }

    public function show(ProductType $productType)
    {
        return Inertia::render('ProductTypes/Show', [
            'productType' => $productType,
            'locations' => Location::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('ProductTypes/Create');
    }

    public function store(StoreProductTypeRequest $request)
    {
        $validated = $request->validated();

        ProductType::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'type_code' => $validated['type_code'],
        ]);

        return redirect()->route('product-types.index')->with('success', 'Product Type created successfully.');
    }

    public function edit(ProductType $productType)
    {
        return Inertia::render('ProductTypes/Edit', [
            'productType' => $productType,
        ]);
    }

    public function update(UpdateProductTypeRequest $request, ProductType $productType)
    {
        $validated = $request->validated();
        $productType->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'type_code' => $validated['type_code'],
        ]);

        return redirect()->route('product-types.index')->with('success', 'Product Type updated successfully.');
    }

    public function updateSettings(UpdateProductTypeRequest $request, ProductType $productType)
    {
        $validated = $request->validated();
        $productType->update([
            'batch_interval_days' => $validated['batch_interval_days'],
            'default_location_id' => $validated['default_location_id'],
        ]);

        return redirect()->route('product-types.show', $productType)->with('success', 'Product Type settings updated successfully.');
    }
}
