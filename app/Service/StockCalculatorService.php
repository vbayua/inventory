<?php

namespace App\Service;

use App\Models\Unit;
use Illuminate\Support\Facades\Cache;

class StockCalculatorService
{
    /**
     * Resolve a Unit by name using the same cache namespace as Unit model boot hooks.
     */
    private function getUnitByNameCached(string $unitName): Unit
    {
        $normalized = strtolower($unitName);
        $unit = Cache::remember("unit:name:{$normalized}", 3600, function () use ($normalized) {
            return Unit::where('name', $normalized)->first();
        });
        return $unit;
    }
    /**
     * Convert quantity to base unit (ml, g, or item).
     */
    public function toBaseUnit(float $quantity, Unit|string $unit): float
    {
        $unitName = $unit instanceof Unit ? $unit->name : $unit;
        $unitRecord = $this->getUnitByNameCached($unitName);

        return $quantity * $unitRecord->conversion_to_base;
    }

    /**
     * Convert from base unit to target unit.
     */
    public function fromBaseUnit(float $quantity, Unit|string $unit): float
    {
        $unitName = $unit instanceof Unit ? $unit->name : $unit;
        $unitRecord = $this->getUnitByNameCached($unitName);
        return $quantity / $unitRecord->conversion_to_base;
    }

    public function usageExample()
    {
        // Example usage of the conversion methods
        $quantityInMl = $this->toBaseUnit(2, 'liter'); // Convert 2 liters to ml
        $quantityInGrams = $this->fromBaseUnit(1000, 'kg'); // Convert 1000 grams to kg

        return [
            'quantityInMl' => $quantityInMl,
            'quantityInGrams' => $quantityInGrams,
        ];
    }

    /**
     * Calculate remaining stock, handling continuous and discrete units.
     */
    // TODO: Implement stock calculation logic
}
