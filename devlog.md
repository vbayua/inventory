# Log - 2026/04/01

## TODO 
[done] ~~1. Add receive_order_item Details Page~~
[done] ~~2. Add basic details of receive_order Page~~
[done] ~~3. Add User columns to all Orders for Audit log data~~
[] 4. 

# Log - 2025/04/07

Features that should exist
1. Quality Checklists and Validation in Orders process
    - Example: When creating a receive order, it should go through a validation process by a QC/QA User by a form and a checklist before the stock data is updated.
    - A Quality check document and information proof.

If a QC process are to be included in the chain of operations then I should update the Stock Data to have a status, those status would be [Lulus/Pass, Rijek/Reject, Pending, Checking, Reserved]

    Stock Status
        1. Lulus / Pass : Have gone through QC and passed and therefore can be used for operations or set as reserved.
        2. Rijek / Reject : Have gone through QC and failed cannot be used for operations Or returned materials that are broken or loss during Production. (Should add a rejected batch).
        3. Pending / Checking : Items/Products/Materials are received from an order but haven't yet been checked. 
        4. Checking : in process of checking (QC).
        5. Reserved : In hand or In store Items/Products/Materials that are locked for certain purposes.
