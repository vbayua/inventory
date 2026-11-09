<?php

use App\Models\Product;
use App\Models\Supplier;
use Database\Seeders\BlankStateSeeder;

use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
});

it('updates the default price of a product assigned to the supplier', function () {
    $product = productWithSupplier();
    $supplier = $product->suppliers->first();

    asAdmin()->put(route('supplier.products.update-price', [$supplier, $product]), ['price' => 25000])
        ->assertRedirect(route('supplier.show', $supplier));

    assertDatabaseHas('products_suppliers', [
        'product_id' => $product->id,
        'supplier_id' => $supplier->id,
        'price' => 25000,
    ]);
});

it('rejects an invalid price', function () {
    $product = productWithSupplier();
    $supplier = $product->suppliers->first();

    asAdmin()->put(route('supplier.products.update-price', [$supplier, $product]), ['price' => -1])
        ->assertSessionHasErrors('price');
});

it('returns not found for a product not assigned to the supplier', function () {
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();

    asAdmin()->put(route('supplier.products.update-price', [$supplier, $product]), ['price' => 25000])
        ->assertNotFound();
});

it('forbids users without permission from updating the price', function () {
    $product = productWithSupplier();
    $supplier = $product->suppliers->first();

    asNoRole()->put(route('supplier.products.update-price', [$supplier, $product]), ['price' => 25000])
        ->assertForbidden();
});
