# 04. Implementation plan

Order of work, what "done" means, and what to check before you start. Sizes are relative for one developer including tests and UI: **S** is a few days, **M** about a week, **L** one and a half to two weeks. Treat them as rough.

## Decisions I made for you (veto any of these)
These were not explicitly settled in the interview. Each is cheap to change now and expensive after Phase 3.

1. **The snapshot is frozen at Release, not at creation.** Your research doc froze it at plan creation. A draft has no commitment, so it stays editable and its BOM can be re-synced to the active version. Release rebuilds the materials from the pinned BOM inside the release transaction, then they are immutable.
2. **Issuing is only allowed while `in_progress`.** Start is an explicit step.
3. **Completing requires at least one issue row.** An order that consumed nothing is almost certainly a mistake.
4. **Output above target needs no note.** Only a short close requires a variance note.
5. **Write-offs write no stock operation.** This corrects what I told you in Round 4. I said unreturned material would go through the Adjustment operation. That would deduct it twice: the Issue's Out operation already removed it. ADR 0003 records the corrected rule.
6. **Orders are warehouse-scoped** (`warehouse_id`). Drop it if you run a single warehouse.
7. **Returns are allowed during the run**, not only on cancel.
8. **One note per issue submission**, required if any pick is an override or the order goes over its requirement.
9. **A batch is usable through its expiry date** (`expiry_date >= today`). One scope, easy to change.
10. **Output batch expiry is entered at completion** (default it from a product shelf-life field if you have one).
11. **Requirements round up** to 4 decimals.

## Verify in your codebase first (Phase 0)
I could not see your repo. Confirm each of these; several change the code in Phases 4 to 5.

- [ ] What the existing return-to-stock operation accepts (batch, quantity, reference) and that it increases that batch's on hand.
- [ ] How `stock_operations` points at a source document (morph, or free text). Add a nullable morph if missing.
- [ ] How on-hand per batch is stored: a column, or derived from a ledger; and whether it is per warehouse or location.
- [ ] Batch status values, the quarantine status the receive flow uses, the expiry column name, and how batch numbers are generated.
- [ ] What QC pass and fail do today for receive orders, and whether there is one QC row per receive order or per line.
- [ ] Permission package and naming convention; existing Policy conventions.
- [ ] Whether you already use Actions, Services, or Repositories (match it).
- [ ] Document numbering scheme for PO and Receive Order.
- [ ] Laravel version, MariaDB version (CHECK constraints need 10.2.1+), `brick/math` version, `bcmath` extension.
- [ ] Quantity decimal precision used in existing tables.
- [ ] Whether every other polymorphic relation in the app stores full class names (decides morph map handling).

## Dependency order
```
P0 ──▶ P1 ──▶ P2 ──▶ P3 ──▶ P4 ──▶ P5 ──▶ P6 ──▶ P7
 └─ QC refactor steps 1–4 can run in parallel with P1–P3 (must finish before P5)
```

## Phase 0: Prepare (S)
- Run the verification checklist above and note answers in `CONTEXT.md`.
- Implement `StockLevels` over your existing tables (`usableOnHand`, `reserved`, `usableBatches`) with tests. Reserved returns zero until Phase 3.
- Register morph aliases (non-enforcing). Add the stock-operation reference if missing.
- Seed production permissions and roles from doc 01.
- QC refactor steps 1 to 4 (`docs/refactors/qc-polymorphic-source.md`).
- **Done when:** existing QC and receiving tests pass unchanged, `StockLevels` is tested against expired, quarantined, and rejected batches, permissions exist.

## Phase 1: Bill of Materials (M)
- Migrations and models for `boms`, `bom_lines`, with the generated-column unique index and CHECK constraints.
- Actions: create draft, edit draft, **copy to new version**, `ActivateBom` (lock product, retire the previous active, activate this one, reject cycles), retire.
- Validation: component UoM equals stock UoM, no self-reference, quantity > 0, scrap 0 to 100.
- UI: BOM list, editor, version history, activate and retire buttons from `abilities`.
- **Done when:** two concurrent activations cannot both succeed, cycle detection is tested, only draft BOMs are editable, policy tests pass.

## Phase 2: Draft orders and requirement preview (M)
- Migrations for `production_orders`, `production_order_materials`; document numbering.
- `RequirementCalculator` (F1) with table-driven tests.
- Actions: create draft, edit draft, sync to active BOM, delete draft.
- Read-only availability panel per component (required, usable on hand, reserved, available) using batched `StockLevels` calls.
- UI: order list with status filter, create and edit form, detail page.
- **Done when:** calculator matches the doc 02 examples exactly, the detail page runs in a fixed number of queries, only drafts are editable.

