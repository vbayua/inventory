<?php

namespace App\Service;

use App\Enums\ProductionOrderIssueType;
use App\Enums\ProductionOrderStatus;
use App\Models\ProductionOrder;
use App\Models\ProductionOrderIssue;
use App\Models\ProductionOrderMaterial;
use App\Models\Stock;
use App\Service\StockCalculatorService as UnitConverter;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductionIssueService
{
    public function __construct(
        protected StockOperationService $stockOperationService,
        protected UnitConverter $unitConverter,
    ) {}

    public function canIssue(ProductionOrder $production): bool
    {
        return in_array($production->status, [
            ProductionOrderStatus::Released->value,
            ProductionOrderStatus::InProgress->value,
        ], true);
    }

    /**
     * Issue stock picks to a production order material. Each pick deducts stock through an
     * outbound operation and appends one row to the issue log. Replaying the same request
     * UUID is a no-op, so a double submit never issues twice.
     *
     * @param  array<int, array{stock_id: int, quantity: float|int|string}>  $picks
     * @return bool False when the request UUID was already processed.
     */
    public function issue(ProductionOrder $production, ProductionOrderMaterial $material, string $requestUuid, array $picks, ?string $note = null): bool
    {
        if (! $this->canIssue($production)) {
            throw ValidationException::withMessages([
                'status' => 'Stock can only be issued to a released or in-progress production order.',
            ]);
        }

        try {
            return DB::transaction(function () use ($production, $material, $requestUuid, $picks, $note) {
                if (ProductionOrderIssue::where('request_uuid', $requestUuid)->exists()) {
                    return false;
                }

                $material = ProductionOrderMaterial::whereKey($material->id)->lockForUpdate()->firstOrFail();

                foreach ($picks as $index => $pick) {
                    $stock = Stock::whereKey($pick['stock_id'])->lockForUpdate()->firstOrFail();
                    $quantity = (float) $pick['quantity'];

                    if ((int) $stock->product_id !== (int) $material->component_product_id) {
                        throw ValidationException::withMessages([
                            "picks.{$index}.stock_id" => 'The selected stock does not match the material.',
                        ]);
                    }

                    if ($quantity > (float) $stock->quantity) {
                        throw ValidationException::withMessages([
                            "picks.{$index}.quantity" => 'The issued quantity exceeds the available stock.',
                        ]);
                    }

                    $operation = $this->stockOperationService->createOutboundOperation(
                        $stock->product_id,
                        $stock,
                        $quantity,
                        $stock->unit,
                        "Issued to production order {$production->order_number}",
                    );

                    $productionOrderIssue = ProductionOrderIssue::create([
                        'request_uuid' => $requestUuid,
                        'production_order_id' => $production->id,
                        'production_order_material_id' => $material->id,
                        'batch_id' => $stock->batch_id,
                        'type' => ProductionOrderIssueType::Issue,
                        'quantity' => $quantity,
                        'operation_id' => $operation->id,
                        'note' => $note,
                        'user_id' => Auth::id(),
                    ]);

                    $productionOrderIssue->operationContext()->create([
                        'operation_id' => $operation->id,
                        'notes' => "Production Order Issue #{$productionOrderIssue->id}",
                    ]);

                    $material->increment('quantity_issued', $this->toMaterialUnit($quantity, $stock->unit, $material->unit));
                }

                return true;
            });
        } catch (UniqueConstraintViolationException) {
            return false;
        }
    }

    private function toMaterialUnit(float $quantity, string $stockUnit, string $materialUnit): float
    {
        if ($stockUnit === $materialUnit) {
            return $quantity;
        }

        return $this->unitConverter->fromBaseUnit(
            $this->unitConverter->toBaseUnit($quantity, $stockUnit),
            $materialUnit,
        );
    }
}
