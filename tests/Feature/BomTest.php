<?php

use App\Enums\BomStatus;
use App\Models\Bom;
use App\Models\Product;
use Database\Seeders\BlankStateSeeder;
use Illuminate\Database\UniqueConstraintViolationException;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
});

it('activates a bom as its product\'s active bom and stamps who activated it', function () {
    $bom = Bom::create(['product_id' => Product::factory()->create()->id, 'version' => 1, 'status' => 'draft']);

    asAdmin()
        ->put(route('bom.activate', $bom))
        ->assertRedirect(route('bom.show', $bom))
        ->assertSessionHas('success');

    $bom->refresh();

    expect($bom->status)->toBe(BomStatus::Active)
        ->and($bom->activated_at)->not->toBeNull()
        ->and($bom->activated_by)->not->toBeNull()
        ->and($bom->product->activeBom->is($bom))->toBeTrue();
});

it('retires the product\'s previously active bom when a new version is activated', function () {
    $product = Product::factory()->create();
    $previousBom = Bom::create(['product_id' => $product->id, 'version' => 1, 'status' => 'active']);
    $nextBom = Bom::create(['product_id' => $product->id, 'version' => 2, 'status' => 'draft']);

    asAdmin()->put(route('bom.activate', $nextBom))->assertSessionHas('success');

    expect($nextBom->refresh()->status)->toBe(BomStatus::Active)
        ->and($previousBom->refresh()->status)->toBe(BomStatus::Retired)
        ->and($product->activeBom->is($nextBom))->toBeTrue();
});

it('stores a new bom for a product as its next version', function () {
    $product = Product::factory()->create();
    $component = Product::factory()->create();
    Bom::create(['product_id' => $product->id, 'version' => 1, 'status' => 'active']);

    asAdmin()
        ->post(route('bom.store'), [
            'product_id' => $product->id,
            'materials' => [['product_id' => $component->id, 'quantity_per_unit' => 2, 'unit' => 'pcs']],
        ])
        ->assertSessionHasNoErrors();

    $nextBom = Bom::where('product_id', $product->id)->where('version', 2)->sole();

    expect($nextBom->status)->toBe(BomStatus::Draft)
        ->and($nextBom->lines()->sole()->component_product_id)->toBe($component->id);
});

it('rejects a bom that lists the same component twice', function () {
    $product = Product::factory()->create();
    $component = Product::factory()->create();

    asAdmin()
        ->post(route('bom.store'), [
            'product_id' => $product->id,
            'materials' => [
                ['product_id' => $component->id, 'quantity_per_unit' => 2, 'unit' => 'pcs'],
                ['product_id' => $component->id, 'quantity_per_unit' => 3, 'unit' => 'pcs'],
            ],
        ])
        ->assertSessionHasErrors(['materials.0.product_id', 'materials.1.product_id']);

    expect(Bom::where('product_id', $product->id)->exists())->toBeFalse();
});

it('flashes a safe message instead of the sql error when a bom version collides', function () {
    $product = Product::factory()->create();
    $component = Product::factory()->create();

    Bom::creating(function (Bom $bom) {
        throw new UniqueConstraintViolationException('mysql', 'insert into `boms` ...', [], new Exception('SQLSTATE[23000]'));
    });

    asAdmin()
        ->post(route('bom.store'), [
            'product_id' => $product->id,
            'materials' => [['product_id' => $component->id, 'quantity_per_unit' => 2, 'unit' => 'pcs']],
        ])
        ->assertSessionHas('error', fn (string $message) => ! str_contains($message, 'SQLSTATE') && ! str_contains($message, 'insert into'));
});

it('updates a draft bom by retiring it and creating the next version with the new materials', function () {
    $product = Product::factory()->create();
    $bom = Bom::create(['product_id' => $product->id, 'version' => 1, 'status' => 'draft']);
    $oldComponent = Product::factory()->create();
    $bom->lines()->create(['component_product_id' => $oldComponent->id, 'quantity_per_unit' => 1, 'unit' => 'pcs']);
    $newComponent = Product::factory()->create();

    asAdmin()
        ->put(route('bom.update', $bom), [
            'materials' => [['component_product_id' => $newComponent->id, 'quantity_per_unit' => 5, 'unit' => 'kg']],
        ])
        ->assertRedirect(route('bom.show', $bom))
        ->assertSessionHas('success');

    $nextBom = Bom::where('product_id', $product->id)->where('version', 2)->sole();
    $line = $nextBom->lines()->sole();

    expect($bom->refresh()->status)->toBe(BomStatus::Retired)
        ->and($nextBom->status)->toBe(BomStatus::Draft)
        ->and($line->component_product_id)->toBe($newComponent->id)
        ->and($line->quantity_per_unit)->toBe(5)
        ->and($line->unit)->toBe('kg');
});

it('does not create a new version when the submitted materials match the current ones', function () {
    $product = Product::factory()->create();
    $bom = Bom::create(['product_id' => $product->id, 'version' => 1, 'status' => 'draft']);
    $component = Product::factory()->create();
    $bom->lines()->create(['component_product_id' => $component->id, 'quantity_per_unit' => 1, 'unit' => 'pcs']);

    asAdmin()
        ->put(route('bom.update', $bom), [
            'materials' => [['component_product_id' => $component->id, 'quantity_per_unit' => 1, 'unit' => 'pcs']],
        ])
        ->assertRedirect(route('bom.show', $bom))
        ->assertSessionHas('info');

    expect($bom->refresh()->status)->toBe(BomStatus::Draft)
        ->and(Bom::where('product_id', $product->id)->count())->toBe(1);
});

it('rejects updating a bom that is not a draft', function () {
    $product = Product::factory()->create();
    $bom = Bom::create(['product_id' => $product->id, 'version' => 1, 'status' => 'active']);
    $component = Product::factory()->create();
    $bom->lines()->create(['component_product_id' => $component->id, 'quantity_per_unit' => 1, 'unit' => 'pcs']);
    $newComponent = Product::factory()->create();

    asAdmin()
        ->put(route('bom.update', $bom), [
            'materials' => [['component_product_id' => $newComponent->id, 'quantity_per_unit' => 5, 'unit' => 'kg']],
        ])
        ->assertSessionHasErrors(['message']);

    expect($bom->lines()->sole()->component_product_id)->toBe($component->id);
});

it('does not reactivate a retired bom', function () {
    $product = Product::factory()->create();
    $retiredBom = Bom::create(['product_id' => $product->id, 'version' => 1, 'status' => 'retired']);
    $activeBom = Bom::create(['product_id' => $product->id, 'version' => 2, 'status' => 'active']);

    asAdmin()->put(route('bom.activate', $retiredBom))->assertSessionHasErrors('status');

    expect($retiredBom->refresh()->status)->toBe(BomStatus::Retired)
        ->and($activeBom->refresh()->status)->toBe(BomStatus::Active);
});
