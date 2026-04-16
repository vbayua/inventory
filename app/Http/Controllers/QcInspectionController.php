<?php

namespace App\Http\Controllers;


use App\Models\QcChecklist;
use App\Models\QcInspection;
use App\Models\QcInspectionResult;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QcInspectionController extends Controller
{
    public function index()
    {
        $inspections = QcInspection::with([
            'receiveOrder:id,receive_number,receive_date',
            'receiveOrderItem.purchaseOrderItem.product:id,name',
            'inspector:id,name',
        ])->latest()->get();

        return Inertia::render('Qc/Inspections/Index', [
            'inspections' => $inspections,
        ]);
    }

    public function show(QcInspection $inspection)
    {
        $relations = [
            'receiveOrder:id,receive_number,receive_date,purchase_order_id',
            'receiveOrderItem',
            'receiveOrderItem.purchaseOrderItem.product:id,name,sku,unit,product_type_id',
            'receiveOrderItem.purchaseOrderItem.product.productType:id,name,type_code',
            'receiveOrderItem.location:id,name',
            'checklist.items',
            'results.checklistItem',
            'inspector:id,name',
        ];

        $inspection->load($relations);

        $availableChecklists = QcChecklist::where('is_active', true)
            ->get(['id', 'name', 'description']);

        return Inertia::render('Qc/Inspections/Show', [
            'inspection'          => $inspection,
            'availableChecklists' => $availableChecklists,
        ]);
    }

    /**
     * Start an inspection: pending → checking
     */
    public function start(Request $request, QcInspection $inspection)
    {
        if ($inspection->status !== 'pending') {
            return redirect()->back()->with('error', 'Inspection already started or completed.');
        }

        $data = $request->validate([
            'qc_checklist_id' => 'nullable|exists:qc_checklists,id',
            'notes'           => 'nullable|string',
        ]);

        $inspection->update([
            'status'            => 'checking',
            'inspector_user_id' => Auth::id(),
            'qc_checklist_id'   => $data['qc_checklist_id'] ?? null,
            'inspection_date'   => now(),
            'notes'             => $data['notes'] ?? $inspection->notes,
        ]);

        // Update linked stock to 'checking'
        $this->bulkUpdateLinkedStockStatus($inspection, 'checking');

        return redirect()->back()->with('success', 'Inspection started.');
    }

    /**
     * Submit inspection results.
     * - Non-RM products: quantity_passed + quantity_rejected required.
     * - RM / fallback: overall_result toggle (pass/reject).
     */
    public function submit(Request $request, QcInspection $inspection)
    {
        if (!in_array($inspection->status, ['checking', 'pending'])) {
            return redirect()->back()->with('error', 'Inspection already completed.');
        }

        // Load what we need to detect product type
        $inspection->load('receiveOrderItem.purchaseOrderItem.product.productType');
        $item             = $inspection->receiveOrderItem;
        $productType      = $item?->purchaseOrderItem?->product?->productType;
        $isRawMaterial    = !$productType || $productType->type_code === 'RMP';
        $quantityReceived = (int) ($item?->quantity_received ?? 0);

        // Common result rules
        $baseRules = [
            'notes'                          => 'nullable|string',
            'rejection_reason'               => 'nullable|string',
            'results'                        => 'nullable|array',
            'results.*.qc_checklist_item_id' => 'nullable|exists:qc_checklist_items,id',
            'results.*.item_name'            => 'required|string|max:255',
            'results.*.result'               => 'required|in:pass,fail,na',
            'results.*.notes'                => 'nullable|string',
        ];

        if ($isRawMaterial) {
            $rules = array_merge($baseRules, [
                'overall_result' => 'required|in:pass,reject',
            ]);
        } else {
            $rules = array_merge($baseRules, [
                'quantity_passed'   => "required|integer|min:0|max:{$quantityReceived}",
                'quantity_rejected' => "required|integer|min:0|max:{$quantityReceived}",
            ]);
        }

        $data = $request->validate($rules);

        // Resolve status and quantities
        if ($isRawMaterial) {
            $newStatus        = $data['overall_result'];
            $quantityPassed   = null;
            $quantityRejected = null;
        } else {
            $quantityPassed   = (int) $data['quantity_passed'];
            $quantityRejected = (int) $data['quantity_rejected'];

            if ($quantityPassed + $quantityRejected === 0) {
                return back()->withErrors(['quantity_passed' => 'At least one quantity must be greater than zero.']);
            }

            if ($quantityPassed + $quantityRejected > $quantityReceived) {
                return back()->withErrors([
                    'quantity_passed' => "Total ({$quantityPassed} + {$quantityRejected}) exceeds received quantity ({$quantityReceived}).",
                ]);
            }

            if ($quantityRejected > 0 && empty(trim($data['rejection_reason'] ?? ''))) {
                return back()->withErrors(['rejection_reason' => 'Rejection reason is required when items are rejected.']);
            }

            if ($quantityPassed > 0 && $quantityRejected > 0) {
                $newStatus = 'partial_pass';
            } elseif ($quantityRejected > 0) {
                $newStatus = 'reject';
            } else {
                $newStatus = 'pass';
            }
        }

        DB::transaction(function () use ($inspection, $data, $newStatus, $quantityPassed, $quantityRejected, $isRawMaterial, $item) {
            // Delete previous results if re-submitting
            $inspection->results()->delete();

            if (!empty($data['results'])) {
                foreach ($data['results'] as $result) {
                    QcInspectionResult::create([
                        'qc_inspection_id'     => $inspection->id,
                        'qc_checklist_item_id' => $result['qc_checklist_item_id'] ?? null,
                        'item_name'            => $result['item_name'],
                        'result'               => $result['result'],
                        'notes'                => $result['notes'] ?? null,
                    ]);
                }
            }

            $inspection->update([
                'status'            => $newStatus,
                'inspector_user_id' => Auth::id(),
                'inspection_date'   => now(),
                'notes'             => $data['notes'] ?? $inspection->notes,
                'rejection_reason'  => $data['rejection_reason'] ?? null,
                'quantity_passed'   => $quantityPassed,
                'quantity_rejected' => $quantityRejected,
            ]);

            $this->updateLinkedStockWithQuantity(
                $inspection, $newStatus, $quantityPassed, $quantityRejected, $isRawMaterial, $item
            );
        });

        // Outside transaction: try to complete the PO
        $this->attemptPurchaseOrderCompletion($inspection);

        return redirect()->back()->with('success', 'Inspection submitted successfully.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Bulk-update stock status for a given inspection's product + location.
     * Used for the pending → checking transition (start).
     */
    private function bulkUpdateLinkedStockStatus(QcInspection $inspection, string $status): void
    {
        [$productId, $locationId] = $this->resolveProductAndLocation($inspection);
        if (!$productId || !$locationId) return;

        Stock::where('product_id', $productId)
            ->where('location_id', $locationId)
            ->whereIn('status', ['pending', 'checking'])
            ->update(['status' => $status]);
    }

    /**
     * Update stock after QC submission.
     * - Non-RM: use precise quantities.
     * - RM / legacy: bulk status update.
     */
    private function updateLinkedStockWithQuantity(
        QcInspection $inspection,
        string $status,
        ?int $quantityPassed,
        ?int $quantityRejected,
        bool $isRawMaterial,
        $item = null
    ): void {
        $item       = $item ?? $inspection->receiveOrderItem;
        $locationId = $item?->location_id;
        $productId  = $item?->purchaseOrderItem?->product_id;

        if (!$locationId || !$productId) return;

        if (!$isRawMaterial && $quantityPassed !== null && $quantityRejected !== null) {
            $stock = Stock::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->whereIn('status', ['pending', 'checking'])
                ->first();

            if (!$stock) return;

            switch ($status) {
                case 'pass':
                    $stock->update([
                        'quantity' => $quantityPassed,
                        'status'   => 'pass',
                    ]);
                    break;

                case 'reject':
                    $stock->update([
                        'quantity' => $quantityRejected,
                        'status'   => 'reject',
                        'remarks'  => 'QC Rejected — Inspection #' . $inspection->id
                            . ': ' . ($inspection->rejection_reason ?? 'No reason given'),
                    ]);
                    break;

                case 'partial_pass':
                    // Passed units go to usable stock; rejected qty is documented on the inspection.
                    $stock->update([
                        'quantity' => $quantityPassed,
                        'status'   => 'pass',
                        'remarks'  => 'QC Partial Pass — Inspection #' . $inspection->id
                            . ': ' . $quantityRejected . ' unit(s) rejected.',
                    ]);
                    break;
            }
        } else {
            // RM / legacy: bulk status update
            Stock::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->whereIn('status', ['pending', 'checking'])
                ->update(['status' => $status]);

            if ($status === 'reject') {
                Stock::where('product_id', $productId)
                    ->where('location_id', $locationId)
                    ->where('status', 'reject')
                    ->update([
                        'remarks' => 'QC Rejected — Inspection #' . $inspection->id
                            . ': ' . ($inspection->rejection_reason ?? 'No reason given'),
                    ]);
            }
        }
    }

    /**
     * After QC submission, try to mark the PO as 'completed'.
     * Conditions:
     *   1. All PO items are 'received' (quantity-wise fully delivered).
     *   2. No QC inspections in pending/checking state.
     *   3. No inspections with rejected quantities (status reject or partial_pass).
     */
    private function attemptPurchaseOrderCompletion(QcInspection $inspection): void
    {
        $inspection->loadMissing('receiveOrder.purchaseOrder.items');
        $purchaseOrder = $inspection->receiveOrder?->purchaseOrder;

        if (!$purchaseOrder) return;

        // Condition 1: all PO items quantity-received
        $allItemsReceived = $purchaseOrder->items->every(
            fn($i) => $i->status === 'received'
        );
        if (!$allItemsReceived) return;

        // Condition 2: no pending / checking inspections for this PO
        $hasUnresolved = QcInspection::whereHas('receiveOrder', function ($q) use ($purchaseOrder) {
            $q->where('purchase_order_id', $purchaseOrder->id);
        })->whereIn('status', ['pending', 'checking'])->exists();

        if ($hasUnresolved) return;

        // Condition 3: no rejected inspections
        $hasRejections = QcInspection::whereHas('receiveOrder', function ($q) use ($purchaseOrder) {
            $q->where('purchase_order_id', $purchaseOrder->id);
        })->whereIn('status', ['reject', 'partial_pass'])->exists();

        if ($hasRejections) return;

        $purchaseOrder->update(['status' => 'completed']);
    }

    /**
     * Resolve product_id and location_id from an inspection.
     */
    private function resolveProductAndLocation(QcInspection $inspection): array
    {
        $inspection->loadMissing('receiveOrderItem.purchaseOrderItem');
        $item       = $inspection->receiveOrderItem;
        $locationId = $item?->location_id;
        $productId  = $item?->purchaseOrderItem?->product_id;
        return [$productId, $locationId];
    }
}
