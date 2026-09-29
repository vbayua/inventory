# 03. Laravel and React patterns

## Consistency first
These are defaults for when your codebase has no established pattern. Before writing anything, look at how your existing PO, Receive Order, and Stock Operation code is organized (Actions, Services, Repositories, Form Requests, Resources) and follow that. The boundaries below matter more than the class names: thin controllers, one class per business operation, all stock writes inside one transaction. Verify version-sensitive APIs against your installed Laravel version (`Model::shouldBeStrict`, `ShouldDispatchAfterCommit`, the `decimal` validation rule, `brick/math`).

## Suggested layout
```
app/Production/            (or wherever your inventory code lives)
  Actions/                 ReleaseProductionOrder, StartProductionOrder, IssueMaterial,
                           ReturnMaterial, CompleteProductionOrder, CancelProductionOrder,
                           ActivateBom, SyncDraftMaterials
  Enums/                   ProductionOrderStatus, BomStatus, IssueType, OutputType
  Events/                  ProductionOrderReleased, MaterialIssued, ProductionOrderCompleted, ProductionOrderCancelled
  Exceptions/              InvalidStateTransition, InsufficientStockException
  Http/Controllers/        thin
  Http/Requests/           one per write endpoint
  Http/Resources/          ProductionOrderResource, MaterialResource, ...
  Models/
  Policies/
  Services/                RequirementCalculator, StockLevels, FefoAllocator
```

## Enums and the state machine
```php
enum ProductionOrderStatus: string
{
    case Draft = 'draft';
    case Released = 'released';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, match ($this) {
            self::Draft => [self::Released, self::Cancelled],
            self::Released => [self::InProgress, self::Cancelled],
            self::InProgress => [self::Completed, self::Cancelled],
            self::Completed, self::Cancelled => [],
        }, true);
    }

    public function assertCanTransitionTo(self $to): void
    {
        $this->canTransitionTo($to) || throw new InvalidStateTransition($this, $to);
    }
}
```
`status` is **not** in `$fillable`. Only Actions set it.

## Models
- Casts: `'status' => ProductionOrderStatus::class`, quantities `'decimal:4'` (returns strings; never cast to float).
- `ProductionOrderIssue` is append-only:
```php
final class ProductionOrderIssue extends Model
{
    public const UPDATED_AT = null;

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Issues are append-only.'));
        static::deleting(fn () => throw new LogicException('Issues are append-only.'));
    }
}
```
- In `AppServiceProvider::boot()`:
```php
Model::shouldBeStrict(! app()->isProduction());   // lazy loading, silent attribute discards, missing attributes throw in dev and tests
Relation::morphMap([
    'receive_order' => ReceiveOrder::class,
    'production_output' => ProductionOrderOutput::class,
    'production_order' => ProductionOrder::class,
]);   // NOT enforceMorphMap; see the QC refactor note
```

## One place that defines stock
`StockLevels` wraps your existing stock tables. It is the only code allowed to answer these questions:
```php
interface StockLevels
{
    /** @param list<int> $productIds  @return Collection<int, string> productId => decimal string */
    public function usableOnHand(array $productIds, int $warehouseId): Collection;

    /** @return Collection<int, string> productId => decimal string */
    public function reserved(array $productIds, int $warehouseId): Collection;

    /** Usable batches with on hand > 0, in FEFO order. */
    public function usableBatches(int $productId, int $warehouseId): Collection;
}
```
Take **arrays of product ids** and return grouped results, so a 30-line order costs 2 queries, not 60.

