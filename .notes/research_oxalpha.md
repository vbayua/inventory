--previously on production plan grilling questions

Solid grilling answers. Q8 is the only open one — I'll design assuming role-gating is optional (flag-based), since it's easy to add later if you make transitions permission-checked.

Here's the full design:

---

## 1. Schema

### `bill_of_materials` (header, for versioning)
```sql
id, product_id (finished good), version (int), is_active (bool),
status: draft | active | retired,
notes, created_by, created_at
```
Only one `active` version per product at a time. New version = copy rows from previous, retire old one when activated.

### `bom_lines`
```sql
id, bom_id, component_product_id, quantity_per_unit (decimal),
uom, scrap_percentage (default 0), notes
```
Constraint: `component_product_id` must be Raw Material or Packaging Material type. (If you ever want FG-within-FG sub-assemblies, relax this — see §6.)

### `production_plans`
```sql
id, plan_number, product_id (FG), target_quantity,
bom_id (FK — the snapshot reference),
status: ordered | started | finished | cancelled,
planned_start_date, planned_end_date,
created_by, ordered_by, ordered_at, started_at, finished_at,
output_batch_id (nullable, set on finish)
```

### `production_plan_materials` (BOM snapshot, frozen at plan creation)
```sql
id, plan_id, component_product_id,
quantity_required (total, pre-calculated),
quantity_consumed (actual, filled during run),
scrap_percentage (copied from BOM line),
lines_json / separate batch allocation table (see §4)
```
This is the snapshot — copying BOM lines here at plan creation. Even if you later version the BOM, plans never change

Q:Explain the schema to me in first principles. Specifically I don't understand why there is bom_lines schema

Let me rebuild this from the ground up so each table's existence is obviously necessary.

## The core fact chain

```
1 unit of Product X   requires   Y units of Component Z
```

That's it. Everything in the schema is just this fact, stored at different points in time for different purposes.

**The problem:** this fact *changes over time* (recipes change — supplier issues, formula reformulation, cost optimization), but it must also be *remembered exactly as it was* when a production run happened (for auditing, costing, traceability).

So we need the fact stored in **two places**:

1. **The current truth** — "what does it take to make this product *today*?"
2. **A historical copy** — "what did it take to make this product *on that date*, in that plan?"

One table can't serve both, because updating a row for purpose #1 destroys purpose #2. That single tension is why the schema looks the way it does.

---

## Table 1 & 2: `bill_of_materials` + `bom_lines` — the *current truth*

This pair answers: "How do we make Product X, as of now?"

### Why two tables instead of one?

A BOM isn't one fact — it's a **set** of facts:

- 1 unit of Shampoo requires 500ml of Surfactant
- 1 unit of Shampoo requires 1 of Bottle 250ml
- 1 unit of Shampoo requires 1 of Cap, 1 of Label, 1 of Carton

These facts only make sense **together**. If Bottle changes but Cap doesn't, you need to update one line without touching the others. So each line is a row in `bom_lines`.

But then: what groups the rows together? You need a parent row that says "these four lines all belong to *Shampoo, version 3*". That's `bill_of_materials` — it's the **envelope**, and `bom_lines` are the **contents**.

Without the header, you'd have to answer "which lines belong to Shampoo v3?" with something like `WHERE product_id = X AND version = 3` scattered across rows — fragile, and there's nowhere to store BOM-level info (status, approval, notes, who created it).

### Why a header *and* version, not just `product_id` on lines?

Because "current truth" still changes. When the recipe changes, you don't edit lines in place — you create `bill_of_materials` v2, copy the lines, edit the copies, activate v2, retire v1.

Why not just edit in place? Because somewhere in your system there's always a straggler: a plan created yesterday under v1 that gets finished tomorrow. If you edited in place, that plan's materials quietly changed underneath it. The version row gives every consumer a stable thing to point at.

### The "one active version" rule

Since this table represents *current* truth, ambiguity is fatal. If two versions of Shampoo's BOM are both `active`, the system can't answer "what do I need to make Shampoo today?" — the exact question this table exists to answer. Hence: exactly one `active` per product.

---

## Table 3: `production_plans` — the *event*

A plan is a decision: "we will make **N units of X**." Its job is to record the decision, not the recipe.

So the plan stores:

- **What** (`product_id`) and **how much** (`target_quantity`)
- **Which recipe it used** (`bom_id`) — a *pointer*, not a copy
- **Where it is in its lifecycle** (`status`) and when/who for each transition

### Why does the plan store `bom_id` if the recipe is snapshotted into the materials table?

