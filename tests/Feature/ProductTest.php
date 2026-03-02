<?php

use Database\Seeders\BlankStateSeeder;

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

test('sku follows the correct format', function () {
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

test('sku must start with a valid type code', function () {
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
    \Illuminate\Support\Facades\DB::table('product_types')->truncate();

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
