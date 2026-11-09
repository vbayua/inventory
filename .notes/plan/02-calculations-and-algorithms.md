# 02. Calculations, algorithms, invariants

## Ground rules
- **No floats.** Quantities are decimal strings in PHP (`decimal:4` casts) and `brick/math` `BigDecimal` for arithmetic (it ships with Laravel; check the installed version).
- **Round requirements UP** to 4 decimals. Rounding up never under-reserves material.
- **One definition of "usable stock"** lives in one class (`StockLevels`). The release check, the issue check, and the FEFO suggestion all call it, so they can never disagree.
- **Events are the truth, caches are speed.** `quantity_issued` and `quantity_reserved` are caches of the issues table, maintained in the same transaction and verified by a reconcile command.

## Formulas

**F1. Requirement per component** (computed at Release, then frozen)
```
required = quantity_per_unit × target_quantity × (1 + scrap_percentage / 100)   [round UP to 4 dp]
```
Example: 1000 shampoos. Surfactant 0.5 kg/unit, scrap 5%: `0.5 × 1000 × 1.05 = 525.0000 kg`. Bottle 1/unit, scrap 2%: `1020`.

```php
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;

final class RequirementCalculator
{
    public function required(string $perUnit, string $target, string $scrapPct): string
    {
        return (string) BigDecimal::of($perUnit)
            ->multipliedBy($target)
            ->multipliedBy(BigDecimal::of('100')->plus($scrapPct))
            ->dividedBy('100', 4, RoundingMode::UP);
    }
}
```

**F2. Usable on hand** (per product and warehouse)
```
usable_on_hand = Σ on_hand of batches where status = released AND (expiry_date IS NULL OR expiry_date >= today)
```
Quarantined, rejected, and expired batches never count. "Today" comes from `Carbon::today()` in the app timezone, used everywhere.

**F3. Reserved**
```sql
SELECT COALESCE(SUM(quantity_reserved), 0)
FROM production_order_materials
WHERE component_product_id = :product AND warehouse_id = :warehouse;
```
Cancelled and completed orders hold zero, so no status join is needed.

**F4. Available**
```
available = usable_on_hand − reserved
```
Release check for a draft, which holds no reservation yet: `available >= required` for every line.

**F5. Issue cap** (per component, at issue time)
```
cap = available + this line's quantity_reserved     (= usable_on_hand − reserved by all other orders)
total picked in this request must be ≤ cap, and each pick ≤ that batch's on hand
```
Worked example: usable 800 kg, other orders reserve 200, this line reserves 525. `available = 800 − 725 = 75`. `cap = 75 + 525 = 600`. The operator can never take stock another order is counting on.

**F6. Remaining reservation** (recomputed, never incremented)
```
quantity_reserved = max(quantity_required − quantity_issued, 0)      while released or in_progress
quantity_reserved = 0                                                 when completed or cancelled
```

**F7. Yield and output variance** (at completion)
```
produced_primary  = Σ quantity of outputs with output_type = primary
yield_percent     = produced_primary / target_quantity × 100
output_variance   = produced_primary − target_quantity          (negative = short)
short_close       = produced_primary < target_quantity          → variance_note required
```

**F8. Material usage variance** (reporting)
```
plan_variance   = quantity_issued − quantity_required
expected_actual = quantity_per_unit × produced_primary × (1 + scrap/100)
usage_variance  = quantity_issued − expected_actual
usage_variance_pct = usage_variance / expected_actual × 100
```
Example: required 525, issued 540, produced 950 of 1000. `plan_variance = +15`. `expected_actual = 0.5 × 950 × 1.05 = 498.75`. `usage_variance = +41.25` (8.27% over). `usage_variance` is the fair measure: it separates "we made less" from "we wasted material".

**F9. Return cap** (per material and batch)
```
returnable(material, batch) = Σ issue − Σ return   ≤ requested return
```

## Invariants (assert these in tests and in the reconcile command)
1. `quantity_issued = Σ issue − Σ return` per material.
2. `quantity_reserved = 0` unless the order is released or in_progress, else F6.
3. Every `issue` and `return` row has a `stock_operation_id`; every `write_off` row has none.
4. No batch's on hand is ever negative.
5. A completed order has ≥ 1 primary output, and each output batch has a stock In and a QC row.
6. Exactly one active BOM per product.
7. Per product and warehouse, `Σ quantity_reserved ≤ usable_on_hand` at the moment of every write. If a later event breaks it (a batch expires or fails QC), that is reported as an **at-risk reservation**, not silently ignored.

## FEFO plan
```
fefoAllocate(product, warehouse, qty):
  batches = usable batches with on_hand > 0
            ORDER BY expiry_date IS NULL, expiry_date ASC, received_at ASC, id ASC
  plan = {}
  remaining = qty
  for batch in batches while remaining > 0:
      take = min(batch.on_hand, remaining)
      plan[batch.id] = take;  remaining -= take
  return plan          # remaining > 0 means not enough usable stock
```
Batches with no expiry sort last. Ties break by oldest received (FIFO), then id, so the result is deterministic.

Override detection, per submission: for each pick, `is_override = pick.quantity > (plan[pick.batch] ?? 0)`. Example: batches B1 (exp Nov, 300), B2 (exp Dec, 400). Request 500. Plan = `{B1: 300, B2: 200}`. Picks `{B1: 100, B2: 400}` mark B2 as an override (400 > 200) and B1 as normal. Each row stores the batch FEFO would have led with (`suggested_batch_id`) and a note is required.