Traceability and cheap reads. `bom_id` says "this plan was executed under recipe v3" in one column — you can answer "which plans ran under the old formula?" with a single query. The snapshot (below) holds the *numbers*; the FK holds the *identity* of the version. Both point at history, but they answer different questions.

---

## Table 4: `production_plan_materials` — the *snapshot*

This is the copy of the BOM **taken at plan creation, then frozen**.

### Why copy at all? Can't the plan just read through `bom_id` to `bom_lines`?

Technically yes — that's the "no snapshot" design. It fails for two reasons:

1. **You decided plans are frozen (Q2).** If BOM v3 gets retired and its lines deleted/edited, a plan pointing at it has lost its data. The snapshot makes each plan *self-contained* — it survives any future change to the BOM tables.

2. **The snapshot is the plan's *working document*, not a reference.** During the run, this is where actuals get written: `quantity_required` (planned, calculated from the BOM at creation) vs `quantity_consumed` (what was actually used). BOM lines are *definitions* — you don't write run-data onto them, because multiple plans share the same BOM. Where would plan #12's actual consumption go? Each plan needs its own rows to write into.

### Why is `quantity_required` stored as a *total*?

The BOM stores `quantity_per_unit` — a **rate**. The plan stores `target_quantity`. The snapshot multiplies them once at creation:

```
quantity_required = per_unit × target × (1 + scrap%)
```

You *could* compute this on the fly every time. But then a BOM edit would silently change a frozen plan's requirements, and every read pays a calculation cost. Store the answer; it's immutable anyway.

---

## The shape, summarized

Each layer answers one question at one point in time:

| Table | Question | Point in time |
|---|---|---|
| `bill_of_materials` + `bom_lines` | *How* is this product made? | **Now** (mutable, versioned) |
| `production_plans` | *Will* we make N units, and under which recipe version? | At planning |
| `production_plan_materials` | *What exactly* did this run require / consume? | **Frozen** at plan creation, updated during run |

The data flows one direction: **BOM → snapshot → actuals**. Definitions never get edited by execution; execution never changes definitions. That one-way flow is the whole point of the structure.

---

### One caveat worth flagging

I originally said `bom_lines.component_product_id` must be Raw or Packaging material. But you told me "a product can be assembled into another product." If a Finished Good can be a *component* of another Finished Good (sub-assembly — e.g., an ink concentrate that's itself produced, then used in the final ink), then relax that constraint to "any product type." The schema doesn't change — only the validation rule does. Worth deciding now, since it affects whether producing a plan should recursively check *nested* BOMs for material availability.

Q: so a bom and bom_lines is a blueprint for production plan and production_plan and production_plan_material is the record for Production Orders?. If so then should production activities be logged / recorded as a snapshot for auditting/traceability?.

Don't rebuild, answer only the questions
**First question — yes, with one nuance.**

The metaphor holds:

- `bill_of_materials` + `bom_lines` = **blueprint** (how to make it, versioned)
- `production_plans` = **the order** (the decision to run the blueprint N times)
- `production_plan_materials` = the plan's **own frozen copy of the blueprint plus its worksheet**

The nuance: `production_plan_materials` is doing double duty. It's the snapshot (required = what the blueprint said at creation time) *and* the working record (consumed = what actually happened). The blueprint is read-only; the order's copy is written to. That's why it's a copy and not just a FK back to `bom_lines`.

**Second question — yes, but be precise about what's already covered and what isn't.**

You already have two audit layers:

1. **The snapshot** (`production_plan_materials` frozen at creation) — covers "what was the plan *supposed* to consume?" ✓
2. **Status transition columns** on `production_plans` (`ordered_by/at`, `started_by/at`, etc.) — covers "who moved the lifecycle and when?" ✓

What's **not** covered: material consumption *events*. `quantity_consumed` is a single mutable number — when it goes from 50 to 100, the fact "50 was consumed on Tuesday by batch B-104" is destroyed. If traceability matters in chemical manufacturing (it does — recall investigations need batch-level lineage), you need an event log for consumption: which batch, how much, when, by whom.

Two rules for building it:

- **Don't re-record what your existing `stock_operations` already logs.** Material consumption *is* a stock operation. The production activity log should **reference** the stock operation ID, not duplicate its data. One event, two views.
- **Log events, don't log state.** Rows are append-only ("batch B-104, 25 units, consumed at 14:32 by user X"), never updated. `quantity_consumed` then becomes a *derived* rollup of those events, not the source of truth.

So: the snapshot and status columns you already have; add a consumption-event log that ties batch picks to your existing stock operations, and your traceability chain is complete: **plan → frozen requirements → actual batch-level consumption → existing stock movement records.**
