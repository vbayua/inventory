<?php

namespace App\Service;

use App\Models\Unit;
use Illuminate\Support\Facades\Cache;

class StockCalculatorService
{

    /** @var array<string,unit> */
    private array $memo = [];
    /**
     * Convert quantity to base unit (ml, g, or item).
     */
    public function toBaseUnit(float $quantity, string $unitName): float
    {
        $unit = $this->getUnitByName($unitName);

        if ($unit->conversion_to_base <= 0) {
            throw new \Exception("Invalid conversion_to_base for unit '{$unit->name}'.");
        }

        return $quantity * $unit->conversion_to_base;
    }

    /**
     * Convert from base unit to target unit.
     */
    public function fromBaseUnit(float $quantity, string $unitName): float
    {
        $unit = $this->getUnitByName($unitName);

        if ($unit->conversion_to_base <= 0) {
            throw new \Exception("Invalid conversion_to_base for unit '{$unit->name}'.");
        }

        return $quantity / $unit->conversion_to_base;
    }

    /**
     * Get unit by its name
     *
     */
    private function getUnitByName(string $unitName): Unit
    {
        $key = $this->normalizeKey($unitName);

        // Per-request memoization first(fast path)
        if (isset($this->memo[$key])) {
            return $this->memo[$key];
        }

        // Cache (cross-request)
        $unit = Cache::tags(['units'])->remember(
            "unit:name:{$key}",
            config('cache.ttl.units', 3600),
            fn() => Unit::where('name', $key)->firstOrFail()
        );

        return $this->memo[$key] = $unit;
    }

    private function normalizeKey(string $name): string
    {
        return strtolower(trim($name));
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
