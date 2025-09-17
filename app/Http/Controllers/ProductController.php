<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Service\StockOperationService;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Service\BatchAssignmentService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products =  Cache::remember('products_index', 3600, function () {
            return Product::with(['categories:id,name', 'suppliers:id,name', 'productType:id,type_code'])
                ->orderBy('created_at', 'desc')
                ->get();
        });

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
        $categories = Cache::remember('categories_list', 3600, function () {
            return \App\Models\Category::select('id', 'name')->get();
        });
        $warehouses = Cache::remember('warehouses_list', 3600, function () {
            return \App\Models\Warehouse::select('id', 'name')->get();
        });
        $locations = \App\Models\Location::select('id', 'name', 'warehouse_id')->get();
        $suppliers = Cache::remember('suppliers_list', 3600, function () {
            return \App\Models\Supplier::select('id', 'name')->get();
        });
        $units = Cache::remember('units_list', 3600, function () {
            return \App\Models\Unit::select('name')->get();
        });
        $product_types = Cache::remember('product_type_list', 3600, function () {
            return \App\Models\ProductType::select('id', 'name', 'type_code')->get();
        });
        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'suppliers' => $suppliers,
            'units' => $units,
            'product_types' => $product_types,
            'warehouses' => $warehouses,
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request, StockOperationService $stockOperationService, BatchAssignmentService $batchService)
    {


        $request->merge([
            'category_id' => $request->category_id === 'none' ? null : $request->category_id,
            'supplier_id' => $request->supplier_id === 'none' ? null : $request->supplier_id,
        ]);


        $product = $request->validate([
            'name' => ['required'],
            'sku' => ['nullable', 'string'],
            'unit' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'is_active' => ['required', 'boolean'],
            'product_type_id' => ['required', 'exists:product_types,id'],
            'brand_name' => ['nullable', 'string'],
            'scientific_name' => ['nullable', 'string'],
        ]);

        DB::beginTransaction();
        //  Create a default batch for the product
        $newProduct = new Product($product);
        $newProduct->save();
        if ($request->with_begin_stock) {
            $stockData = $request->validate(
                [
                    'location_id' => ['required', 'exists:locations,id'],
                    'quantity' => ['required', 'numeric', 'min:0'],
                    'minimum_quantity' => ['required', 'numeric', 'min:0'],
                ]
            );
            $stock = $stockOperationService->createInitialStock($newProduct, $stockData);
            if (!$stock) {
                DB::rollback();
                throw new \Exception("Failed to create stock");
            }
        }
        $newProduct->suppliers()->attach($request->supplier_id, [
            'price' => $request->price,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::commit();
        Cache::forget('products_index');
        return redirect()->route('products.index')
            ->with('success', 'Product Created Sucessfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load('suppliers:id,name');
        return Inertia::render('Products/Show', ['product' => $product]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories = Cache::remember('categories_list', 3600, function () {
            return \App\Models\Category::select('id', 'name')->get();
        });
        $locations = Cache::remember('locations_list', 3600, function () {
            return \App\Models\Location::select('id', 'name')->get();
        });
        $suppliers = Cache::remember('suppliers_list', 3600, function () {
            return \App\Models\Supplier::select('id', 'name')->get();
        });
        $units = Cache::remember('units_list', 3600, function () {
            return \App\Models\Unit::select('name')->get();
        });
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'locations' => $locations,
            'suppliers' => $suppliers,
            'units' => $units,
            'productHasStock' => $product->stocks()->exists(),
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
            'brand_name' => ['nullable', 'string'],
            'scientific_name' => ['nullable', 'string'],
        ]));
        $product->suppliers()->syncWithoutDetaching([
            $request->supplier_id => [
                'price' => $request->price,
                'updated_at' => now(),
            ]
        ]);
        Cache::forget('products_index');
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
