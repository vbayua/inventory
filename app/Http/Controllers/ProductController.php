<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $filters = request()->only('name');
        $products = Product::orderBy('created_at', 'desc')->with(['categories', 'suppliers', 'locations'])->filter($filters)
            ->paginate(10)
            ->appends($filters)
            ->through(
                fn($product) => [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'unit' => $product->unit,
                    'name' => $product->name,
                    'category' => $product->categories ? $product->categories->name : null,
                    'location' => $product->locations ? $product->locations->name : null,
                    // 'supplier' => $product->suppliers->map(fn($supplier) => [
                    //     'id' => $supplier->id,
                    //     'name' => $supplier->name,
                    //     'price' => $supplier->pivot->price,
                    //     'created_at' => $supplier->pivot->created_at->diffForHumans(),
                    //     'updated_at' => $supplier->pivot->updated_at->diffForHumans(),
                    // ]),
                    'created_at' => $product->created_at->diffForHumans(),
                    'updated_at' => $product->updated_at->diffForHumans(),
                ]
            );
        // dd($products);
        return Inertia::render('Products/Index', [
            'products' => $products,
            'name' => request()->name,
            'count' => Product::count()
        ]);
        // return Inertia::render('Products/Index', [
        //     'products' => Product::paginate(5)->through(fn($product) => [
        //         'id' => $product->id,
        //         'name' => $product->name,
        //         'created_at' => $product->created_at->diffForHumans(),
        //         'updated_at' => $product->updated_at->diffForHumans(),
        //     ]),
        //     'filters' => request()->all('search'),
        //     'count' => Product::count()
        // ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => \App\Models\Category::select('id', 'name')->get(),
            'locations' => \App\Models\Location::select('id', 'name')->get(),
            'suppliers' => \App\Models\Supplier::select('id', 'name')->get(),
            'units' => \App\Models\Unit::select('name')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        Product::create($request->validate([
            'name' => ['required'],
            'sku' => ['nullable', 'string'],
            'unit' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'is_active' => ['nullable', 'boolean'],
        ]));

        return redirect()->route('products.index')
            ->with('success', 'Product Created Sucessfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return Inertia::render('Products/Show', ['product' => $product]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => \App\Models\Category::select('id', 'name')->get(),
            'locations' => \App\Models\Location::select('id', 'name')->get(),
            'suppliers' => \App\Models\Supplier::select('id', 'name')->get(),
            'units' => \App\Models\Unit::select('name')->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validate([
            'name' => ['required'],
            'sku' => ['nullable', 'string'],
            'unit' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'is_active' => ['nullable', 'boolean'],
        ]));

        return redirect()->route('products.index')
            ->with('success', 'Product Updated Sucessfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index');
    }
}
