<?php

use App\DTO\StockData;
use App\Models\Batch;
use App\Models\Location;
use App\Models\Operation;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockAdjustment;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Service\BatchAssignmentService;
use App\Service\StockOperationService;
use Database\Seeders\BlankStateSeeder;
use Database\Seeders\SupplierSeeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function PHPUnit\Framework\assertCount;
use function PHPUnit\Framework\assertEquals;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->seed(SupplierSeeder::class);
    $this->service = app(StockOperationService::class);
    $this->batchService = app(BatchAssignmentService::class);
});

test('service can be called', function () {
    expect($this->service)->toBeInstanceOf(StockOperationService::class);
});
test('test has suppliers seeded', function () {
    assertDatabaseCount('suppliers', 10);
});

// test('create initial stock ')

describe('Initial stock operations', function () {
    test('create initial stock function, creates operation and stock record', function () {
        $product = productWithSupplier();
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => null,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 100,
            'operation_type' => 'initial',
        ]);

        assertDatabaseHas('stocks', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 100,
        ]);
    });
});

describe('inbound operations', function () {
    test('create inbound operation increments existing stock', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);

        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->createInboundOperation(
            $stock->product,
            $stock,
            50,
            'pcs',
            'Inbound operation test',
            now()
        );

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 50,
            'operation_type' => 'inbound',
        ]);

        $stock->refresh();

        $this->assertEquals(150, $stock->quantity);
    });
});

describe('Outbound operations', function () {
    test('create outbound operation decrements stock', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->createOutboundOperation(
            $stock->product,
            $stock,
            30,
            'pcs',
            'Outbound operation test',
            now()
        );

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 30,
            'operation_type' => 'outbound',
        ]);

        $stock->refresh();

        assertEquals(70, $stock->quantity);
    });

    test('create outbound operation throws on insufficient stock', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->createOutboundOperation(
            $stock->product,
            $stock,
            110,
            'pcs',
            'Outbound operation test',
            now()
        );
    })->throws(ValidationException::class);
});

describe('Return operations', function () {
    test('create return operation creates stock when stock record is missing', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->createOutboundOperation(
            $stock->product,
            $stock,
            100,
            'pcs',
            'Outbound operation test',
            now()
        );

        $this->service->createReturnOperation(
            $stock->product,
            $stock,
            50,
            'pcs',
            'Return operation test',
            now()
        );

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 50,
            'operation_type' => 'return',
        ]);

        assertEquals(50, $stock->fresh()->quantity);
    });
});

describe('Stock adjustment operations', function () {
    test('adjust stock operation with addition creates adjustment and increments stock', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->adjustStockOperation($stock, 20, 'pcs', 'addition', 'Stock adjustment test', now());

        assertDatabaseHas('stock_adjustments', [
            'stock_id' => $stock->id,
            'quantity' => 20,
            'adjustment_type' => 'addition',
        ]);

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 20,
            'operation_type' => 'adjustment',
        ]);

        assertEquals(120, $stock->fresh()->quantity);
    });

    test('adjust stock operation with subtraction decrements stock', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->adjustStockOperation($stock, 20, 'pcs', 'subtraction', 'Stock adjustment test', now());

        assertDatabaseHas('stock_adjustments', [
            'stock_id' => $stock->id,
            'quantity' => 20,
            'adjustment_type' => 'subtraction',
        ]);

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 20,
            'operation_type' => 'adjustment',
        ]);

        assertEquals(80, $stock->fresh()->quantity);
    });
});


describe('Transfer operations', function () {
    test('create transfer operation moves quantity and creates transfer in/out operations', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $targetLocation = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->createTransferOperation(
            $stock->product,
            $stock->batch_id,
            $location->id,
            $targetLocation->id,
            50,
            'pcs',
            'Transfer operation test',
            now()
        );

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'quantity' => 50,
            'operation_type' => 'transfer_out',
        ]);

        assertDatabaseHas('operations', [
            'product_id' => $product->id,
            'location_id' => $targetLocation->id,
            'quantity' => 50,
            'operation_type' => 'transfer_in',
        ]);
    });

    test('create transfer operation deletes source stock row when fully depleted', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $targetLocation = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->createTransferOperation(
            $stock->product,
            $stock->batch_id,
            $location->id,
            $targetLocation->id,
            100,
            'pcs',
            'Transfer operation test',
            now()
        );

        assertDatabaseMissing('stocks', [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'batch_id' => $batchId,
        ]);

        assertDatabaseHas('stocks', [
            'product_id' => $product->id,
            'location_id' => $targetLocation->id,
            'batch_id' => $batchId,
            'quantity' => 100,
        ]);
    });

    test('create transfer operation throws when source has insufficient stock', function () {
        $product = productWithSupplier([
            'product_type_id' => 2,
            'unit' => 'pcs'
        ]);
        $supplier = $product->suppliers->first();
        $location = Location::factory()->create();
        $targetLocation = Location::factory()->create();
        $batchId = $this->batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $supplier->id
        );

        $stockData = StockData::fromArray([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'unit' => $product->unit,
            'supplier_id' => $supplier->id,
            'batch_id' => $batchId,
            'minimum_quantity' => 10,
        ]);

        $this->service->createInitialStock($product, $stockData);

        $stock = Stock::with(['product'])->where('product_id', $product->id)->where('location_id', $location->id)->where('batch_id', $batchId)->first();

        $this->service->createTransferOperation(
            $stock->product,
            $stock->batch_id,
            $location->id,
            $targetLocation->id,
            150,
            'pcs',
            'Transfer operation test',
            now()
        );
    })->throws(ValidationException::class);
});
