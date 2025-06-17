<?php

namespace App\Service;

use App\Models\Unit;
use Illuminate\Support\Facades\Cache;

class StockCalculatorService
{
    /**
     * Convert quantity to base unit (ml, g, or item).
     */
    public function toBaseUnit(float $quantity, string $unitName): float
    {
        $unitRecord = Cache::remember("unit:{$unitName}", 3600, function () use ($unitName) {
            return Unit::where('name', $unitName)->firstOrFail();
        });

        return $quantity * $unitRecord->conversion_to_base;
    }

    /**
     * Convert from base unit to target unit.
     */
    public function fromBaseUnit(float $quantity, string $unitName): float
    {
        $unitRecord = Cache::remember("unit:{$unitName}", 3600, function () use ($unitName) {
            return Unit::where('name', $unitName)->firstOrFail();
        });

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
