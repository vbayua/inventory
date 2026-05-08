<?php

namespace App\Http\Controllers;

use App\DTO\StockData;
use App\Http\Requests\ApproveQcInspectionRequest;
use App\Http\Requests\RejectInspectionRequest;
use App\Http\Requests\SubmitQcInspectionRequest;
use App\Http\Requests\UpdateQcInspectionRequest;
use App\Models\Batch;
use App\Models\QcApproval;
use App\Models\QcChecklist;
use App\Models\QcInspection;
use App\Models\QcInspectionResult;
use App\Models\Stock;
use App\Rules\Permissions\QualityInspectionPermission;
use App\Service\StockOperationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QcInspectionController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(QcInspection::class, 'inspection');
    }

    public function index(QualityInspectionPermission $permissions)
    {
        $inspections = QcInspection::with([
            'receiveOrder:id,receive_number,receive_date',
            'receiveOrderItem.purchaseOrderItem.product:id,name,sku',
            'inspector:id,name',
            'approval:id,status,qc_inspection_id,approved_by,approved_at'
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
            'approver:id,name',
            'approval:id,status,notes,qc_inspection_id,approved_by,approved_at',
            'approval.approver:id,name'
        ];

        $inspection->load($relations);
        $availableChecklists = QcChecklist::where('is_active', true)
            ->get(['id', 'name', 'description']);

        $batches = Batch::select(['id', 'batch_number', 'product_id'])->get();

        return Inertia::render('Qc/Inspections/Show', [
            'inspection'          => $inspection,
            'availableChecklists' => $availableChecklists,
            'batch'               => $batches
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

        return redirect()->back()->with('success', 'Inspection started.');
    }

    /**
     * Submit inspection results.
     * - Non-RM products: quantity_passed + quantity_rejected required.
     * - RM / fallback: overall_result toggle (pass/reject).
     */
    public function submit(SubmitQcInspectionRequest $request, QcInspection $inspection)
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


        if ($isRawMaterial) {
            $request->validate([
                'overall_result' => 'required|in:pass,reject',
            ]);
        } else {
            $request->validate([
                'quantity_passed'   => "required|integer|min:0|max:{$quantityReceived}",
                'quantity_rejected' => "required|integer|min:0|max:{$quantityReceived}",
            ]);
        }

        $data = $request->validated();

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

            $inspection->approval()->create();

        });

        return redirect()->back()->with('success', 'Inspection submitted successfully.');
    }

    public function update(QcInspection $inspection, UpdateQcInspectionRequest $request)
    {
        if (!in_array($inspection->status, ['pass'])) {
            return redirect()->back()->with('error', 'Inspection already validated.');
        }

        // Load what we need to detect product type
        $inspection->load('receiveOrderItem.purchaseOrderItem.product.productType');
        $item             = $inspection->receiveOrderItem;
        $productType      = $item?->purchaseOrderItem?->product?->productType;
        $isRawMaterial    = !$productType || $productType->type_code === 'RMP';
        $quantityReceived = (int) ($item?->quantity_received ?? 0);

        $data = $request->validated();

        if ($isRawMaterial) {
            $request->validate([
                'overall_result' => 'required|in:pass,reject',
            ]);
        } else {
            $request->validate([
                'quantity_passed'   => "required|integer|min:0|max:{$quantityReceived}",
                'quantity_rejected' => "required|integer|min:0|max:{$quantityReceived}",
            ]);
        }


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

        });

        return redirect()->back()->with('success', 'Inspection updated successfully.');

    }

    public function approve(ApproveQcInspectionRequest $request, QcInspection $inspection)
    {
        // dd($request, $inspection);
        if ($inspection->status !== 'pass' && $inspection->status !== 'partial_pass') {
            return redirect()->back()->with('error', 'Inspection must be in "pass" or "partial_pass" status to be approved.');
        }

        if ($inspection->status === 'approved') {
            return redirect()->back()->with('error', 'Inspection already approved.');
        }

        // $approval = QcApproval::where('qc_inspection_id', $inspection->id)->first();

        // if ($approval) {
        //     if (!$inspection->approval_id) {
        //         $inspection->approval_id = $approval->id;
        //         $inspection->save();
        //     }
        //     $inspection->refresh();
        //     // return redirect()->back()->with('success', 'Inspection approved successfully.');
        // }


        $receiveOrderItem = $inspection->receiveOrderItem;
        $product = $receiveOrderItem->purchaseOrderItem->product;
        $unit = $product->unit;
        $locationId = $receiveOrderItem->location_id;
        $batchId = $request->batch_id;
        $supplierId = $receiveOrderItem->purchaseOrderItem->purchaseOrder->supplier_id;
        $quantity = $product->productType->type_code !== 'RMP' ? $inspection->quantity_passed : $receiveOrderItem->quantity_received;

        $stockData = StockData::fromArray([
            'location_id' => $locationId,
            'batch_id' => $batchId,
            'supplier_id' => $supplierId,
            'quantity' => $quantity,
            'quality_status' => 'approved',
            'unit' => $unit,
        ]);

        // dd($quantity, $unit, $locationId, $batchId, $supplierId);

        DB::transaction(function () use ($inspection, $stockData, $product, $request) {

            $stockOperation = app(StockOperationService::class);

            $stock = $stockOperation->createStockOperation(
                'inbound',
                $product,
                $stockData,
                $stockData['quantity'],
                $stockData['unit'],
                'Approved by ' . Auth::user()->name
            );

            $approval = $inspection->approval->updateOrFail([
                'qc_inspection_id' => $inspection->id,
                'status' => 'approved',
                'notes' => $request->approval_notes,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);
        });

        $this->attemptPurchaseOrderCompletion($inspection);
        return redirect()->back()->with('success', 'Inspection approved successfully.');
    }

    public function reject(RejectInspectionRequest $request, QcInspection $inspection)
    {
        QcApproval::updateOrCreate([
            'inspection_id' => $inspection->id,
            'status' => 'rejected',
            'notes' => $request->notes,
            'rejected_by' => Auth::id(),
            'rejected_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Inspection rejected successfully.');
    }


    public function approvals(QcInspection $inspection)
    {
        return $inspection->approval;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

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
        $stockOperationService = app(StockOperationService::class);

        if (!$locationId || !$productId) return;

        if (!$isRawMaterial && $quantityPassed !== null && $quantityRejected !== null) {
            $stock = Stock::where('product_id', $productId)
                ->where('location_id', $locationId)
                ->whereIn('status', ['pending', 'checking'])
                ->first();

            if (!$stock) return;

            switch ($status) {
                case 'pass':
                    $stockOperationService->transitionStockBucket($stock, $quantityPassed, 'quantity_on_hold', 'quantity', 'passed');
                    break;

                case 'reject':
                    $stockOperationService->transitionStockBucket($stock, $quantityRejected, 'quantity_on_hold', 'quantity_rejected', 'rejected');
                    break;

                case 'partial_pass':
                    // Passed units go to usable stock; rejected qty is documented on the inspection.
                    $stockOperationService->transitionStockBucket($stock, $quantityPassed, 'quantity_on_hold', 'quantity', 'passed');
                    $stockOperationService->transitionStockBucket($stock, $quantityRejected, 'quantity_on_hold', 'quantity_rejected', 'rejected');
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
     *   4. Inspection is validated by Admin
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

        // Condition 4: Inspection is validated


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
