<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Service\StockOperationService;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Service\BatchAssignmentService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Product::class);
        $products =  Cache::remember('products_index', 3600, function () {
            return Product::with(['categories:id,name', 'productType:id,type_code'])
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
        $this->authorize('create', Product::class);
        $suppliers = Inertia::lazy(function () {
            return Cache::remember('suppliers_list', 3600, function () {
                return \App\Models\Supplier::with('partner:id,name')->select('id', 'partner_id')->get();
            });
        });
        $partners = Inertia::lazy(function () {
            return Cache::remember('partners_list', 3600, function () {
                return \App\Models\Partner::select('id', 'name')->get();
            });
        });

        return Inertia::render('Products/Create', [
            'categories' => \App\Models\Category::select('id', 'name')->get(),
            'suppliers' => $suppliers,
            'units' => \App\Models\Unit::select('name')->get(),
            'product_types' => \App\Models\ProductType::select('id', 'name', 'type_code')->get(),
            'warehouses' => \App\Models\Warehouse::select('id', 'name')->get(),
            'locations' => \App\Models\Location::select('id', 'name', 'warehouse_id')->get(),
            'partners' => $partners,
        ]);
    }


    public function store(StoreProductRequest $request, StockOperationService $stockOperationService, BatchAssignmentService $batchService)
    {
        $this->authorize('create', Product::class);

        $request->merge([
            'category_id' => $request->category_id === 'none' ? null : $request->category_id,
            'supplier_id' => $request->supplier_id === 'none' ? null : $request->supplier_id,
        ]);


        $product = $request->safe()->except([
            'supplier_id',
            'location_id',
            'quantity',
            'minimum_quantity'
        ]);

        DB::beginTransaction();
        //  Create a default batch for the product
        $newProduct = new Product($product);
        $newProduct->save();
        if ($request->with_begin_stock) {
            $stockData = $request->safe()->only(
                [
                    'supplier_id',
                    'location_id',
                    'quantity',
                    'minimum_quantity'
                ]
            );

            // If with_begin_stock is true and stock is created then attach the product to the supplier.
            $newProduct->suppliers()->attach($request->supplier_id, [
                'price' => $request->price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $stock = $stockOperationService->createInitialStock($newProduct, $stockData);
            if (!$stock) {
                DB::rollback();
                throw ValidationException::withMessages([
                    'stock' => 'Failed to create stock'
                ]);
            }
        }
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
        $this->authorize('view', $product);
        $product->load([
            'suppliers:id,partner_id',
            'suppliers.partner:id,name',
        ]);
        $product->load('stocks');

        $totalStock = $product->getAllStockQty();
        $suppliers = $product->suppliers;
        // Product
        return Inertia::render('Products/Show', [
            'product' => $product,
            'suppliers' => $suppliers,
            'total_stock_qty' => $totalStock
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $this->authorize('update', $product);
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
        $this->authorize('update', $product);
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
        $this->authorize('delete', $product);
        $product->delete();
        return redirect()->route('products.index');
    }
}