## Actions: transaction, locks, then work
```php
final class ReleaseProductionOrder
{
    public function __construct(
        private StockLevels $stock,
        private RequirementCalculator $calculator,
    ) {}

    public function handle(ProductionOrder $order, User $user): ProductionOrder
    {
        return DB::transaction(function () use ($order, $user) {
            // 1. Locks first, in the documented order. Reads before the product locks must be locking reads.
            $order = ProductionOrder::query()->lockForUpdate()->findOrFail($order->getKey());
            $order->status->assertCanTransitionTo(ProductionOrderStatus::Released);

            $lines = BomLine::query()->where('bom_id', $order->bom_id)->sharedLock()->get();
            $productIds = $lines->pluck('component_product_id')->sort()->values()->all();
            Product::query()->whereIn('id', $productIds)->orderBy('id')->lockForUpdate()->get();

            // 2. Guards
            throw_unless($order->bom()->where('status', BomStatus::Active)->exists(), BomNotActive::class);

            // 3. Rebuild and check
            $order->materials()->delete();
            $materials = $lines->map(fn (BomLine $l) => $order->materials()->create([
                'component_product_id' => $l->component_product_id,
                'warehouse_id' => $order->warehouse_id,
                'uom' => $l->uom,
                'quantity_per_unit' => $l->quantity_per_unit,
                'scrap_percentage' => $l->scrap_percentage,
                'quantity_required' => $this->calculator->required(
                    $l->quantity_per_unit, $order->target_quantity, $l->scrap_percentage),
            ]));

            $onHand = $this->stock->usableOnHand($productIds, $order->warehouse_id);
            $reserved = $this->stock->reserved($productIds, $order->warehouse_id);

            $shortages = $materials->filter(fn ($m) => bccomp(
                bcsub($onHand[$m->component_product_id] ?? '0', $reserved[$m->component_product_id] ?? '0', 4),
                $m->quantity_required, 4) < 0);

            if ($shortages->isNotEmpty()) {
                throw new InsufficientStockException($shortages);   // rolls back, nothing written
            }

            // 4. Write
            $materials->each->update(['quantity_reserved' => DB::raw('quantity_required')]);
            $order->forceFill([
                'status' => ProductionOrderStatus::Released,
                'released_by' => $user->id,
                'released_at' => now(),
            ])->save();   // status is not fillable, so forceFill

            ProductionOrderReleased::dispatch($order);   // event implements ShouldDispatchAfterCommit
            return $order->refresh();
        }, attempts: 3);
    }
}
```
Notes:
- `status` is guarded, so Actions set it with `forceFill(...)->save()` (or assign and save). A plain `update(['status' => ...])` would be silently discarded, and `shouldBeStrict` makes that throw in dev.
- `bccomp`/`bcsub` need the `bcmath` PHP extension; use `BigDecimal` if you prefer.
- `DB::raw('quantity_required')` copies the column atomically; a plain assignment loop works too.

**Issue** follows the same shape: lock order, lock material, lock product, lock batches ascending; then `StockLevels`, FEFO plan, cap check, per-pick stock Out operation, issue rows, cache update. **Cancel** and **Complete** lock the order first, then only what they write.

**READ COMMITTED alternative.** If the lock-read discipline feels fragile, run these transactions at READ COMMITTED: call `DB::statement('SET TRANSACTION ISOLATION LEVEL READ COMMITTED')` immediately before `DB::transaction()`, only when `DB::transactionLevel() === 0` (inside a wrapping test transaction MariaDB rejects it). Put that in one `runLocked()` helper so every Action uses the same path.

## Stock operations from inside actions
Call your existing stock-operation service, passing the batch, quantity, type, and the order as the reference. Do not insert into `stock_operations` directly and do not write stock changes from listeners: **stock writes are synchronous and inside the same transaction**. Listeners are for notifications, dashboards, and cache busting only.

## Form Requests (shape only; state-dependent rules live in the Action)
```php
final class IssueMaterialRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'request_uuid' => ['required', 'uuid'],
            'material_id' => ['required', 'integer', Rule::exists('production_order_materials', 'id')
                ->where('production_order_id', $this->route('order')->id)],
            'picks' => ['required', 'array', 'min:1'],
            'picks.*.batch_id' => ['required', 'integer', 'exists:batches,id', 'distinct'],
            'picks.*.quantity' => ['required', 'decimal:0,4', 'gt:0'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
```
Whether a note is required depends on FEFO and over-issue, which are only knowable **after** the locks. The Action throws `ValidationException::withMessages(['note' => '...'])` in that case, which Inertia renders on the `note` field like any other error.

Cancel request: `cancel_note` required; `returns.*.material_id`, `returns.*.batch_id`, `returns.*.quantity` (`gte:0`); `writeoff_note` required when any line's remainder is greater than zero (checked in the Action).

## Authorization
```php
final class ProductionOrderPolicy
{
    public function release(User $user, ProductionOrder $order): bool
    {
        return $user->can('production.order.release');
    }
    // start, issue, return, complete, cancel: same pattern
}
```
Controllers call `$this->authorize('release', $order)`. The Resource exposes what the UI may show:
```php
'abilities' => [
    'release' => $request->user()->can('release', $this->resource)
        && $this->status->canTransitionTo(ProductionOrderStatus::Released),
    // ...
],
```
Test the matrix as a dataset (role × action → allowed) so a role change cannot silently open cancel to operators.

## Controllers and Inertia
```php
public function release(ProductionOrder $order, ReleaseProductionOrder $release): RedirectResponse
{
    $this->authorize('release', $order);

    try {
        $release->handle($order, request()->user());
    } catch (InsufficientStockException $e) {
        return back()->withErrors(['release' => 'Some components are short.'])
                     ->with('shortages', $e->toArray());
    }

    return back()->with('success', 'Order released.');
}
```
Always return **Resources**, not raw models, to Inertia: they fix the shape, hide columns, and keep lazy loading from firing during serialization.

