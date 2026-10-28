<?php

use App\Models\ProductType;
use Database\Seeders\BlankStateSeeder;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
});

it('stores a product type as assemblable', function () {
    asAdmin()
        ->post(route('product-types.store'), [
            'name' => 'Assembled Good',
            'description' => null,
            'type_code' => 'ASM',
            'disable_type_code' => false,
            'assemblable' => true,
        ])
        ->assertSessionHasNoErrors();

    expect(ProductType::where('type_code', 'ASM')->sole()->assemblable)->toBeTrue();
});

it('stores a product type as not assemblable when the flag is omitted', function () {
    asAdmin()
        ->post(route('product-types.store'), [
            'name' => 'Loose Material',
            'description' => null,
            'type_code' => 'NAS',
            'disable_type_code' => false,
        ])
        ->assertSessionHasNoErrors();

    expect(ProductType::where('type_code', 'NAS')->sole()->assemblable)->toBeFalse();
});

it('updates whether a product type is assemblable', function () {
    $productType = ProductType::factory()->create(['assemblable' => false]);

    asAdmin()
        ->put(route('product-types.update', $productType), [
            'name' => $productType->name,
            'description' => $productType->description,
            'type_code' => $productType->type_code,
            'assemblable' => true,
        ])
        ->assertSessionHasNoErrors();

    expect($productType->refresh()->assemblable)->toBeTrue();
});

it('rejects a non-boolean assemblable value', function () {
    asAdmin()
        ->post(route('product-types.store'), [
            'name' => 'Assembled Good',
            'description' => null,
            'type_code' => 'ASM',
            'disable_type_code' => false,
            'assemblable' => 'yes please',
        ])
        ->assertSessionHasErrors('assemblable');
});

it('stores a product type without a description', function () {
    asAdmin()
        ->post(route('product-types.store'), [
            'name' => 'Assembled Good',
            'type_code' => 'ASM',
            'disable_type_code' => false,
        ])
        ->assertSessionHasNoErrors();

    expect(ProductType::where('type_code', 'ASM')->sole()->description)->toBeNull();
});

it('keeps the description when an update omits it', function () {
    $productType = ProductType::factory()->create(['description' => 'Original description']);

    asAdmin()
        ->put(route('product-types.update', $productType), [
            'name' => 'Renamed',
            'type_code' => $productType->type_code,
        ])
        ->assertSessionHasNoErrors();

    expect($productType->refresh())
        ->name->toBe('Renamed')
        ->description->toBe('Original description');
});
