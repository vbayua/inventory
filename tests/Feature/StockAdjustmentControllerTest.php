<?php

use App\DTO\StockData;
use App\Models\Location;
use App\Models\Stock;
use App\Service\BatchAssignmentService;
use App\Service\StockOperationService;
use Database\Seeders\BlankStateSeeder;
use Database\Seeders\SupplierSeeder;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->seed(SupplierSeeder::class);

    $product = productWithSupplier([
        'product_type_id' => 2,
        'unit' => 'pcs',
    ]);
    $supplier = $product->suppliers->first();
    $location = Location::factory()->create();
    $batchId = app(BatchAssignmentService::class)->determineBatch(
        product: $product,
        requestedBatchId: null,
        operationType: 'inbound',
        operationDate: now(),
        supplierId: $supplier->id
    );

    app(StockOperationService::class)->createInitialStock($product, StockData::fromArray([
        'product_id' => $product->id,
        'location_id' => $location->id,
        'warehouse_id' => $location->warehouse_id,
        'quantity' => 84,
        'unit' => $product->unit,
        'supplier_id' => $supplier->id,
        'batch_id' => $batchId,
        'minimum_quantity' => 10,
    ]));

    $this->stock = Stock::where('product_id', $product->id)->firstOrFail();
});

test('adjusting to a target quantity applies only the difference', function (float $target, float $difference, string $type) {
    asAdmin()->post(route('stock-adjustments.store'), [
        'stock_id' => $this->stock->id,
        'quantity' => $target,
        'unit' => 'pcs',
    ])->assertRedirectToRoute('stocks.index');

    expect((float) $this->stock->fresh()->quantity)->toBe($target);

    assertDatabaseHas('stock_adjustments', [
        'stock_id' => $this->stock->id,
        'quantity' => $difference,
        'adjustment_type' => $type,
    ]);
    assertDatabaseHas('operations', [
        'product_id' => $this->stock->product_id,
        'quantity' => $difference,
        'operation_type' => 'adjustment',
    ]);
})->with([
    'increase' => [85.0, 1.0, 'addition'],
    'decrease' => [80.0, 4.0, 'subtraction'],
]);

test('adjusting to the current quantity is rejected and records nothing', function () {
    asAdmin()->post(route('stock-adjustments.store'), [
        'stock_id' => $this->stock->id,
        'quantity' => 84,
        'unit' => 'pcs',
    ])->assertSessionHasErrors(['quantity' => 'No adjustment needed']);

    expect((float) $this->stock->fresh()->quantity)->toBe(84.0);

    assertDatabaseMissing('stock_adjustments', ['stock_id' => $this->stock->id]);
    assertDatabaseMissing('operations', ['operation_type' => 'adjustment']);
});
