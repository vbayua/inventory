<?php

use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Tests\TestCase;

function asAdmin(): TestCase
{
    $user = User::factory()->admin()->create();

    return test()->actingAs($user);
}

function asNonAdmin(): TestCase
{
    $user = User::factory()->operator()->create();

    return test()->actingAs($user);
}

function asNoRole(): TestCase
{
    $user = User::factory()->create();

    return test()->actingAs($user);
}

function withSession(array $data): TestCase
{
    return test()->withSession($data);
}

function productWithSupplier(?array $attributes = []): Product
{
    if (!isset($attributes['product_type_id'])) {
        $attributes['product_type_id'] = rand(1, 4);
    }
    $skuPrefix = match ($attributes['product_type_id'] ?? null) {
        1 => 'RMP',
        2 => 'PP',
        3 => 'PS',
        4 => 'PT',
        default => 'GEN',
    };

    $attributes = [
        ...$attributes,
        'sku' => $skuPrefix.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
    ];

    $product = Product::factory()->create($attributes);
    $supplier = Supplier::factory()->create();
    $product->suppliers()->attach($supplier->id, [
        'price' => 10.0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    return $product;
}
