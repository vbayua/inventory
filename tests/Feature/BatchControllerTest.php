<?php

use App\Models\Batch;
use App\Models\User;
use Database\Seeders\BlankStateSeeder;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->actingAs(User::factory()->create());
});

it('creates a batch from the create form payload', function () {
    $product = productWithSupplier(['product_type_id' => 1]);
    $supplier = $product->suppliers()->first();

    $response = $this->post(route('batch.store'), [
        'batch_number' => '',
        'product_id' => $product->id,
        'supplier_id' => $supplier->id,
        'manufacture_date' => '2026-10-15',
        'expiry_date' => '2027-10-15',
        'operation_date' => '',
        'minimum_quantity' => 5,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('batch.index'));

    $batch = Batch::where('product_id', $product->id)->sole();
    expect($batch->supplier_id)->toBe($supplier->id)
        ->and($batch->minimum_quantity)->toBe(5)
        ->and($batch->manufacture_date->toDateString())->toBe('2026-10-15')
        ->and($batch->expiry_date->toDateString())->toBe('2027-10-15');
});

it('rejects an expiry date before the manufacture date', function () {
    $product = productWithSupplier(['product_type_id' => 1]);

    $this->post(route('batch.store'), [
        'product_id' => $product->id,
        'supplier_id' => $product->suppliers()->first()->id,
        'manufacture_date' => '2026-10-15',
        'expiry_date' => '2026-10-01',
        'minimum_quantity' => 5,
    ])->assertSessionHasErrors('expiry_date');

    expect(Batch::where('product_id', $product->id)->exists())->toBeFalse();
});
