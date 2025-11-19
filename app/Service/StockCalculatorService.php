<?php

namespace App\Service;

use App\Models\Stock;
use App\Models\Unit;
use Illuminate\Support\Facades\Cache;

class StockCalculatorService
{
    /**
     * Retrieves a Unit model instance by its name, using cache for performance.
     *
     * @param string $unitName The name of the unit to retrieve.
     * @return Unit The Unit model instance corresponding to the given name.
     */
    private function getUnitByNameCached(string $unitName): Unit
    {
        $normalized = strtolower($unitName);
        $unit = Cache::remember("unit:name:{$normalized}", 3600, function () use ($normalized) {
            return Unit::where('name', $normalized)->firstOrFail();
        });
        return $unit;
    }

    public function getStockRecordByIdCached(int $stockId): Stock
    {
        return Cache::remember("stock:id:{$stockId}", 3600, function () use ($stockId) {
            return Stock::findOrFail($stockId);
        });
    }

    /**
     * Converts a quantity from the specified unit to its base unit (e.g., ml, g, item).
     *
     * @param float $quantity The quantity to convert.
     * @param Unit|string $unit The unit or unit name of the quantity.
     * @return float The converted quantity in the base unit.
     */
    public function toBaseUnit(float $quantity, Unit|string $unit): float
    {
        $unitName = $unit instanceof Unit ? $unit->name : $unit;
        $unitRecord = $this->getUnitByNameCached($unitName);

        return $quantity * $unitRecord->conversion_to_base;
    }

    /**
     * Converts a quantity from the base unit to the specified target unit.
     *
     * @param float $quantity The quantity in base unit to convert.
     * @param Unit|string $unit The target unit or unit name.
     * @return float The converted quantity in the target unit.
     */
    public function fromBaseUnit(float $quantity, Unit|string $unit): float
    {
        $unitName = $unit instanceof Unit ? $unit->name : $unit;
        $unitRecord = $this->getUnitByNameCached($unitName);
        return $quantity / $unitRecord->conversion_to_base;
    }

    /**
     * Converts a container quantity to its equivalent in base units.
     *
     * @param float $containerQuantity The number of containers.
     * @param Stock|int $stock The stock model or stock id representing the container.
     * @throws \InvalidArgumentException If the stock lacks container settings.
     * @return float The converted quantity in base units.
     */
    public function containerToBaseUnit(float $containerQuantity, Stock|int $stock): float
    {
        $stockId = $stock instanceof Stock ? $stock->id : $stock;
        $stockRecord = $this->getStockRecordByIdCached($stockId);

        if (!$stockRecord->container_capacity || $stockRecord->container_unit) {
            throw new \InvalidArgumentException("Stock lacks container settings");
        }

        return $this->toBaseUnit($containerQuantity * $stockRecord->container_capacity, $stockRecord->container_unit);
    }

    public function baseUnitToContainer(float $baseQuantity, Stock|int $stock): float
    {
        $stockId = $stock instanceof Stock ? $stock->id : $stock;
        $stockRecord = $this->getStockRecordByIdCached($stockId);

        if (!$stockRecord->container_capacity || $stockRecord->container_unit) {
            throw new \InvalidArgumentException("Stock lacks container settings");
        }

        $quantityInContainerUnit = $this->fromBaseUnit($baseQuantity, $stockRecord->container_unit);
        return $quantityInContainerUnit / $stockRecord->container_capacity;
    }

    /**
     * Demonstrates example usage of the conversion methods.
     *
     * @return array Example conversion results including quantity in ml and grams.
     */
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
}
