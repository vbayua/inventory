<?php

use App\Models\Product;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->seed(\Database\Seeders\BlankStateSeeder::class);
    $this->service = app(\App\Service\BatchAssignmentService::class);
});

it('can determine batch and generate batch number with no requested batch id', function () {
    $product = productWithSupplier();
    $product->load('suppliers');
    $productSupplier = $product->suppliers->first();

    $batchId = $this->service->determineBatch(
        product: $product,
        requestedBatchId: null,
        operationType: 'inbound',
        operationDate: now(),
        supplierId: $productSupplier->id
    );

    expect($batchId)->toBeInt();
});

it('can determine batch with requested batch id', function () {
    $product = productWithSupplier();
    $product->load('suppliers');
    $productSupplier = $product->suppliers->first();

    $batchId = $this->service->determineBatch(
        product: $product,
        requestedBatchId: 1,
        operationType: 'inbound',
        operationDate: now(),
        supplierId: $productSupplier->id
    );

    expect($batchId)->toBe(1);
});

it('throws exception when supplier is not associated with product', function () {
    $product = Product::factory()->create([
        'product_type_id' => 1,
    ]);
    $unrelatedSupplierId = 9999;

    $this->service->determineBatch(
        product: $product,
        requestedBatchId: null,
        operationType: 'inbound',
        operationDate: now(),
        supplierId: $unrelatedSupplierId
    );
})->throws(ValidationException::class);

test('resolve policy throw a validation error when product type is not supported', function () {
    $unsupportedProductType = App\Models\ProductType::factory()->create(['type_code' => 'unsupported_type']);
    $product = productWithSupplier([
        'product_type_id' => $unsupportedProductType->id,
    ]);

    $this->service->determineBatch(
        product: $product,
        requestedBatchId: null,
        operationType: 'inbound',
        operationDate: now(),
        supplierId: null
    );
})->throws(ValidationException::class);
