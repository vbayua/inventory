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
        $products =  Product::with(['categories:id,name', 'suppliers:id,name'])->orderBy('created_at', 'desc')->get();
        // dd($products);
        return Inertia::render('Products/Index', [
            'products' => $products,
            'name' => request()->name,
            'count' => Product::count()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => \App\Models\Category::select('id', 'name')->get(),
            'suppliers' => \App\Models\Supplier::select('id', 'name')->get(),
            'units' => \App\Models\Unit::select('name')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {


        $request->merge([
            'category_id' => $request->category_id === 'none' ? null : $request->category_id,
            'supplier_id' => $request->supplier_id === 'none' ? null : $request->supplier_id,
        ]);


        $product = Product::create($request->validate([
            'name' => ['required'],
            'sku' => ['nullable', 'string'],
            'unit' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'is_active' => ['nullable', 'boolean'],
        ]));

        $product->suppliers()->attach($request->supplier_id, [
            'price' => $request->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);


        if ($request->with_begin_stock) {
            $stockData = $request->validate(
                [
                    'location_id' => ['required', 'exists:locations,id'],
                    'quantity' => ['required', 'numeric', 'min:0'],
                ]
            );
            $stock = new \App\Models\Stock;
            $stock->product_id = $product->id;
            $stock->location_id = $stockData['location_id'];
            $stock->quantity = $stockData['quantity'];
            $stock->unit = $product->unit;
            $stock->status = 'available';
            $stock->remarks = 'Initial stock for ' . $product->name . ' created on ' . now()->format('Y-m-d H:i:s');
            // dd($stockData);
            $stock->save();
        }

        // dd($stock ?? null);
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
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'is_active' => ['nullable', 'boolean'],
        ]));
        $product->suppliers()->syncWithoutDetaching([
            $request->supplier_id => [
                'price' => $request->price,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

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
