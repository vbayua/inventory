<?php

namespace App\Service;

use App\Models\Stock;
use App\Models\Unit;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;

class StockCalculatorService
{
    /**
     * Retrieves a Unit model instance by its name, using cache for performance.
     *
     * @param  string  $unitName  The name of the unit to retrieve.
     * @return Unit The Unit model instance corresponding to the given name.
     */
    private function getUnitByNameCached(string $unitName): Unit
    {
        $normalized = strtolower($unitName);
        try {
                $query = Unit::where('name', $normalized)->firstOrFail();
        }
        catch (ModelNotFoundException $e)        {
            throw new ModelNotFoundException("Unit not found: {$unitName}");
        }
        $unit = Cache::remember("unit:name:{$normalized}", 3600, fn () => $query);

        return $unit;
    }

    /**
     * Retrieves a Stock model instance by its ID, using cache for performance.
     *
     * @param  int  $stockId  The ID of the stock to retrieve.
     * @return Stock The Stock model instance corresponding to the given ID.
     */
    public function getStockRecordByIdCached(int $stockId): Stock
    {
        return Cache::remember("stock:id:{$stockId}", 3600, fn () => Stock::findOrFail($stockId));
    }

    /**
     * get baseunit from specified unit
     *
     * @param  Unit|string  $unit  The unit or unit name to get the base unit for.
     * @return string The base unit corresponding to the specified unit.
     */
    public function getBaseUnit(Unit|string $unit): string
    {
        $unitName = $unit instanceof Unit ? $unit->name : $unit;
        $unit = $this->getUnitByNameCached($unitName);
        $baseUnit = (string) $unit->base_unit;
        return $baseUnit;
    }

    /**
     * Converts a quantity from the specified unit to its base unit (e.g., ml, g, item).
     *
     * @param  float  $quantity  The quantity to convert.
     * @param  Unit|string  $unit  The unit or unit name of the quantity.
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
     * @param  float  $quantity  The quantity in base unit to convert.
     * @param  Unit|string  $unit  The target unit or unit name.
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
     * @param  float  $containerQuantity  The number of containers.
     * @param  Stock|int  $stock  The stock model or stock id representing the container.
     * @return float The converted quantity in base units.
     *
     * @throws \InvalidArgumentException If the stock lacks container settings.
     */
    public function containerToBaseUnit(float $containerQuantity, Stock|int $stock): float
    {
        $stockRecord = $stock instanceof Stock ? $stock : Stock::findOrFail($stock);

        if (! $stockRecord->container_capacity || !$stockRecord->container_unit) {
            throw new \InvalidArgumentException('Stock lacks container settings');
        }

        return $this->toBaseUnit($containerQuantity * $stockRecord->container_capacity, $stockRecord->container_unit);
    }

    /**
     * Converts a quantity in base units to its equivalent in container units.
     *
     * @param  float  $baseQuantity  The quantity in base units to convert.
     * @param  Stock|int  $stock  The stock model or stock id representing the container.
     * @return float The converted quantity in container units.
     */
    public function baseUnitToContainer(float $baseQuantity, Stock|int $stock): float
    {
        $stockRecord = $stock instanceof Stock ? $stock : Stock::findOrFail($stock);

        if (!$stockRecord->container_capacity ||!$stockRecord->container_unit) {
            throw new \InvalidArgumentException('Stock lacks container settings');
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
