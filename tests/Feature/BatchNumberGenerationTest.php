<?php

use App\Models\Batch;
use App\Models\ProductType;
use App\Service\BatchAssignmentService;
use Database\Seeders\BlankStateSeeder;
use Illuminate\Validation\ValidationException;

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
        $this->existingBatch = Batch::factory()->create([
            'product_id' => $this->product->id,
            'batch_number' => now()->format('y')."-{$this->product->sku}-A-1",
        ]);
    });

    it('rejects a second batch on the same day', function () {
        $this->service->generateBatchNumber($this->product, $this->product->sku, null, now()->toDateString());
    })->throws(ValidationException::class);

    it('issues the next lot when the latest batch was created on an earlier day', function () {
        $this->existingBatch->forceFill(['created_at' => now()->subDay()])->save();

        $batchNumber = $this->service->generateBatchNumber($this->product, $this->product->sku, null, now()->toDateString());

        expect($batchNumber)->toBe(now()->format('y')."-{$this->product->sku}-B-1");
    });
});
