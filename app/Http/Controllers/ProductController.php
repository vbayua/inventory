<?php

namespace App\Http\Controllers;

use App\DTO\StockData;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Location;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Unit;
use App\Rules\Permissions\Product\ProductPermissions;
use App\Service\BatchAssignmentService;
use App\Service\StockOperationService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Product::class, 'product');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(ProductPermissions $permissions)
    {
        // $this->authorize('viewAny', Product::class);
        $data = Product::with(['categories:id,name', 'productType:id,type_code'])
            ->orderBy('created_at', 'desc')
            ->get();
        // $products = Cache::remember('products_index', 3600, fn () => $data);

        return Inertia::render('Products/Index', [
            'products' => $data,
            'name' => request()->name,
            'count' => Product::count(),
        ])->with($permissions);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // $this->authorize('create', Product::class);
        $suppliers = Inertia::lazy(fn () => Cache::remember('suppliers_list', 300, fn () => \App\Models\Supplier::select('id', 'partner_id')->with('partner:id,name')->get())
        );
        // $suppliers = \App\Models\Supplier::select('id', 'partner_id')->with('partner:id,name')->get();
        $partners = Inertia::lazy(function () {
            return Cache::remember('partners_list', 3600, fn () => Partner::select('id', 'name')->get());
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
        $request->merge([
            'category_id' => $request->category_id === 'none' ? null : $request->category_id,
            'supplier_id' => $request->supplier_id === 'none' ? null : $request->supplier_id,
        ]);

        $product = $request->safe()->except([
            'warehouse_id',
            'location_id',
            'quantity',
            'minimum_quantity',
        ]);

        // Check if product type is the same as the sku prefix
        $productType = \App\Models\ProductType::find($request->product_type_id);
        if ($productType && !str_starts_with($request->sku, $productType->type_code)) {
            throw ValidationException::withMessages([
                'sku' => "Item code must start with the product type code: $productType->type_code",
            ]);
        }

        DB::beginTransaction();
        //  Create a default batch for the product
        $newProduct = new Product($product);
        $newProduct->save();
        if ($request->has_supplier) {
            $newProduct->suppliers()->attach($request->supplier_id, [
                'price' => $request->price,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        if ($request->with_begin_stock) {
            $stockData = StockData::fromArray($request->safe()->only(
                [
                    'unit',
                    'supplier_id',
                    'warehouse_id',
                    'location_id',
                    'quantity',
                    'minimum_quantity',
                    'container_capacity',
                    'container_unit',
                ]
            ));

            $stock = $stockOperationService->createInitialStock($newProduct, $stockData);
            if (! $stock) {
                DB::rollback();
                throw ValidationException::withMessages([
                    'stock' => 'Failed to create stock',
                ]);
            }
        }
        DB::commit();

        return redirect()->route('products.index')
            ->with('success', 'Product Created Sucessfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // $this->authorize('view', $product);
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
            'total_stock_qty' => $totalStock,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        // $this->authorize('update', $product);
        $categories = Cache::remember('categories_list', 3600, fn () => Category::select('id', 'name')->get()
        );
        $locations = Cache::remember('locations_list', 3600, fn () => Location::select('id', 'name', 'warehouse_id')->with('warehouse:id,name')->get()
        );
        $units = Cache::remember('units_list', 3600, fn () => Unit::select('name')->get()
        );
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'locations' => $locations,
            'units' => $units,
            'productHasStock' => $product->stocks()->exists(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());
        Cache::forget('products_index');

        return redirect()->route('products.index')
            ->with('success', 'Product Updated Sucessfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // $this->authorize('delete', $product);
        $product->delete();

        return redirect()->route('products.index');
    }
}
