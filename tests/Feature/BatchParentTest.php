<?php

use App\Models\Batch;
use App\Models\ProductType;
use App\Service\BatchAssignmentService;
use Database\Seeders\BlankStateSeeder;
use Illuminate\Validation\ValidationException;

it('links a child batch to its parent batch', function () {
    $parent = Batch::factory()->create();
    $child = Batch::factory()->create([
        'product_id' => $parent->product_id,
        'parent_batch_id' => $parent->id,
    ]);

    expect($child->parent->is($parent))->toBeTrue()
        ->and($parent->children->pluck('id')->all())->toBe([$child->id]);
});

it('keeps the child batch when its parent batch is deleted', function () {
    $parent = Batch::factory()->create();
    $child = Batch::factory()->create([
        'product_id' => $parent->product_id,
        'parent_batch_id' => $parent->id,
    ]);

    $parent->delete();

    expect($child->fresh())->not->toBeNull()
        ->parent_batch_id->toBeNull();
});

describe('child batches through the batch assignment service', function () {
    beforeEach(function () {
        $this->seed(BlankStateSeeder::class);
        $this->service = app(BatchAssignmentService::class);
        $this->product = productWithSupplier(['product_type_id' => ProductType::where('type_code', 'PS')->value('id')]);
        $this->parent = Batch::factory()->create([
            'product_id' => $this->product->id,
            'batch_number' => now()->format('y')."-{$this->product->sku}-A-1",
            'supplier_id' => $this->product->suppliers()->first()->id,
            'minimum_quantity' => 5,
        ]);
    });

    it('numbers children after the parent and inherits its supplier and dates', function () {
        $first = $this->service->createChildBatch($this->parent);
        $second = $this->service->createChildBatch($this->parent->id);

        expect($first->batch_number)->toBe("{$this->parent->batch_number}.1")
            ->and($second->batch_number)->toBe("{$this->parent->batch_number}.2")
            ->and($first->parent_batch_id)->toBe($this->parent->id)
            ->and($first->product_id)->toBe($this->parent->product_id)
            ->and($first->supplier_id)->toBe($this->parent->supplier_id)
            ->and($first->expiry_date->toDateString())->toBe($this->parent->expiry_date->toDateString())
            ->and($first->minimum_quantity)->toBe(5);
    });

    it('uses a given suffix and rejects a duplicate one', function () {
        $child = $this->service->createChildBatch($this->parent, suffix: '25NE');

        expect($child->batch_number)->toBe("{$this->parent->batch_number}.25NE");

        $this->service->createChildBatch($this->parent, suffix: '25NE');
    })->throws(ValidationException::class);

    it('does not let a child batch shift the parent number series', function () {
        $this->parent->forceFill(['created_at' => now()->subDays(10)])->save();
        $this->service->createChildBatch($this->parent);

        $batchNumber = $this->service->generateBatchNumber($this->product, $this->product->sku, null, now()->toDateString());

        expect($batchNumber)->toBe(now()->format('y')."-{$this->product->sku}-B-1");
    });

    it('creates a child batch from determineBatch without a supplier', function () {
        $batchId = $this->service->determineBatch($this->product, parentBatchId: $this->parent->id);

        expect(Batch::find($batchId)->parent_batch_id)->toBe($this->parent->id);
    });

    it('rejects a parent batch of a different product', function () {
        $otherBatch = Batch::factory()->create();

        $this->service->determineBatch($this->product, parentBatchId: $otherBatch->id);
    })->throws(ValidationException::class);
});