## Events
Events implement `ShouldDispatchAfterCommit` (Laravel 10+; otherwise use `DB::afterCommit`). A rolled-back release must not notify anyone.

## Exceptions
Domain exceptions (`InvalidStateTransition`, `InsufficientStockException`, `BomNotActive`) extend a base `ProductionException`. The controller layer maps them to validation errors or a 409. Never leak SQL errors to the user, and log unexpected ones with the order id in context.

## Migrations
- One migration per table, reversible `down()`, foreign keys with `restrictOnDelete()` except where cascade is deliberate (`bom_lines`, `production_order_materials`).
- MariaDB identifier limit is 64 characters: name long indexes explicitly (`->index([...], 'poi_material_batch_idx')`).
- Add CHECK constraints and the generated column as raw statements or `storedAs`; test `migrate:rollback` in CI.
- Never edit a migration that has run in production; add a new one.

## Queries and performance
- Eager load everything the page shows (`with(['product', 'materials.component', 'outputs.batch'])`). `shouldBeStrict` will fail your tests on any lazy load.
- List pages: `paginate()`, select only needed columns, `withSum('materials', 'quantity_required')` for progress, never `count()` in a loop.
- Indexes are in doc 01. Check the reservation sum and the FEFO query with `EXPLAIN` on realistic data.
- Recall queries: `production_order_issues` by `batch_id` (forward), the order's issues by `production_order_id` (backward). Lineage is at **order level**: if one order fills several output batches, every input batch links to all of them.

## Order numbering
Reuse the sequence mechanism your PO and Receive Order use. If there is none, keep a `document_sequences` row per prefix and year, `lockForUpdate()` it inside the creating transaction, and increment. Never `max(id) + 1`.

## Testing
Use your existing test framework and factories.

- **Unit:** `RequirementCalculator` table-driven (scrap 0, rounding up, large targets), FEFO allocator (null expiry last, ties, insufficient stock).
- **Feature, one file per Action:** happy path, every guard, and the invariants from doc 02 asserted after each.
- **Release:** hard block with a shortage list and nothing written; second release sees the first's reservation.
- **Issue:** cap enforced; over-issue and override need a note; expired, quarantined, and rejected batches refused; duplicate `request_uuid` is a no-op.
- **Cancel:** returns plus write-offs sum to net issued; write-off writes no stock operation; reservations reach zero; stock quantities equal expectation.
- **Complete:** short close needs a note; outputs are quarantined with In operations and QC rows.
- **Policy matrix:** dataset of role × ability.
- **Concurrency smoke test:** two `php artisan` processes releasing competing orders against the same component on a non-transactional test database, then assert `Σ reserved ≤ usable_on_hand`. Automated tests that share one connection cannot prove locking works.
- **Reconcile:** corrupt a cache column on purpose and assert the command reports it.
- Run the narrowest tests first, then the suite, then your formatter and static analysis.

## Frontend (Inertia, React, shadcn)
**Pages:** BOM list and editor with version history; Order list (status filter, progress); Order detail as the hub (materials table, issues timeline, outputs, actions bar).

**Dialogs (shadcn `Dialog`):**
| Dialog | Notes |
|---|---|
| Release | On failure shows the `shortages` table (component, required, available, short) |
| Issue | Component picker, quantity; server-provided FEFO suggestion prefills batch rows; changing a batch shows an "override, note required" hint |
| Return | Per (component, batch) with the maximum shown |
| Complete | Output repeater (quantity, expiry, note); running total against target; "short close, variance note required" appears when the total is below target |
| Cancel | Table of issued (component, batch) lines with return quantity prefilled and editable; the remainder shown as "written off"; note required |

**Rules:**
- The **server owns every business number**. React displays `cap`, `required`, `remaining`, `yield`; it does not compute them. Client checks are hints, and the Action is the authority.
- Show buttons from `abilities`, not from role names.
- Quantities are **strings**. Use string-safe inputs and format for display only. Do not `parseFloat` values you send back.
- Generate `request_uuid` with `crypto.randomUUID()` when the dialog opens, keep it while the dialog stays open, and disable the submit button while processing (`useForm().processing`).
- Fetch the FEFO suggestion with an Inertia partial reload (`router.reload({ only: ['fefo'], data: { material, quantity } })`) or a small JSON endpoint; cache nothing on the client.
- Use `preserveScroll` on order actions so the page does not jump.
