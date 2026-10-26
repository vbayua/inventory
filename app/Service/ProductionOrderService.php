<?php

namespace App\Service;

use App\Enums\ProductionOrderStatus;
use App\Models\Bom;
use App\Models\BomLine;
use App\Models\Product;
use App\Models\ProductionOrder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductionOrderService
{
    /**
     * Create a draft production order pinned to the product's active BOM.
     *
     * @param  array{bom_id?: int|string|null, target_quantity: float|int|string, notes?: string|null, order_number?: string|null}  $data
     */
    public function createForProduct(Product $product, array $data): ProductionOrder
    {
        return DB::transaction(function () use ($product, $data) {
            $bom = Bom::where('active_product_id', $product->id)->lockForUpdate()->first();

            if (! $bom) {
                throw ValidationException::withMessages([
                    'bom_id' => 'This product has no active BOM.',
                ]);
            }

            if (isset($data['bom_id']) && (int) $data['bom_id'] !== $bom->id) {
                throw ValidationException::withMessages([
                    'bom_id' => 'The selected BOM is not the product\'s active BOM.',
                ]);
            }

            $production = ProductionOrder::create([
                'order_number' => $data['order_number'] ?? Str::uuid()->toString(),
                'product_id' => $product->id,
                'bom_id' => $bom->id,
                'target_quantity' => $data['target_quantity'],
                'status' => ProductionOrderStatus::Draft->value,
                'notes' => $data['notes'] ?? null,
                'user_id' => Auth::id(),
            ]);

            $this->syncMaterialsFromBom($production, $bom);

            return $production;
        });
    }

    /**
     * Replace the order's requirement snapshot with one built from the BOM lines.
     */
    public function syncMaterialsFromBom(ProductionOrder $production, Bom $bom, bool $reserve = false): void
    {
        $production->materials()->delete();
        $production->materials()->createMany($bom->lines()->get()->map(function (BomLine $line) use ($production, $reserve) {
            $quantityRequired = $line->quantity_per_unit * $production->target_quantity * (1 + $line->scrap_percentage / 100);

            return [
                'component_product_id' => $line->component_product_id,
                'location_id' => $production->location_id,
                'unit' => $line->unit,
                'quantity_per_unit' => $line->quantity_per_unit,
                'scrap_percentage' => $line->scrap_percentage,
                'quantity_required' => $quantityRequired,
                'quantity_reserved' => $reserve ? $quantityRequired : 0,
            ];
        })->all());
    }
}
