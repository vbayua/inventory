# Production Context

Glossary for the production module. Terms only; no implementation details.

## Language

**Bill of Materials (BOM)**:
The versioned recipe for one Finished Good: which Components, and how much of each, make one unit. Exactly one version is active per product at a time.
_Avoid_: formula, recipe (in code)

**BOM Line**:
One Component and its per-unit quantity within a BOM.

**Component**:
Any product consumed by a Production Order. May be a raw material, packaging material, or another Finished Good (a Sub-assembly).

**Sub-assembly**:
A Finished Good used as a Component of another product. Treated as ordinary stock: it must already exist, made by its own separate Production Order. Never exploded recursively.

**Production Order**:
The commitment to make N units of a Finished Good under one BOM version. Owns its frozen copy of the requirements and records what actually happened.
_Avoid_: production plan (a plan is a proposal with no stock impact; this system has no planning layer)

**Production Order Lifecycle**:
draft, released, in_progress, completed, cancelled.

**Release**:
The transition that commits a Production Order and creates a Reservation. Blocked if any Component is short. Supervisor-only.

**Reservation**:
A product-level claim on stock held by a released Production Order. It names a quantity, not a batch.

**Scrap Allowance**:
A percentage of extra material added on top of the base requirement to cover expected loss. 5 means 5% extra, so 100 needed becomes 105.

**Available Stock**:
Quantity in batches that are QC-released and not expired, minus quantity reserved by other Production Orders.

**Over-issue**:
Issuing more of a Component than the order requires. Needs a reason note. Capped at Available Stock plus the order's own remaining Reservation, so it never eats another order's Reservation.

**Issue**:
An operator recording that a specific batch quantity of a Component was picked for a Production Order. Each Issue immediately writes a stock operation.

**Return**:
Putting issued material back on a shelf, into the batch it came from, using the existing return-to-stock operation. Allowed during the run and on cancel. Never exceeds what was issued from that batch.

**Write-off**:
Issued material that will not come back (consumed, spilled, contaminated), recorded on a cancelled order with a note. Writes no stock operation, because the Issue already removed it from stock.

**FEFO Suggestion**:
The system's proposed batch for an Issue: first-expiring, first-out.

**Batch Override**:
An operator choosing a different batch than the FEFO Suggestion. A reason note is required.

**Reason Note**:
A required free-text explanation attached to a deviation from the expected (batch override, over-issue, short close). No coded category list in v1; one can be added later if reporting needs it.

**Output**:
One batch of finished product recorded against a Production Order, with its own quantity. An order may have several.

**Output Type**:
primary, byproduct, or waste. Only primary is used in v1.

**Quarantine**:
The status of a newly produced Output batch until QC releases it. Quarantined stock is not available.

**Short Close**:
Completing a Production Order with less produced than the target, with a Variance Reason.

**Variance Reason**:
The reason note explaining why the produced quantity differs from target.

**Rework**:
Reprocessing a batch that failed QC. Out of scope for v1; Outputs may point to the failed Output they reprocess.
