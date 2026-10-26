<?php

namespace App\Service;

use App\Enums\ProductionOrderStatus;
use App\Models\Bom;
use App\Models\ProductionOrder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductionOrderStatusService
{
    public function __construct(protected ProductionOrderService $productionOrderService) {}

    /**
     * Move a production order to the given status, enforcing the state machine guards
     * and applying each transition's effects in one transaction.
     */
    public function transition(ProductionOrder $production, ProductionOrderStatus $targetStatus, ?string $cancelNote = null): ProductionOrder
    {
        return DB::transaction(function () use ($production, $targetStatus, $cancelNote) {
            $production = ProductionOrder::whereKey($production->id)->lockForUpdate()->firstOrFail();
            $currentStatus = ProductionOrderStatus::from($production->status);

            if (! $currentStatus->canTransition($targetStatus)) {
                throw ValidationException::withMessages([
                    'status' => "Cannot change status from {$currentStatus->value} to {$targetStatus->value}.",
                ]);
            }

            match ($targetStatus) {
                ProductionOrderStatus::Released => $this->release($production),
                ProductionOrderStatus::InProgress => $this->start($production),
                ProductionOrderStatus::Completed => $this->complete($production),
                ProductionOrderStatus::Cancelled => $this->cancel($production, $cancelNote),
                ProductionOrderStatus::Draft => null,
            };

            return $production;
        }, attempts: 3);
    }

    /**
     * Release only while the pinned BOM is still the product's active BOM, rebuilding
     * and freezing the requirement snapshot from its lines and reserving it in full.
     */
    private function release(ProductionOrder $production): void
    {
        $bom = Bom::whereKey($production->bom_id)->lockForUpdate()->firstOrFail();

        if ((int) $bom->active_product_id !== (int) $production->product_id) {
            throw ValidationException::withMessages([
                'status' => 'The BOM of this order is no longer the product\'s active BOM.',
            ]);
        }

        if (! $bom->lines()->exists()) {
            throw ValidationException::withMessages([
                'status' => 'The BOM has no lines to release.',
            ]);
        }

        $this->productionOrderService->syncMaterialsFromBom($production, $bom, reserve: true);

        $production->update([
            'status' => ProductionOrderStatus::Released->value,
            'released_at' => now(),
            'released_by' => Auth::id(),
        ]);
    }

    private function start(ProductionOrder $production): void
    {
        $production->update([
            'status' => ProductionOrderStatus::InProgress->value,
            'started_at' => now(),
            'started_by' => Auth::id(),
        ]);
    }

    private function complete(ProductionOrder $production): void
    {
        if (! $production->issues()->exists()) {
            throw ValidationException::withMessages([
                'status' => 'Nothing was issued to this production order.',
            ]);
        }

        $production->materials()->update(['quantity_reserved' => 0]);

        $production->update([
            'status' => ProductionOrderStatus::Completed->value,
            'completed_at' => now(),
            'completed_by' => Auth::id(),
        ]);
    }

    private function cancel(ProductionOrder $production, ?string $cancelNote): void
    {
        if (blank($cancelNote)) {
            throw ValidationException::withMessages([
                'cancel_note' => 'A note is required to cancel a production order.',
            ]);
        }

        $production->materials()->update(['quantity_reserved' => 0]);

        $production->update([
            'status' => ProductionOrderStatus::Cancelled->value,
            'cancelled_at' => now(),
            'cancelled_by' => Auth::id(),
            'cancel_note' => $cancelNote,
        ]);
    }
}
