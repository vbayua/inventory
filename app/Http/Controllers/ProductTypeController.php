<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductTypeRequest;
use App\Http\Requests\UpdateProductTypeRequest;
use App\Models\ProductType;
use App\Rules\Permissions\Product\ProductPermissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Inertia\Inertia;

use Illuminate\Http\Request;

class ProductTypeController extends Controller
{
    public function index(ProductPermissions $permissions)
    {
        return Inertia::render('ProductTypes/Index', [
            'productTypes' => ProductType::all(),
            $permissions
        ]);
    }

    public function show(ProductType $productType)
    {
        return Inertia::render('ProductTypes/Show', [
            'productType' => $productType
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
            'type_code' => $validated['type_code']
        ]);

        return redirect()->route('product-types.index')->with('success', 'Product Type created successfully.');
    }

    public function edit(ProductType $productType)
    {
        return Inertia::render('ProductTypes/Edit', [
            'productType' => $productType
        ]);
    }

    public function update(UpdateProductTypeRequest $request, ProductType $productType)
    {
        $validated = $request->validated();
        $productType->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'type_code' => $validated['type_code']
        ]);

        return redirect()->route('product-types.index')->with('success', 'Product Type updated successfully.');
    }
}
