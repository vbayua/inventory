<?php

use App\Models\Batch;
use App\Models\Location;
use App\Models\Operation;
use App\Models\Product;
use App\Models\ProductType;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\StockImportSeeder;

/**
 * @param  list<array<string, int|string>>  $rows
 */
function stockImportCsv(array $rows): string
{
    $headers = ['sku', 'batch_number', 'name', 'quantity', 'remarks', 'location', 'product_id', 'supplier_id', 'batch_id', 'location_id', 'product_type_id', 'user_id'];
    $path = tempnam(sys_get_temp_dir(), 'stockimport');
    $handle = fopen($path, 'w');
    fputcsv($handle, $headers, ',', '"', '\\');

    foreach ($rows as $row) {
        fputcsv($handle, array_map(fn (string $header) => $row[$header] ?? '', $headers), ',', '"', '\\');
    }

    fclose($handle);

    return $path;
}

/**
 * @return array<string, int|string>
 */
function stockImportRow(Batch $batch, Location $location, array $overrides = []): array
{
    return [
        'sku' => 'SKU',
        'batch_number' => $batch->batch_number,
        'name' => 'Item',
        'quantity' => 10,
        'location' => $location->name,
        'product_id' => $batch->product_id,
        'supplier_id' => $batch->supplier_id,
        'batch_id' => $batch->id,
        'location_id' => $location->id,
        'user_id' => User::factory()->create()->id,
        ...$overrides,
    ];
}

beforeEach(function () {
    $this->supplier = Supplier::factory()->create();
    $this->batch = Batch::factory()->create(['supplier_id' => $this->supplier->id]);
    $this->location = Location::factory()->create();
});

it('creates stock and an initial operation on an existing batch', function () {
    (new StockImportSeeder)->run(stockImportCsv([
        stockImportRow($this->batch, $this->location, ['quantity' => 40, 'remarks' => '25IN']),
    ]));

    $stock = Stock::sole();
    $operation = Operation::sole();

    expect($stock->batch_id)->toBe($this->batch->id)
        ->and($stock->location_id)->toBe($this->location->id)
        ->and((float) $stock->quantity)->toBe(40.0)
        ->and($stock->status)->toBe('available')
        ->and($operation->operation_type)->toBe('initial')
        ->and($operation->remarks)->toBe('25IN')
        ->and((float) $operation->quantity)->toBe(40.0);
});

it('renames an existing batch to the batch number in the file', function () {
    (new StockImportSeeder)->run(stockImportCsv([
        stockImportRow($this->batch, $this->location, ['batch_number' => '24-FIXED-1']),
    ]));

    expect($this->batch->fresh()->batch_number)->toBe('24-FIXED-1')
        ->and(Batch::count())->toBe(1);
});

it('creates a missing batch with the row supplier', function () {
    (new StockImportSeeder)->run(stockImportCsv([
        stockImportRow($this->batch, $this->location, ['batch_id' => '', 'batch_number' => '26-NEW-1']),
    ]));

    $batch = Batch::where('batch_number', '26-NEW-1')->sole();

    expect($batch->product_id)->toBe($this->batch->product_id)
        ->and($batch->supplier_id)->toBe($this->supplier->id)
        ->and(Stock::sole()->batch_id)->toBe($batch->id);
});

it('creates a missing location in the packaging warehouse', function () {
    $warehouse = Warehouse::factory()->create(['name' => StockImportSeeder::DEFAULT_WAREHOUSE]);

    (new StockImportSeeder)->run(stockImportCsv([
        stockImportRow($this->batch, $this->location, ['location_id' => '', 'location' => 'U2']),
    ]));

    $location = Location::where('name', 'U2')->sole();

    expect($location->warehouse_id)->toBe($warehouse->id)
        ->and(Stock::sole()->location_id)->toBe($location->id);
});

it('registers a product without a product id and seeds no stock for it', function () {
    $productType = ProductType::factory()->create();

    (new StockImportSeeder)->run(stockImportCsv([
        stockImportRow($this->batch, $this->location, [
            'sku' => 'PS0146', 'name' => 'Hardbox Set', 'product_id' => '', 'supplier_id' => '', 'batch_id' => '',
            'batch_number' => '26-PS0146-A-1', 'product_type_id' => $productType->id,
        ]),
    ]));

    $product = Product::where('sku', 'PS0146')->sole();

    expect($product->name)->toBe('Hardbox Set')
        ->and($product->product_type_id)->toBe($productType->id)
        ->and(Batch::where('batch_number', '26-PS0146-A-1')->exists())->toBeFalse()
        ->and(Stock::count())->toBe(0);
});

it('sums rows sharing a product, batch and location', function () {
    (new StockImportSeeder)->run(stockImportCsv([
        stockImportRow($this->batch, $this->location, ['quantity' => 10]),
        stockImportRow($this->batch, $this->location, ['quantity' => 15]),
    ]));

    expect((float) Stock::sole()->quantity)->toBe(25.0)
        ->and(Operation::count())->toBe(1);
});

it('leaves existing stock untouched when run again', function () {
    $csv = stockImportCsv([stockImportRow($this->batch, $this->location)]);

    (new StockImportSeeder)->run($csv);
    Stock::sole()->update(['quantity' => 3]);
    (new StockImportSeeder)->run($csv);

    expect((float) Stock::sole()->quantity)->toBe(3.0)
        ->and(Operation::count())->toBe(1);
});

it('rejects a batch that belongs to another product and rolls back', function () {
    $otherProduct = Product::factory()->create();

    expect(fn () => (new StockImportSeeder)->run(stockImportCsv([
        stockImportRow($this->batch, $this->location),
        stockImportRow($this->batch, $this->location, ['product_id' => $otherProduct->id]),
    ])))->toThrow(RuntimeException::class);

    expect(Stock::count())->toBe(0);
});
