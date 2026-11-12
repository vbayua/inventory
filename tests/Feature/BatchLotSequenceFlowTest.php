<?php

use App\DTO\StockData;
use App\Models\Batch;
use App\Models\Location;
use App\Models\ProductType;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\QcApproval;
use App\Models\QcInspection;
use App\Models\ReceiveOrder;
use App\Models\ReceiveOrderItem;
use App\Models\User;
use App\Service\StockOperationService;
use Database\Seeders\BlankStateSeeder;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->product = productWithSupplier([
        'product_type_id' => ProductType::where('type_code', 'PP')->value('id'),
        'unit' => 'pcs',
    ]);
    $this->supplier = $this->product->suppliers()->first();
    $this->sku = $this->product->sku;
    $this->batchNumbers = fn (): array => Batch::where('product_id', $this->product->id)
        ->orderBy('id')
        ->pluck('batch_number')
        ->all();
});

describe('batch create form', function () {
    beforeEach(function () {
        $this->actingAs(User::factory()->create());
        $this->createBatch = fn (string $operationDate) => $this->post(route('batch.store'), [
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'operation_date' => $operationDate,
            'minimum_quantity' => 0,
        ])->assertSessionHasNoErrors();
    });

    it('issues lots within the interval and a new sequence after it', function () {
        ($this->createBatch)('2026-01-01');
        ($this->createBatch)('2026-01-01');
        ($this->createBatch)('2026-03-01');
        ($this->createBatch)('2026-04-01');
        ($this->createBatch)('2026-04-02');

        expect(($this->batchNumbers)())->toBe([
            "26-{$this->sku}-A-1",
            "26-{$this->sku}-B-1",
            "26-{$this->sku}-C-1",
            "26-{$this->sku}-A-2",
            "26-{$this->sku}-B-2",
        ]);
    });

    it('stores the operation date as the batch date', function () {
        ($this->createBatch)('2026-02-10');

        expect(Batch::where('product_id', $this->product->id)->sole()->batch_date->toDateString())->toBe('2026-02-10');
    });
});

describe('stock operation service', function () {
    beforeEach(function () {
        $this->receive = function (string $date): void {
            app(StockOperationService::class)->createInboundOperation(
                $this->product,
                StockData::fromArray([
                    'location_id' => Location::factory()->create()->id,
                    'supplier_id' => $this->supplier->id,
                    'batch_id' => null,
                    'quantity' => 10,
                    'minimum_quantity' => 0,
                    'unit' => 'pcs',
                    'date' => $date,
                ]),
                10,
                'pcs',
                'Inbound',
                $date,
            );
        };
    });

    it('opens a new lot for every inbound within the interval instead of reusing the last batch', function () {
        ($this->receive)('2026-01-01');
        ($this->receive)('2026-02-01');
        ($this->receive)('2026-04-01');

        expect(($this->batchNumbers)())->toBe([
            "26-{$this->sku}-A-1",
            "26-{$this->sku}-B-1",
            "26-{$this->sku}-A-2",
        ]);
    });

    it('still reuses the last inbound batch within the interval for raw materials', function () {
        $this->product = productWithSupplier([
            'product_type_id' => ProductType::where('type_code', 'RMP')->value('id'),
            'unit' => 'pcs',
        ]);
        $this->supplier = $this->product->suppliers()->first();
        $existingBatch = Batch::factory()->create(['product_id' => $this->product->id, 'batch_number' => "26-{$this->product->sku}-1"]);
        $this->product->operations()->create([
            'operation_type' => 'inbound',
            'location_id' => Location::factory()->create()->id,
            'batch_id' => $existingBatch->id,
            'unit' => 'pcs',
            'quantity' => 10,
            'operation_date' => '2026-01-01',
        ]);

        ($this->receive)('2026-02-01');

        expect(($this->batchNumbers)())->toBe(["26-{$this->product->sku}-1"]);
    });
});

describe('qc inspection approval', function () {
    it('opens the next lot on each approval without a selected batch', function () {
        $purchaseOrder = PurchaseOrder::factory()->create(['supplier_id' => $this->supplier->id]);
        $purchaseOrderItem = PurchaseOrderItem::create([
            'purchase_order_id' => $purchaseOrder->id,
            'product_id' => $this->product->id,
            'quantity' => 100,
            'price' => 10,
        ]);
        $inspector = User::factory()->admin()->create();
        $approve = function () use ($purchaseOrder, $purchaseOrderItem, $inspector): void {
            $receiveOrder = ReceiveOrder::create([
                'purchase_order_id' => $purchaseOrder->id,
                'receive_number' => 'RCV-'.fake()->unique()->numberBetween(1000, 9999),
                'receive_date' => now()->toDateString(),
            ]);
            $receiveOrderItem = ReceiveOrderItem::create([
                'receive_order_id' => $receiveOrder->id,
                'purchase_order_item_id' => $purchaseOrderItem->id,
                'quantity_received' => 10,
                'location_id' => Location::factory()->create()->id,
            ]);
            $inspection = QcInspection::create([
                'receive_order_id' => $receiveOrder->id,
                'receive_order_item_id' => $receiveOrderItem->id,
                'inspector_user_id' => $inspector->id,
                'status' => 'pass',
                'quantity_passed' => 10,
            ]);
            QcApproval::create(['qc_inspection_id' => $inspection->id, 'status' => 'pending']);

            $this->actingAs($inspector)
                ->post(route('qc.inspections.approve', $inspection))
                ->assertSessionHas('success');
        };

        $approve();
        $approve();

        $year = now()->format('y');
        expect(($this->batchNumbers)())->toBe([
            "{$year}-{$this->sku}-A-1",
            "{$year}-{$this->sku}-B-1",
        ]);
    });
});
