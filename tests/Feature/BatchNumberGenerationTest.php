<?php

use App\Models\Batch;
use App\Models\ProductType;
use App\Service\BatchAssignmentService;
use Database\Seeders\BlankStateSeeder;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->service = app(BatchAssignmentService::class);
});

describe('finished goods', function () {
    beforeEach(function () {
        $finishedGoodsType = ProductType::factory()->create(['type_code' => 'FG']);
        $this->product = productWithSupplier(['product_type_id' => $finishedGoodsType->id]);
    });

    it('starts the monthly sequence at 1 with the keyword of the month and sku', function () {
        $batchNumber = $this->service->generateBatchNumber($this->product, $this->product->sku, null, '2026-01-15');

        expect($batchNumber)->toBe("2026IM{$this->product->sku}-1");
    });

    it('continues from the highest existing sequence in the same month', function () {
        Batch::factory()->create([
            'product_id' => $this->product->id,
            'batch_number' => "2026IM{$this->product->sku}-1",
        ]);

        $batchNumber = $this->service->generateBatchNumber($this->product, $this->product->sku, null, '2026-01-20');

        expect($batchNumber)->toBe("2026IM{$this->product->sku}-2");
    });

    it('restarts the sequence with a new keyword in a different month', function () {
        Batch::factory()->create([
            'product_id' => $this->product->id,
            'batch_number' => "2026IM{$this->product->sku}-1",
        ]);

        $batchNumber = $this->service->generateBatchNumber($this->product, $this->product->sku, null, '2026-02-03');

        expect($batchNumber)->toBe("2026PE{$this->product->sku}-1");
    });

    it('creates distinct batches for consecutive outputs in the same month', function () {
        $productSupplierId = $this->product->suppliers()->first()->id;

        $firstBatchId = $this->service->determineBatch($this->product, supplierId: $productSupplierId, operationDate: '2026-01-10');
        $secondBatchId = $this->service->determineBatch($this->product, supplierId: $productSupplierId, operationDate: '2026-01-11');

        expect(Batch::find($firstBatchId)->batch_number)->toBe("2026IM{$this->product->sku}-1")
            ->and(Batch::find($secondBatchId)->batch_number)->toBe("2026IM{$this->product->sku}-2");
    });
});

describe('primary packaging', function () {
    beforeEach(function () {
        $this->product = productWithSupplier(['product_type_id' => ProductType::where('type_code', 'PP')->value('id')]);
        $this->sku = $this->product->sku;
        $this->batchOn = fn (string $lotSequence, string $batchDate): Batch => Batch::factory()->create([
            'product_id' => $this->product->id,
            'batch_number' => "26-{$this->sku}-{$lotSequence}",
            'batch_date' => $batchDate,
        ]);
    });

    it('starts the first sequence at lot A', function () {
        expect($this->service->generateBatchNumber($this->product, $this->sku, null, '2026-01-01'))
            ->toBe("26-{$this->sku}-A-1");
    });

    it('issues the next lot for a second batch on the same day', function () {
        ($this->batchOn)('A-1', '2026-01-01');

        expect($this->service->generateBatchNumber($this->product, $this->sku, null, '2026-01-01'))
            ->toBe("26-{$this->sku}-B-1");
    });

    it('keeps advancing the lot while within the interval from the first batch of the sequence', function () {
        ($this->batchOn)('A-1', '2026-01-01');
        ($this->batchOn)('B-1', '2026-03-01');

        expect($this->service->generateBatchNumber($this->product, $this->sku, null, '2026-03-20'))
            ->toBe("26-{$this->sku}-C-1");
    });

    it('starts a new sequence at lot A once the interval from the first batch of the sequence has elapsed', function () {
        ($this->batchOn)('A-1', '2026-01-01');
        ($this->batchOn)('B-1', '2026-03-01');

        expect($this->service->generateBatchNumber($this->product, $this->sku, null, '2026-04-01'))
            ->toBe("26-{$this->sku}-A-2");
    });

    it('advances the lot within the new sequence', function () {
        ($this->batchOn)('A-1', '2026-01-01');
        ($this->batchOn)('A-2', '2026-04-15');

        expect($this->service->generateBatchNumber($this->product, $this->sku, null, '2026-05-01'))
            ->toBe("26-{$this->sku}-B-2");
    });

    it('measures the interval from the batch date rather than when the record was created', function () {
        ($this->batchOn)('A-1', '2026-01-01')->forceFill(['created_at' => '2026-11-12'])->save();

        expect($this->service->generateBatchNumber($this->product, $this->sku, null, '2026-04-15'))
            ->toBe("26-{$this->sku}-A-2");
    });
});