## Phase 3: Release and reservations (M)
- `ReleaseProductionOrder` per doc 02, with the lock order and hard block. Shortage table in the UI.
- Wire `StockLevels::reserved` to the materials table.
- `production:reconcile` skeleton (cache versus recompute, at-risk reservations).
- **Done when:** a shortage writes nothing and lists every short component, a second competing release sees the first's reservation, the concurrency smoke test passes, the supervisor-only permission is tested.

## Phase 4: Start, Issue, Return (L)
- Migration for `production_order_issues` (append-only model, unique `(request_uuid, batch_id)`).
- `FefoAllocator`, `StartProductionOrder`, `IssueMaterial` (cap, override detection, over-issue note, idempotency), `ReturnMaterial`.
- UI: Issue dialog with FEFO prefill and override hint, Return dialog, issues timeline on the detail page.
- **Done when:** F5 cap is enforced with the doc 02 example, unusable batches are refused, duplicate submissions are no-ops, cached `quantity_issued` and `quantity_reserved` match a recompute after every test, stock operations exist for every issue and return.

## Phase 5: Complete, outputs, QC (L)
- Migration for `production_order_outputs`.
- `CompleteProductionOrder`: create quarantined batches through your existing batch action, In operations, QC rows with the output as source, release reservations, short-close rule.
- QC list shows the Source column and filter. QC pass releases and fail rejects the output batch, with no stock operation.
- UI: Complete dialog with output repeater, running total, and short-close hint.
- **Done when:** completing a 3-tote run creates 3 batches, 3 In operations, 3 QC rows, quarantined stock is excluded from availability until QC passes, a QC fail rejects the batch, and the order stays completed.

## Phase 6: Cancel (M)
- `CancelProductionOrder` per ADR 0003: cancel from draft, released, in_progress; per-line returns with prefilled quantities; write-off rows without stock operations.
- UI: Cancel dialog.
- **Done when:** a cancel with partial returns leaves stock equal to the expected numbers (returned quantity back, written-off quantity gone), reservations are zero, a return can never exceed net issued for its batch, completed orders cannot be cancelled.

## Phase 7: Reporting and hardening (M)
- Reports: yield and output variance (F7), material usage variance (F8), at-risk reservations, batch traceability (forward and backward, order level), write-off report.
- Full `production:reconcile`, scheduled daily.
- Performance pass with `EXPLAIN` on the reservation sum, FEFO query, and list pages against realistic data volumes.
- Permission matrix test, UAT script (below), user documentation.
- **Done when:** the UAT scenarios pass, reconcile reports clean on the UAT data, and no page fires N+1 queries under `shouldBeStrict`.

## Every phase's definition of done
Migrations reversible; factories and seeders updated; policy plus permission test; Actions wrap all writes in one transaction; no lazy loads; Inertia pages use Resources; formatter and static analysis clean; docs and glossary updated if a term changed.

## UAT scenarios (the acceptance test for the whole module)
1. **Happy path.** Shampoo 1000 units: release, start, issue every component, complete with three totes, QC passes all three.
2. **Shortage.** Release blocked with a list of short components; receive stock; release succeeds.
3. **Competing orders.** Two orders need the same surfactant; only the first releases when stock covers one.
4. **Override and over-issue.** Pick a non-FEFO batch (note required); issue above requirement (note required); try to take another order's reserved stock (blocked).
5. **Short close.** Produce 950 of 1000; variance note required; yield shows 95%.
6. **Cancel.** Issue 200 kg, return 120 kg, write off 80 kg; stock and reservations are correct.
7. **QC reject.** One output tote fails; the batch is rejected, the order stays completed.
8. **Expiry.** An expired batch and a quarantined batch never appear in availability or FEFO.
9. **Traceability.** From a finished batch, list the input batches; from a raw batch, list the orders that consumed it.

## Risks
| Risk | Why it matters | Mitigation |
|---|---|---|
| Your stock model differs from my assumptions | `StockLevels` and the batch and QC steps depend on it | Phase 0 checklist before any production code |
| Lock discipline is violated in a later change | Silent over-reservation | One `runLocked()` helper, the smoke test in CI, reconcile report |
| QC refactor touches the live receive flow | Regression in a working feature | Expand, migrate, contract; existing QC tests unchanged at each step |
| Operators find explicit issue too slow | They stop recording picks; lineage degrades | FEFO prefill, one-tap confirm, tablet-friendly dialog; test with real operators in Phase 4 |
| Reservations outlive the stock | Batch expires or fails QC after release | At-risk report, issue-time checks, visible warning on the order |
| Lineage is order level, not tote level | A recall may over-include batches | Accepted for v1; document it in the traceability report |

## Out of scope for v1
Costing (the `cost` column stays empty), rework, by-products and waste as real outputs, planning and MRP, scheduling and capacity, automatic multi-level BOM explosion, UoM conversion, batch-level reservation, coded reason lists.
