<?php

use App\Enums\ProductionOrderIssueType;
use App\Models\Batch;
use App\Models\Bom;
use App\Models\Product;
use App\Models\ProductionOrder;
use App\Models\ProductionOrderIssue;
use Database\Seeders\BlankStateSeeder;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);

    $finishedGood = Product::factory()->create();
    $this->component = Product::factory()->create();

    $this->bom = Bom::create(['product_id' => $finishedGood->id, 'version' => 1, 'status' => 'active']);
    $this->bom->lines()->create([
        'component_product_id' => $this->component->id,
        'quantity_per_unit' => 2,
        'unit' => 'pcs',
        'scrap_percentage' => 10,
    ]);

    $this->production = ProductionOrder::create([
        'order_number' => 'PO-0001',
        'product_id' => $finishedGood->id,
        'bom_id' => $this->bom->id,
        'target_quantity' => 10,
        'status' => 'draft',
    ]);
});

function updateProductionStatus(ProductionOrder $production, array $payload)
{
    return asAdmin()->put(route('production.status.update', $production), $payload);
}

it('releases a draft order against the active bom, freezing and reserving materials', function () {
    updateProductionStatus($this->production, ['status' => 'released'])
        ->assertRedirect(route('production.show', $this->production))
        ->assertSessionHas('success');

    $this->production->refresh();
    $material = $this->production->materials()->sole();

    expect($this->production->status)->toBe('released')
        ->and($this->production->released_at)->not->toBeNull()
        ->and($this->production->released_by)->not->toBeNull()
        ->and($material->component_product_id)->toBe($this->component->id)
        ->and((float) $material->quantity_required)->toBe(22.0)
        ->and((float) $material->quantity_reserved)->toBe(22.0);
});

it('does not release an order whose bom was retired after it was created', function () {
    $this->bom->update(['status' => 'retired']);

    updateProductionStatus($this->production, ['status' => 'released'])
        ->assertSessionHasErrors('status');

    expect($this->production->refresh()->status)->toBe('draft')
        ->and($this->production->materials()->count())->toBe(0);
});

it('cancels a released order with a note and releases its reservations', function () {
    updateProductionStatus($this->production, ['status' => 'released']);

    updateProductionStatus($this->production, ['status' => 'cancelled', 'cancel_note' => 'No longer needed'])
        ->assertSessionHas('success');

    $this->production->refresh();

    expect($this->production->status)->toBe('cancelled')
        ->and($this->production->cancelled_at)->not->toBeNull()
        ->and($this->production->cancel_note)->toBe('No longer needed')
        ->and((float) $this->production->materials()->sole()->quantity_reserved)->toBe(0.0);
});

it('requires a note to cancel', function () {
    updateProductionStatus($this->production, ['status' => 'cancelled'])
        ->assertSessionHasErrors('cancel_note');

    expect($this->production->refresh()->status)->toBe('draft');
});

it('does not complete an order that had nothing issued', function () {
    $this->production->update(['status' => 'in_progress']);

    updateProductionStatus($this->production, ['status' => 'completed'])
        ->assertSessionHasErrors('status');

    expect($this->production->refresh()->status)->toBe('in_progress');
});

it('completes an in-progress order with issues and releases its reservations', function () {
    updateProductionStatus($this->production, ['status' => 'released']);
    updateProductionStatus($this->production, ['status' => 'in_progress']);

    ProductionOrderIssue::create([
        'request_uuid' => Str::uuid()->toString(),
        'production_order_id' => $this->production->id,
        'production_order_material_id' => $this->production->materials()->sole()->id,
        'batch_id' => Batch::factory()->create(['product_id' => $this->component->id])->id,
        'type' => ProductionOrderIssueType::Issue->value,
        'quantity' => 22,
    ]);

    updateProductionStatus($this->production, ['status' => 'completed'])
        ->assertSessionHas('success');

    $this->production->refresh();

    expect($this->production->status)->toBe('completed')
        ->and($this->production->started_at)->not->toBeNull()
        ->and($this->production->completed_at)->not->toBeNull()
        ->and((float) $this->production->materials()->sole()->quantity_reserved)->toBe(0.0);
});

it('rejects a transition the current status does not allow', function () {
    updateProductionStatus($this->production, ['status' => 'completed'])
        ->assertSessionHasErrors('status');

    expect($this->production->refresh()->status)->toBe('draft');
});

it('rejects an unknown status', function () {
    updateProductionStatus($this->production, ['status' => 'shipped'])
        ->assertSessionHasErrors('status');

    expect($this->production->refresh()->status)->toBe('draft');
});
