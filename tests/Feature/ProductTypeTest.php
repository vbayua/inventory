<?php

use App\Models\Location;
use App\Models\ProductType;
use Database\Seeders\BlankStateSeeder;
use Inertia\Testing\AssertableInertia;

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

it('provides warehouses and their locations to the product type forms', function (string $routeName, string $component) {
    $location = Location::factory()->create();
    $parameters = $routeName === 'product-types.edit' ? [ProductType::factory()->create()] : [];

    asAdmin()
        ->get(route($routeName, $parameters))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component($component, false)
            ->where('warehouses', fn ($warehouses) => $warehouses->contains('id', $location->warehouse_id))
            ->where('locations', fn ($locations) => $locations->contains(fn ($item) => $item['id'] === $location->id
                && $item['warehouse_id'] === $location->warehouse_id))
        );
})->with([
    'create' => ['product-types.create', 'ProductTypes/Create'],
    'edit' => ['product-types.edit', 'ProductTypes/Edit'],
]);

it('stores a product type with a default location', function () {
    $location = Location::factory()->create();

    asAdmin()
        ->post(route('product-types.store'), [
            'name' => 'Located Good',
            'type_code' => 'LOC',
            'disable_type_code' => false,
            'default_location_id' => $location->id,
        ])
        ->assertSessionHasNoErrors();

    expect(ProductType::where('type_code', 'LOC')->sole()->default_location_id)->toBe($location->id);
});

it('rejects an unknown default location', function () {
    asAdmin()
        ->post(route('product-types.store'), [
            'name' => 'Located Good',
            'type_code' => 'LOC',
            'disable_type_code' => false,
            'default_location_id' => 999999,
        ])
        ->assertSessionHasErrors('default_location_id');

    expect(ProductType::where('type_code', 'LOC')->exists())->toBeFalse();
});

it('updates the default location of a product type', function () {
    $productType = ProductType::factory()->create();
    $location = Location::factory()->create();

    asAdmin()
        ->put(route('product-types.update', $productType), [
            'name' => $productType->name,
            'type_code' => $productType->type_code,
            'default_location_id' => $location->id,
        ])
        ->assertSessionHasNoErrors();

    expect($productType->refresh()->default_location_id)->toBe($location->id);
});

it('clears the default location when an update submits it empty', function () {
    $productType = ProductType::factory()->create(['default_location_id' => Location::factory()->create()->id]);

    asAdmin()
        ->put(route('product-types.update', $productType), [
            'name' => $productType->name,
            'type_code' => $productType->type_code,
            'default_location_id' => '',
        ])
        ->assertSessionHasNoErrors();

    expect($productType->refresh()->default_location_id)->toBeNull();
});

it('keeps the default location when an update omits it', function () {
    $location = Location::factory()->create();
    $productType = ProductType::factory()->create(['default_location_id' => $location->id]);

    asAdmin()
        ->put(route('product-types.update', $productType), [
            'name' => $productType->name,
            'type_code' => $productType->type_code,
        ])
        ->assertSessionHasNoErrors();

    expect($productType->refresh()->default_location_id)->toBe($location->id);
});
