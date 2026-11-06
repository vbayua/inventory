<?php

use App\Models\Batch;
use App\Models\Location;
use App\Models\Operation;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Stock;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\travelTo;

/**
 * Creates a stock line for a new product in the given location.
 *
 * @param  array<string, mixed>  $attributes
 */
function dashboardStock(Location $location, array $attributes = [], ?Batch $batch = null): Stock
{
    $product = $batch?->product ?? Product::factory()->create();

    return Stock::factory()->create([
        'product_id' => $product->id,
        'location_id' => $location->id,
        'batch_id' => $batch?->id,
        'quantity' => 100,
        'minimum_quantity' => 0,
        'unit' => 'pcs',
        ...$attributes,
    ]);
}

test('renders the page shell first and defers every dashboard section', function () {
    $response = asNoRole()->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->missing('stats')
        ->missing('stockMovements')
        ->missing('stockByWarehouse')
        ->missing('topMovers')
        ->missing('lowStock')
        ->missing('expiringBatches')
        ->missing('pendingInspections')
        ->missing('overduePurchaseOrders')
        ->missing('recentOperations')
    );
});

test('lists stock below its batch minimum and falls back to the stock minimum without a batch', function () {
    $location = Location::factory()->create();
    $belowBatchMinimum = dashboardStock($location, ['quantity' => 5, 'minimum_quantity' => 0], Batch::factory()->create(['minimum_quantity' => 10]));
    dashboardStock($location, ['quantity' => 5, 'minimum_quantity' => 50], Batch::factory()->create(['minimum_quantity' => 5]));
    $belowOwnMinimum = dashboardStock($location, ['quantity' => 2, 'minimum_quantity' => 10]);
    dashboardStock($location, ['quantity' => 0], Batch::factory()->create(['minimum_quantity' => 10]));

    $response = asNoRole()->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload
        ->component('dashboard')
        ->where('stats.low_stock', 2)
        ->where('stats.out_of_stock', 1)
        ->where('lowStock.0.id', $belowOwnMinimum->id)
        ->where('lowStock.0.minimum_quantity', 10)
        ->where('lowStock.1.id', $belowBatchMinimum->id)
        ->where('lowStock.1.minimum_quantity', 10)
        ->has('lowStock', 2)
    ));
});

test('lists expired and soon-expiring batches that still hold stock', function () {
    travelTo('2026-11-06 09:00:00');
    $location = Location::factory()->create();
    $expired = Batch::factory()->create(['expiry_date' => '2026-11-01']);
    $expiringSoon = Batch::factory()->create(['expiry_date' => '2026-11-20']);
    $expiringLater = Batch::factory()->create(['expiry_date' => '2026-12-31']);
    $emptyExpiringSoon = Batch::factory()->create(['expiry_date' => '2026-11-10']);
    dashboardStock($location, [], $expired);
    dashboardStock($location, [], $expiringSoon);
    dashboardStock($location, [], $expiringLater);
    dashboardStock($location, ['quantity' => 0], $emptyExpiringSoon);

    $response = asNoRole()->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload
        ->where('stats.expired_batches', 1)
        ->where('stats.expiring_batches', 1)
        ->has('expiringBatches', 2)
        ->where('expiringBatches.0.id', $expired->id)
        ->where('expiringBatches.0.is_expired', true)
        ->where('expiringBatches.1.id', $expiringSoon->id)
        ->where('expiringBatches.1.is_expired', false)
    ));
});

test('lists open purchase orders past their expected delivery date', function () {
    travelTo('2026-11-06 09:00:00');
    $overdue = PurchaseOrder::factory()->create(['status' => 'partially_received', 'expected_delivery_date' => '2026-11-01']);
    PurchaseOrder::factory()->create(['status' => 'received', 'expected_delivery_date' => '2026-11-01']);
    PurchaseOrder::factory()->create(['status' => 'pending', 'expected_delivery_date' => '2026-11-10']);

    $response = asNoRole()->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload
        ->where('stats.open_purchase_orders', 2)
        ->where('stats.overdue_purchase_orders', 1)
        ->has('overduePurchaseOrders', 1)
        ->where('overduePurchaseOrders.0.id', $overdue->id)
    ));
});

test('counts distinct products in stock per warehouse', function () {
    $location = Location::factory()->create();
    $otherLocationInSameWarehouse = Location::factory()->create(['warehouse_id' => $location->warehouse_id]);
    $product = Product::factory()->create();
    dashboardStock($location, ['product_id' => $product->id]);
    dashboardStock($otherLocationInSameWarehouse, ['product_id' => $product->id]);
    dashboardStock($location);
    dashboardStock($location, ['quantity' => 0]);

    $response = asNoRole()->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload
        ->where('stockByWarehouse', [['warehouse' => $location->warehouse->name, 'products' => 2]])
    ));
});

test('defers daily inbound and outbound counts excluding transfers and adjustments', function () {
    travelTo('2026-11-06 09:00:00');
    $stock = dashboardStock(Location::factory()->create());
    foreach (['initial', 'inbound', 'outbound', 'transfer', 'adjustment'] as $operationType) {
        Operation::factory()->create([
            'operation_type' => $operationType,
            'product_id' => $stock->product_id,
            'location_id' => $stock->location_id,
            'quantity' => 1,
            'operation_date' => '2026-11-05 10:00:00',
        ]);
    }
    Operation::factory()->create([
        'operation_type' => 'inbound',
        'product_id' => $stock->product_id,
        'location_id' => $stock->location_id,
        'quantity' => 1,
        'operation_date' => '2026-10-01 10:00:00',
    ]);

    $response = asNoRole()->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->has('stockMovements', 30)
            ->where('stockMovements.0', ['date' => '2026-10-08', 'inbound' => 0, 'outbound' => 0])
            ->where('stockMovements.28', ['date' => '2026-11-05', 'inbound' => 2, 'outbound' => 1])
        )
    );
});

test('ranks products by outbound operations in the last 30 days', function () {
    travelTo('2026-11-06 09:00:00');
    $location = Location::factory()->create();
    $busiest = Product::factory()->create();
    $quieter = Product::factory()->create();
    $recordOperation = fn (Product $product, string $operationType, string $operationDate) => Operation::factory()->create([
        'operation_type' => $operationType,
        'product_id' => $product->id,
        'location_id' => $location->id,
        'quantity' => 1,
        'operation_date' => $operationDate,
    ]);
    $recordOperation($busiest, 'outbound', '2026-11-05 10:00:00');
    $recordOperation($busiest, 'outbound', '2026-10-08 10:00:00');
    $recordOperation($quieter, 'outbound', '2026-11-04 10:00:00');
    $recordOperation($quieter, 'inbound', '2026-11-04 10:00:00');
    $recordOperation($quieter, 'inbound', '2026-11-04 11:00:00');
    $recordOperation($quieter, 'outbound', '2026-10-07 10:00:00');

    $response = asNoRole()->get(route('dashboard'));

    $response->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload
        ->where('topMovers', [
            ['product_id' => $busiest->id, 'product' => $busiest->name, 'movements' => 2],
            ['product_id' => $quieter->id, 'product' => $quieter->name, 'movements' => 1],
        ])
    ));
});
