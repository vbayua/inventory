<?php

use App\Enums\ProductionOrderIssueType;
use App\Models\Batch;
use App\Models\Bom;
use App\Models\Location;
use App\Models\Product;
use App\Models\ProductionOrder;
use App\Models\ProductionOrderIssue;
use App\Models\ProductionOrderMaterial;
use App\Models\Stock;
use Database\Seeders\BlankStateSeeder;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);

    $finishedGood = Product::factory()->create();
    $this->component = Product::factory()->create();
    $this->location = Location::factory()->create();

    $bom = Bom::create(['product_id' => $finishedGood->id, 'version' => 1, 'status' => 'active']);

    $this->production = ProductionOrder::create([
        'order_number' => 'PO-0001',
        'product_id' => $finishedGood->id,
        'bom_id' => $bom->id,
        'target_quantity' => 10,
        'status' => 'draft',
    ]);

    $this->material = ProductionOrderMaterial::create([
        'production_order_id' => $this->production->id,
        'component_product_id' => $this->component->id,
        'unit' => 'pcs',
        'quantity_per_unit' => 1,
        'quantity_required' => 10,
    ]);
});

function stockWithBatch(Product $product, Location $location, ?string $expiryDate, float $quantity, string $manufactureDate = '2026-01-01'): Stock
{
    $batch = Batch::factory()->create([
        'product_id' => $product->id,
        'manufacture_date' => $manufactureDate,
        'expiry_date' => $expiryDate,
    ]);

    return Stock::create([
        'product_id' => $product->id,
        'location_id' => $location->id,
        'batch_id' => $batch->id,
        'quantity' => $quantity,
        'unit' => 'pcs',
    ]);
}

function issueCreateUrl(ProductionOrder $production, ProductionOrderMaterial $material): string
{
    return route('production.issue.create', [$production, $material]);
}

it('suggests the issuable stock with the earliest expiry', function () {
    stockWithBatch($this->component, $this->location, null, 50);
    stockWithBatch($this->component, $this->location, now()->addMonths(6)->toDateString(), 50);
    $earliest = stockWithBatch($this->component, $this->location, now()->addMonth()->toDateString(), 50);

    asAdmin()
        ->get(issueCreateUrl($this->production, $this->material))
        ->assertInertia(fn (Assert $page) => $page
            ->reloadOnly('suggestedBatch', fn (Assert $reload) => $reload
                ->where('suggestedBatch.id', $earliest->id)
                ->where('suggestedBatch.batch.batch_number', $earliest->batch->batch_number)));
});

it('skips expired and empty stocks when suggesting a batch', function () {
    stockWithBatch($this->component, $this->location, now()->subDay()->toDateString(), 50);
    stockWithBatch($this->component, $this->location, now()->addDay()->toDateString(), 0);
    $issuable = stockWithBatch($this->component, $this->location, now()->addYear()->toDateString(), 50);

    asAdmin()
        ->get(issueCreateUrl($this->production, $this->material))
        ->assertInertia(fn (Assert $page) => $page
            ->reloadOnly(['stocks', 'suggestedBatch'], fn (Assert $reload) => $reload
                ->where('suggestedBatch.id', $issuable->id)
                ->has('stocks', 1)
                ->where('stocks.0.id', $issuable->id)));
});

it('does not load stocks or suggested batch on the initial visit', function () {
    stockWithBatch($this->component, $this->location, null, 50);

    asAdmin()
        ->get(issueCreateUrl($this->production, $this->material))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Production/Issue/Create', false)
            ->missing('stocks')
            ->missing('suggestedBatch'));
});

function issueStoreUrl(ProductionOrder $production, ProductionOrderMaterial $material): string
{
    return route('production.issue.store', [$production, $material]);
}

it('issues stock, logs the issue and deducts the stock', function () {
    $this->production->update(['status' => 'released']);
    $stock = stockWithBatch($this->component, $this->location, null, 50);
    $requestUuid = (string) Str::uuid();

    asAdmin()
        ->post(issueStoreUrl($this->production, $this->material), [
            'request_uuid' => $requestUuid,
            'picks' => [['stock_id' => $stock->id, 'quantity' => 30]],
            'note' => 'First issue',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('production.show', $this->production));

    $issue = ProductionOrderIssue::sole();
    expect($issue->request_uuid)->toBe($requestUuid)
        ->and($issue->batch_id)->toBe($stock->batch_id)
        ->and($issue->type)->toBe(ProductionOrderIssueType::Issue)
        ->and((float) $issue->quantity)->toBe(30.0)
        ->and($issue->operation_id)->not->toBeNull()
        ->and($issue->is_override)->toBeFalsy()
        ->and((float) $stock->fresh()->quantity)->toBe(20.0)
        ->and((float) $this->material->fresh()->quantity_issued)->toBe(30.0);
});

it('ignores a replayed request uuid', function () {
    $this->production->update(['status' => 'in_progress']);
    $stock = stockWithBatch($this->component, $this->location, null, 50);
    $payload = [
        'request_uuid' => (string) Str::uuid(),
        'picks' => [['stock_id' => $stock->id, 'quantity' => 10]],
    ];

    asAdmin()->post(issueStoreUrl($this->production, $this->material), $payload)->assertSessionHasNoErrors();
    asAdmin()->post(issueStoreUrl($this->production, $this->material), $payload)->assertSessionHasNoErrors();

    expect(ProductionOrderIssue::count())->toBe(1)
        ->and((float) $stock->fresh()->quantity)->toBe(40.0)
        ->and((float) $this->material->fresh()->quantity_issued)->toBe(10.0);
});

it('rejects issuing when the production order is not released or in progress', function (string $status) {
    $this->production->update(['status' => $status]);
    $stock = stockWithBatch($this->component, $this->location, null, 50);

    asAdmin()
        ->post(issueStoreUrl($this->production, $this->material), [
            'request_uuid' => (string) Str::uuid(),
            'picks' => [['stock_id' => $stock->id, 'quantity' => 10]],
        ])
        ->assertSessionHasErrors('status');

    expect(ProductionOrderIssue::count())->toBe(0)
        ->and((float) $stock->fresh()->quantity)->toBe(50.0);
})->with(['draft', 'completed', 'cancelled']);

it('rejects issuing more than the batch holds', function () {
    $this->production->update(['status' => 'released']);
    $stock = stockWithBatch($this->component, $this->location, null, 5);

    asAdmin()
        ->post(issueStoreUrl($this->production, $this->material), [
            'request_uuid' => (string) Str::uuid(),
            'picks' => [['stock_id' => $stock->id, 'quantity' => 6]],
        ])
        ->assertSessionHasErrors('picks.0.quantity');

    expect(ProductionOrderIssue::count())->toBe(0)
        ->and((float) $stock->fresh()->quantity)->toBe(5.0);
});

it('rejects stock of a different product', function () {
    $this->production->update(['status' => 'released']);
    $otherStock = stockWithBatch(Product::factory()->create(), $this->location, null, 50);

    asAdmin()
        ->post(issueStoreUrl($this->production, $this->material), [
            'request_uuid' => (string) Str::uuid(),
            'picks' => [['stock_id' => $otherStock->id, 'quantity' => 1]],
        ])
        ->assertSessionHasErrors('picks.0.stock_id');

    expect(ProductionOrderIssue::count())->toBe(0);
});
