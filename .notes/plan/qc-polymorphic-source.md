# Refactor: QC inspections get a polymorphic source

Status: Planned. Complete before Phase 5 of the production plan.

## Why
QC entries are created from a Receive Order today (`quality_controls.receive_order_id`). Production Outputs need the same inspection flow. Instead of a second QC feature, a QC entry gets a `source` that can be a Receive Order or a Production Output.

## Target shape
- `quality_controls.source_type` (string, 40) and `source_id` (unsigned bigint), index on `(source_type, source_id)`.
- Aliases: `receive_order`, `production_output`.
- `QualityControl::source(): MorphTo`
- `ReceiveOrder::qualityControls(): MorphMany` (use `MorphOne` if it is one QC per receive order today; check the current cardinality first)
- `ProductionOrderOutput::qualityControl(): MorphOne`

## Migration sequence (expand, migrate, contract)
Never rename in one step. Each step is its own deploy.

1. **Expand.** Add nullable `source_type`, `source_id` and the index. Nothing reads them yet.
2. **Backfill.** In chunks (`chunkById(500)`), set `source_type = 'receive_order'`, `source_id = receive_order_id` where `source_id IS NULL`. Verify: `SELECT COUNT(*) ... WHERE source_id IS NULL` returns 0.
3. **Dual write and switch readers.** QC creation for receive orders writes both `receive_order_id` and `source_*`. Every reader of `$qc->receiveOrder` moves to `$qc->source`. Keep a temporary `receiveOrder` accessor that returns the source when it is a receive order, so nothing breaks mid-refactor.
4. **Enforce.** Make `source_type` and `source_id` NOT NULL.
5. **Contract.** One release later, drop `receive_order_id` (and its foreign key) and the accessor.

## Morph map: do not enforce globally
Register only the two new aliases with `Relation::morphMap([...])`. Do **not** use `enforceMorphMap` unless you have audited every polymorphic relation in the app. Laravel's notifications table, activity logs, and media libraries store full class names in existing rows. Enforcing a map makes those lookups fail or miss old rows.

## What pass and fail do, per source
| Source | On pass | On fail |
|---|---|---|
| `receive_order` | Unchanged | Unchanged |
| `production_output` | Output batch becomes released and counts as Available Stock | Output batch is rejected |

For production outputs no stock operation is written at QC time. The In operation was written when the order completed, with the batch in quarantine. QC only changes the batch status. Read how the receive flow changes batch status today and reuse that exact code path. Do not write a second one.

To avoid an if-chain by source type, give both source models one small method, `inspectableBatches(): Collection`, and let the existing "apply QC result to batches" step call it. Add this only if the current code branches on source; otherwise leave it alone.

## Reads and UI
- `$qc->source` is N+1 across many types. On the QC list use `->with(['source' => fn (MorphTo $m) => $m->morphWith([ReceiveOrder::class => ['supplier'], ProductionOrderOutput::class => ['batch.product', 'order']])])`.
- QC list gets a Source column (type badge plus link) and a source-type filter.
- No permission changes: the QC role already owns inspections.

## Known trade-off
Polymorphic columns cannot have a database foreign key, so integrity is enforced in the application. With only two sources, two nullable FK columns plus a `CHECK` that exactly one is set would keep real foreign keys. Polymorphic was chosen because it is the established Laravel idiom and a third source costs no migration. Mitigation: a scheduled `qc:check-orphans` command that reports QC rows whose source no longer exists.

## Tests
- Backfill: seed QC rows with only `receive_order_id`, run the backfill, assert every row resolves `source` to the same receive order.
- Existing QC feature tests pass unchanged after step 3.
- A production output QC pass releases the batch; a fail rejects it; neither writes a stock operation.
- The QC list renders a mixed set of sources in a constant number of queries.

## Rollback
Steps 1 to 4 are reversible because `receive_order_id` still exists. After step 5 the rollback is restoring the column from `source_id` where `source_type = 'receive_order'`.
