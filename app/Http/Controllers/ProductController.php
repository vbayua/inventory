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
        $products = Product::filter($filters)
            ->paginate(5)
            ->appends($filters)
            ->through(
                fn($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'created_at' => $product->created_at->diffForHumans(),
                    'updated_at' => $product->updated_at->diffForHumans(),
                ]
            );
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
        return Inertia::render('Products/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        Product::create($request->validate([
            'name' => ['required']
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
            'product' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validate([
            'name' => 'required'
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
