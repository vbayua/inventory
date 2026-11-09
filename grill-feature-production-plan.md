Round 1 — core decisions, all unblocked.

---

❓ **Q1 - Finished Good as Product type or separate entity**: Finished Good Product — is it stored as row in existing `products` table with type = "Finished Good", or separate table? Your description implies reusing products table.

➡️ Same `products` table, new type. Cleanest — reuses batch/stock architecture already built.

---

❓ **Q2 - Bill of Materials (BOM) versioning**: Production plan references BOM (material + qty per FG unit). Can that BOM change after plan is created? If yes, does updating the BOM affect existing plans or only new ones?

➡️ BOM snapshot at plan creation. Existing plans frozen. Simpler, auditable.

---

❓ **Q3 - Stock deduction timing**: When do materials get deducted from stock? On "Ordered", on "Started", or on "Finished"?

➡️ Deduct on "Started" (committed to production). "Ordered" = intention only, no stock move.

---

❓ **Q4 - FG stock creation**: When does finished good stock (batch) get created and added to inventory? On "Finished" only, or can partial quantities be added mid-production?

➡️ On "Finished" only. Keeps it simple.

---

❓ **Q5 - Quantity target on plan**: Production plan — is it "produce N units of this FG"? Or open-ended (produce until stopped)?

➡️ Fixed target quantity. Drives the material requirement calculation.

---

❓ **Q6 - Batch selection for materials**: When producing, which specific batch of a material is consumed? Does user pick batch manually, or system auto-picks (FIFO/FEFO)?

➡️ User picks batch explicitly per material line. Warehouse knows physical location.

---

❓ **Q7 - Multiple production runs per plan**: Can one plan be executed multiple times (partial runs), or is it one plan = one run = one status lifecycle?

➡️ One plan, one run, one lifecycle. Simpler. New plan for new run.

---

❓ **Q8 - Who triggers status changes**: Is "Ordered" set by one role and "Started"/"Finished" by another (e.g., manager orders, warehouse starts)? Or same actor does all?

➡️ Clarify — affects whether you need role-gating on status transitions
