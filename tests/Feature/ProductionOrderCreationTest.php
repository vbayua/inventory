<?php

use App\Models\Bom;
use App\Models\Product;
use App\Models\ProductionOrder;
use Database\Seeders\BlankStateSeeder;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);

    $this->finishedGood = Product::factory()->create();
    $this->component = Product::factory()->create();
});

function bomWithLine(Product $product, Product $component, string $status): Bom
{
    $bom = Bom::create(['product_id' => $product->id, 'version' => 1, 'status' => $status]);
    $bom->lines()->create([
        'component_product_id' => $component->id,
        'quantity_per_unit' => 2,
        'unit' => 'pcs',
    ]);

    return $bom;
}

it('creates a draft order pinned to the product\'s active bom', function () {
    $bom = bomWithLine($this->finishedGood, $this->component, 'active');

    asAdmin()
        ->post(route('production.store'), ['product_id' => $this->finishedGood->id, 'target_quantity' => 5])
        ->assertSessionHasNoErrors();

    $production = ProductionOrder::sole();
    $material = $production->materials()->sole();

    expect($production->status)->toBe('draft')
        ->and($production->bom_id)->toBe($bom->id)
        ->and($material->component_product_id)->toBe($this->component->id)
        ->and((float) $material->quantity_required)->toBe(10.0)
        ->and((float) $material->quantity_reserved)->toBe(0.0);
});

it('accepts the product\'s active bom passed explicitly', function () {
    $bom = bomWithLine($this->finishedGood, $this->component, 'active');

    asAdmin()
        ->post(route('production.store'), ['product_id' => $this->finishedGood->id, 'bom_id' => $bom->id, 'target_quantity' => 5])
        ->assertSessionHasNoErrors();

    expect(ProductionOrder::sole()->bom_id)->toBe($bom->id);
});

it('rejects a bom that is not the product\'s active bom', function () {
    bomWithLine($this->finishedGood, $this->component, 'active');
    $otherProduct = Product::factory()->create();
    $otherBom = bomWithLine($otherProduct, $this->component, 'active');

    asAdmin()
        ->post(route('production.store'), ['product_id' => $this->finishedGood->id, 'bom_id' => $otherBom->id, 'target_quantity' => 5])
        ->assertSessionHasErrors('bom_id');

    expect(ProductionOrder::count())->toBe(0);
});

it('does not create an order for a product without an active bom', function () {
    bomWithLine($this->finishedGood, $this->component, 'draft');

    asAdmin()
        ->post(route('production.store'), ['product_id' => $this->finishedGood->id, 'target_quantity' => 5])
        ->assertSessionHasErrors('bom_id');

    expect(ProductionOrder::count())->toBe(0);
});

it('does not create an order from a bom page whose bom is not active', function () {
    $bom = bomWithLine($this->finishedGood, $this->component, 'draft');

    asAdmin()
        ->post(route('bom.create-production-order', $bom), ['target_quantity' => 5])
        ->assertSessionHasErrors('bom');

    expect(ProductionOrder::count())->toBe(0);
});
