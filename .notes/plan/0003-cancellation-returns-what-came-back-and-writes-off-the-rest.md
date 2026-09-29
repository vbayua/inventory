# 0003. Cancellation returns what came back and records the rest as written off

Status: Accepted

## Context
A Production Order can be cancelled after material has been issued. Every Issue wrote an Out stock operation, so that material has already left stock. Some of it may physically go back to a shelf; some may already be mixed, spilled, or contaminated. Software cannot un-mix a tank.

## Decision
- Cancel is allowed from draft, released, and in_progress. Never from completed.
- For an in_progress order with issued material, the supervisor sees each issued (component, batch) line with the return quantity prefilled to the full net issued quantity, editable down to zero.
- The returned quantity is recorded with the existing return-to-stock operation, into the same batch it was issued from.
- The remainder is recorded as a write-off row on the order, with a required note. A write-off writes no stock operation: the Issue already removed that quantity from stock, and adjusting again would deduct it twice.
- All remaining reservations are released.
- Nothing is returned automatically. The supervisor confirms each line.

## Consequences
- Stock quantities stay truthful whether or not material came back.
- Cancelling an order with no issues is one click.
- Write-off rows are the audit trail for lost material; reports read them, not adjustment operations.
- A return can never exceed net issued for its (component, batch), so returns cannot create stock.
- Rejected: automatic reversal of everything (fiction when material was consumed); blocking cancel once material is issued (traps orders forever); writing off through Adjustment (double deduction).
