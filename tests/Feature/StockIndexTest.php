<?php

use App\Models\Location;
use App\Models\Product;
use App\Models\Stock;
use Database\Seeders\AuthorizationSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

/**
 * Creates a stock line with the given status for a new product in the given location.
 */
function indexStock(Location $location, string $status): Stock
{
    return Stock::factory()->create([
        'product_id' => Product::factory()->create()->id,
        'location_id' => $location->id,
        'quantity' => 10,
        'minimum_quantity' => 0,
        'unit' => 'pcs',
        'status' => $status,
    ]);
}

test('defers the stock list and status counts on first render', function () {
    asAdmin()->get(route('stocks.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Stocks/Index')
            ->missing('stocks')
            ->missing('total_items')
            ->missing('total_locations')
            ->missing('available_stocks')
            ->missing('low_stocks')
            ->missing('out_of_stock')
        );
});

test('loads the stock status counts as deferred props', function () {
    $firstLocation = Location::factory()->create();
    $secondLocation = Location::factory()->create();
    indexStock($firstLocation, 'available');
    indexStock($firstLocation, 'available');
    indexStock($secondLocation, 'low_stock');
    indexStock($secondLocation, 'out_of_stock');

    asAdmin()->get(route('stocks.index'))
        ->assertInertia(fn (Assert $page) => $page->loadDeferredProps('stats', fn (Assert $reload) => $reload
            ->where('total_items', 4)
            ->where('total_locations', 2)
            ->where('available_stocks', 2)
            ->where('low_stocks', 1)
            ->where('out_of_stock', 1)
        ));
});
