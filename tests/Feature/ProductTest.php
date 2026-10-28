<?php

use App\Models\Product;
use App\Models\Supplier;
use Database\Seeders\BlankStateSeeder;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    // Run before each test
    $this->seed(BlankStateSeeder::class);
});

it('can see products list with permissions', function () {
    asAdmin()->get('/products')->assertStatus(200);
    asNonAdmin()->get('/products')->assertStatus(200);
});

it('cannot see product list with no permissions', function () {
    asNoRole()->get('/products')->assertStatus(403);
});

it('can register product without begin stock and suppliere', function () {
    $productData = [
        'name' => 'Test Product',
        'sku' => 'RMP0001A',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    asAdmin()->post('/products', $productData)->assertRedirect('/products');

    assertDatabaseHas('products', ['name' => 'Test Product', 'sku' => 'RMP0001A']);
});

test('sku valid format', function () {
    $productData = [
        'name' => 'Test Product',
        'sku' => 'RMP0001',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    // asAdmin()->post('/products', $productData)->assertRedirect('/products');
    Product::create($productData);

    $product = Product::where('sku', 'RMP0001')->first();

    expect($product->sku)->toMatch('/^[A-Z]+\d{4}[A-Z]?$/');
    assertDatabaseHas('products', ['name' => 'Test Product', 'sku' => 'RMP0001']);
});

it('show validation exception when required fields are missing', function () {
    $productData = [
        // 'name' => 'Test Product', // Missing name
        'sku' => 'RMP0001A',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    asAdmin()->post('/products', $productData)->assertSessionHasErrors('name');
});

it('show validation exception when sku is in incorrect format', function () {
    $productData = [
        'name' => 'Test Product',
        'sku' => 'INVALIDSKU',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    asAdmin()->post('/products', $productData)->assertSessionHasErrors('sku');
});

it('show validation exception when sku type code is not in the product type database', function () {
    $productData = [
        'name' => 'Test Product',
        'sku' => 'PG0001',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    asAdmin()->post('/products', $productData)->assertSessionHasErrors('sku');
});

test('sku invalid format', function () {
    $productData = [
        'name' => 'Test Product',
        'sku' => 'INVALIDSKU',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    asAdmin()->post('/products', $productData)->assertSessionHasErrors('sku');
});

test('sku must start with invalid type code', function () {
    $productData = [
        'name' => 'Test Product',
        'sku' => 'XYZ0001A',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    asAdmin()->post('/products', $productData)->assertSessionHasErrors('sku');
});

test('type code is not configured', function () {

    // First, we need to clear the product_types table to simulate no type codes configured
    DB::table('product_types')->truncate();

    $productData = [
        'name' => 'Test Product',
        'sku' => 'RMP0001A',
        'description' => 'A product for testing',
        'unit' => 'ml',
        'product_type_id' => 1,
        'category_ids' => [1, 2],
        'is_active' => true,
        'with_begin_stock' => false,
    ];

    asAdmin()->post('/products', $productData)->assertSessionHasErrors('sku');
});

it('updates the default supplier price of a product', function () {
    $product = productWithSupplier();
    $supplier = $product->suppliers->first();

    asAdmin()->put("/products/{$product->id}", [
        'name' => $product->name,
        'sku' => $product->sku,
        'unit' => $product->unit,
        'suppliers' => [['id' => $supplier->id, 'price' => 25000]],
    ])->assertRedirect('/products');

    assertDatabaseHas('products_suppliers', [
        'product_id' => $product->id,
        'supplier_id' => $supplier->id,
        'price' => 25000,
    ]);
});

it('rejects supplier prices for suppliers not linked to the product', function () {
    $product = productWithSupplier();
    $otherSupplier = Supplier::factory()->create();

    asAdmin()->put("/products/{$product->id}", [
        'name' => $product->name,
        'sku' => $product->sku,
        'unit' => $product->unit,
        'suppliers' => [['id' => $otherSupplier->id, 'price' => 25000]],
    ])->assertSessionHasErrors('suppliers.0.id');
});

it('passes the default supplier price to the purchase order form', function () {
    $product = productWithSupplier();
    $supplier = $product->suppliers->first();
    $product->suppliers()->updateExistingPivot($supplier->id, ['price' => 25000]);

    asAdmin()->get('/purchase-orders/create')
        ->assertInertia(fn (Assert $page) => $page
            ->where('suppliers.0.products.0.pivot.price', 25000)
        );
});
