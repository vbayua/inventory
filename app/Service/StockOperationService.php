<?php

namespace App\Service;

use App\Models\Operation;
use App\Models\Stock;
use App\Models\Unit;
use App\Service\StockCalculatorService as UnitConverter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StockOperationService
{
    protected $unitConverter;
    public function __construct(UnitConverter $unitConverter)
    {
        $this->unitConverter = $unitConverter;
    }

    public function createInitialStock($product, $stockData)
    {
        return DB::transaction(function () use ($product, $stockData) {
            $operation = $this->createOperation(
                'initial',
                $product,
                $stockData,
                $stockData['quantity'],
                $stockData['unit'] ?? $product->unit,
                $stockData['remarks'] ?? 'Initial stock',
                $stockData['date'] ?? now()
            );
            $this->setStock(
                $product,
                $stockData,
                $stockData['quantity'],
                $stockData['minimum_quantity'] ?? 0,
                $stockData['remarks'] ?? 'Initial stock',
                'available'
            );
            return $operation;
        });
    }

    public function createInboundOperation($product, $stockData, $receiveQuantity, $unit = null, $remarks = "Inbound Operation", $operationDate = null)
    {
        return DB::transaction(function () use ($product, $stockData, $receiveQuantity, $unit, $remarks, $operationDate) {
            $operation = $this->createOperation(
                'inbound',
                $product,
                $stockData,
                $receiveQuantity,
                $unit,
                $remarks,
                $operationDate
            );
            $this->incrementStock(
                $product,
                $stockData,
                $receiveQuantity,
                $unit
            );
            return $operation;
        });
    }
    public function createOutboundOperation($product, $stockData, $usageQuantity, $unit = null, $remarks = "Outbound Operation", $operationDate = null)
    {
        return DB::transaction(function () use ($product, $stockData, $usageQuantity, $unit, $remarks, $operationDate) {
            $operation = $this->createOperation(
                'outbound',
                $product,
                $stockData,
                $usageQuantity,
                $unit,
                $remarks,
                $operationDate
            );
            if (isset($unit)) {
                $this->decrementStock(
                    $product,
                    $stockData,
                    $usageQuantity,
                    $unit
                );
            } else {
                $this->decrementStock(
                    $product,
                    $stockData,
                    $usageQuantity,
                    $product->unit
                );
            }
            return $operation;
        });
    }


    public function createTransferOperation($product, $stockData)
    {
        return DB::transaction(function () use ($product, $stockData) {
            $operation = $this->createOperation(
                'transfer',
                $product,
                $stockData,
                $stockData['remarks'] ?? null
            );
            // Decrement stock from source location
            $this->decrementStock(
                $product,
                ['location_id' => $stockData['source_location_id'], 'batch_id' => $stockData['batch_id'] ?? null],
                $stockData['quantity'],
                $product->unit
            );
            // Increment stock to destination location
            $this->incrementStock(
                $product,
                ['location_id' => $stockData['destination_location_id'], 'batch_id' => $stockData['batch_id'] ?? null],
                $stockData['quantity']
            );
            return $operation;
        });
    }
    public function getStockByProductAndLocation($productId, $locationId)
    {
        return Stock::where('product_id', $productId)
            ->where('location_id', $locationId)
            ->first();
    }
    public function getStockByProductAndBatch($productId, $batchId)
    {
        return Stock::where('product_id', $productId)
            ->where('batch_id', $batchId)
            ->first();
    }
    public function getStockByProduct($productId)
    {
        return Stock::where('product_id', $productId)->get();
    }
    public function getStockByLocation($locationId)
    {
        return Stock::where('location_id', $locationId)->get();
    }
    public function getStockByBatch($batchId)
    {
        return Stock::where('batch_id', $batchId)->get();
    }
    public function getAllStocks()
    {
        return Stock::all();
    }

    public function getStockByRange($startDate, $endDate)
    {
        return Stock::whereBetween('created_at', [$startDate, $endDate])->get();
    }

    // Helper methods
    private function createOperation($type, $product, $stockData, $usageQuantity, $unit = null, $remarks = null, $operationDate = null)
    {
        return Operation::create([
            'operation_type' => $type,
            'product_id' => $product->id ?? $product,
            'location_id' => $stockData['location_id'],
            'batch_id' => $stockData['batch_id'] ?? null,
            'unit' => $unit ?? $product->unit,
            'quantity' => $usageQuantity,
            'operation_date' => $operationDate ?? now(),
            'remarks' => $remarks
        ]);
    }

    private function setStockStatus(float $quantity, float $minimum_quantity = 0)
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        } elseif ($quantity < $minimum_quantity) {
            return 'low_stock';
        } else {
            return 'available';
        }
    }

    private function setStock($product, $stockData, $quantity, $minimum_quantity = 0, $remarks = null, $status = 'available')
    {
        Stock::updateOrCreate(
            [
                'product_id' => $product->id ?? $product,
                'location_id' => $stockData['location_id'],
                'batch_id' => $stockData['batch_id'] ?? null,
            ],
            [
                'quantity' => $quantity,
                'minimum_quantity' => $minimum_quantity,
                'unit' => $stockData['unit'] ?? $product->unit,
                'status' => $this->setStockStatus($quantity, $minimum_quantity),
                'remarks' => $remarks
            ]
        );
    }

    private function incrementStock($product, $stockData, $quantity = 0, $unit = null)
    {

        // Use unit conversion service to convert quantity to base unit
        $stock = Stock::firstOrCreate(
            [
                'product_id' => $product->id ?? $product,
                'location_id' => $stockData['location_id'],
                'batch_id' => $stockData['batch_id'] ?? null,
            ],
            [
                'quantity' => $quantity,
                'unit' => $unit ?? $product->unit,
                'status' => $this->setStockStatus($quantity, $stockData['minimum_quantity'] ?? 0),
            ]
        );

        $stockUnit = $stock->unit ?? $product->unit;
        $quantityUnit = $unit ?? $product->unit;

        $stockUnitRecord = Cache::remember("unit_$stockUnit", 3600, fn() => Unit::findOrFail($stockUnit));
        $quantityUnitRecord = Cache::remember("unit_$quantityUnit", 3600, fn() => Unit::findOrFail($quantityUnit));

        if (!$stockUnitRecord && !$quantityUnitRecord) {
            throw new \Exception('Unit not found: ' . $stockUnit . ' or ' . $quantityUnit);
        }
        if ($stockUnitRecord['unit_type'] !== $quantityUnitRecord['unit_type']) {
            throw new \Exception('Unit type mismatch: Stock unit (' . $stockUnit . ') does not match unit type of (' . $quantityUnit . ')');
        }

        $stockInBaseUnit = $stockUnitRecord['base_unit'] === 'item' ? $stock->quantity : $this->unitConverter->toBaseUnit($stock->quantity, $stockUnitRecord['name']);
        $quantityInBaseUnit = $quantityUnitRecord['base_unit'] === 'item' ? $quantity : $this->unitConverter->toBaseUnit($quantity, $quantityUnitRecord['name']);

        if ($stock) {
            $newQuantityInBaseUnit = $stockInBaseUnit + $quantityInBaseUnit;
            $newQuantity = $this->unitConverter->fromBaseUnit($newQuantityInBaseUnit, $stockUnit);
            $stock->update([
                'quantity' => $newQuantity,
                'status' => $this->setStockStatus($newQuantity, $stock['minimum_quantity'] ?? 0),
            ]);
        } else {
            throw new \Exception('Stock not found for product: ' . $product->name ?? $product);
        }
    }

    private function decrementStock($product, $stockData, $quantity, $unit)
    {
        $stock = Stock::where('product_id', $product->id ?? $product)
            ->where('location_id', $stockData['location_id'])
            ->where('batch_id', $stockData['batch_id'] ?? null)
            ->first();
        $stockUnit = $stock->unit ?? 'item';
        $quantityUnit = $unit ?? $product->unit;

        $stockUnitRecord = Cache::remember("unit_$stockUnit", 3600, fn() => Unit::findOrFail($stockUnit));
        $quantityUnitRecord = Cache::remember("unit_$quantityUnit", 3600, fn() => Unit::findOrFail($quantityUnit));

        if ($stockUnitRecord['base_unit'] !== $quantityUnitRecord['base_unit']) {
            throw new \Exception('Base unit mismatch: Stock unit (' . $stockUnit . ') does not match quantity base unit (' . $quantityUnit . ')');
        }

        $stockInBaseUnit = $stockUnit === 'item' ? $stock->quantity : $this->unitConverter->toBaseUnit($stock->quantity, $stockUnit);


        $quantityInBaseUnit = $quantityUnit === 'item' ? $quantity : $this->unitConverter->toBaseUnit($quantity, $quantityUnit);

        if (!$stock || $stockInBaseUnit < $quantityInBaseUnit) {
            throw new \Exception('Insufficient stock for product: ' . $product->name ?? $product);
        }

        $remainingQuantity = $stockInBaseUnit - $quantityInBaseUnit;

        // dd("quantity $quantity", "remaining quantity: $remainingQuantity", "stock in base unit: $stockInBaseUnit", "usage quantity in base unit: $quantityInBaseUnit");
        if ($remainingQuantity > 0) {
            $updatedQuantity = $this->unitConverter->fromBaseUnit($remainingQuantity, $stockUnit);
            $stock->update([
                'quantity' => $updatedQuantity,
                'status' => $this->setStockStatus($updatedQuantity, $stock['minimum_quantity'] ?? 0),
            ]);
        } else {
            $stock->update([
                'quantity' => 0,
                'status' => 'out_of_stock'
            ]);
        }
    }
}