## Lock order (prevents deadlocks)
Every write path takes locks in this order and never reverses it:

**order row → material rows (by id) → product rows (by id) → batch rows (by id)**

- Product rows are the mutex for "reserved vs available" on that product. Two releases or issues on the same component serialize there.
- **No plain reads before the product locks are held.** InnoDB starts its snapshot at the first non-locking `SELECT`. If one runs before the product lock is acquired, the later `SUM` queries read that older snapshot and miss a reservation the other transaction just committed. Every read before the product lock must itself be a locking read (`lockForUpdate()` or `sharedLock()`). Route-model binding runs before the transaction, so it is fine.
- The alternative is to run these transactions at `READ COMMITTED` (see doc 03), which makes read order irrelevant.
- Wrap in `DB::transaction($callback, attempts: 3)` so a rare deadlock retries.

## Algorithms

### Release
```
lock order; assert status = draft; assert bom.status = active
lock products (component ids, ascending)
materials = rebuild from bom_lines with F1 (delete and re-insert; drafts have no dependents)
for each material:
    avail = usable_on_hand − reserved            (F2, F3, F4)
    if avail < required → collect shortage {product, required, available, short}
if any shortage → throw InsufficientStockException(shortages)   # hard block, nothing written
materials.quantity_reserved = quantity_required
order.status = released; released_by/at
after commit: ProductionOrderReleased
```

### Issue
```
if issues.exists(request_uuid) → return the original result (idempotent)
lock order; assert in_progress; lock material (belongs to order); lock product; lock batches (ascending)
each batch: same product and warehouse, usable (F2 rules), pick.qty ≤ on_hand
total = Σ pick.qty; cap = F5; if total > cap → fail
isOver = material.issued + total > material.required
plan = fefoAllocate(product, warehouse, total); mark is_override per pick
if (isOver or any override) and note is blank → validation error on `note`
for each pick: stock Out operation (ref = order); insert issue row (type = issue, is_override, suggested_batch_id, note, request_uuid)
material.issued += total; material.reserved = F6
after commit: MaterialIssued
```
`request_uuid` is shared by all rows of one submission; the unique index is `(request_uuid, batch_id)`, so a repeated submission fails on the first insert and the whole transaction rolls back.

### Return (during the run)
```
lock order; assert in_progress; lock material, product, batch
assert qty ≤ F9 for (material, batch)
stock return-to-stock operation into that batch
insert issue row (type = return)
material.issued −= qty; material.reserved = F6
```
Returns into a batch that has since expired or been quarantined are allowed (the material is physically back). It raises the reservation, so the at-risk report may flag it.

### Complete
```
lock order; assert in_progress
assert ≥ 1 issue row exists, else error "nothing was issued"
outputs: ≥ 1 primary, each qty > 0, each with an expiry date
produced_primary = Σ primary; if produced_primary < target and variance_note blank → error
for each output:
    batch = existing create-batch action (product = order.product, status = quarantine, expiry)
    stock In operation (ref = order)
    output row
    QC row via existing action, source = output
all materials.reserved = 0
order.produced_quantity, variance_note, status = completed, completed_by/at
after commit: ProductionOrderCompleted
```
Leftover issued material should be returned before completing. Whatever is not returned counts as consumed and appears in F8.

### Cancel
```
lock order; assert status in (draft, released, in_progress)
require cancel_note
if in_progress and net issued > 0:
    for each (material, batch) with net issued n:
        r = supervisor's return quantity (default n; 0 ≤ r ≤ n)
        if r > 0: stock return-to-stock op; issue row type = return
        if n − r > 0: issue row type = write_off, stock_operation_id = NULL, note required
    material.issued reflects returns only
all materials.reserved = 0
order.status = cancelled; cancelled_by/at; cancel_note
after commit: ProductionOrderCancelled
```
No stock operation is written for a write-off. The Issue already took that quantity out of stock.

### Start
`released → in_progress`. Sets `started_by/at`. No stock effect.

## Edge cases
| Situation | Behavior |
|---|---|
| Two supervisors release competing orders at once | Serialize on the product lock; the second sees the first's reservation and may be blocked |
| Operator double-taps Issue | Second submission hits the `request_uuid` unique index and returns the original result |
| Batch expires or fails QC after release | Reservation stays; at-risk report shows `usable_on_hand < reserved`; issue-time check blocks unusable batches |
| BOM retired while an order is draft | Release is blocked with "re-sync to the active BOM". In-progress orders are untouched |
| Product UoM changed after BOM built | Release re-validates `uom`; mismatch blocks with a clear message |
| Complete with a short output | Allowed with a variance note |
| Complete with output above target | Allowed; shown as positive `output_variance` |
| Cancel with nothing issued | Reservations released; no stock operations |
| Return to a different batch than issued | Not allowed; returns go to the source batch |

## Reconcile command
`php artisan production:reconcile` (scheduled daily, report only, never auto-fixes):
- Materials where cached `quantity_issued` or `quantity_reserved` differ from the recomputed value.
- Issue rows whose `stock_operation_id` is missing or points at a mismatched batch or quantity.
- **At-risk reservations:** product and warehouse pairs where `Σ reserved > usable_on_hand`.
- Completed orders missing outputs, batches, or QC rows.
