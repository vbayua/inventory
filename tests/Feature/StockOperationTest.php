<?php

use App\Models\Location;
use App\Models\User;
use App\Service\BatchAssignmentService;
use App\Service\StockOperationService;
use Database\Seeders\BlankStateSeeder;
use Database\Seeders\SupplierSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->seed(SupplierSeeder::class);
    $this->service = app(StockOperationService::class);
    $this->batchService = app(BatchAssignmentService::class);
});

test('User can access Create Stock Operation form page', function () {
    $admin = User::factory()->admin()->create();
    $response = $this->actingAs($admin)->get(route('operations.create'));
    $response->assertStatus(200);
});

test('User can submit a new stock operation', function () {
    $admin = User::factory()->admin()->create();
    $product = productWithSupplier();
    $location = Location::factory()->create();
    $response = $this->actingAs($admin)->post(route('operations.store'), [
        'operationType' => 'inbound',
        'product' => $product->id,
        'location' => $location->id,
        'quantity' => 100,
        'user_id' => $admin->id,
    ]);
    $response->assertStatus(302);
    $response->assertRedirect(route('operations.index'));
    $this->assertDatabaseHas('operations', [
        'operationType' => 'inbound',
        'product_id' => $product->id,
        'quantity' => 100,
        'batch_id' => 1,
        'user_id' => $admin->id,
    ]);

});
