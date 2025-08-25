<?php

namespace App\Service;

use App\Models\Operation;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Unit;
use App\Service\StockCalculatorService as UnitConverter;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

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

    private function setStockStatus(float $quantity, float $minimum_quantity)
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        } elseif ($quantity < $minimum_quantity) {
            return 'low_stock';
        } else {
            return 'available';
        }
    }

    private function setStock($product, $stockData)
    {
        Stock::updateOrCreate(
            [
                'product_id' => $product->id ?? $product,
                'location_id' => $stockData['location_id'],
                'batch_id' => $stockData['batch_id'] ?? null,
            ],
            [
                'quantity' => $stockData['quantity'] ?? 0,
                'minimum_quantity' => $stockData['minimum_quantity'] ?? 0,
                'unit' => $stockData['unit'] ?? $product->unit,
                'status' => $this->setStockStatus($stockData['quantity'], $stockData['minimum_quantity']),
                'remarks' => $stockData['remarks'] ?? 'Stock updated',
            ]
        );
    }

    private function getUnitRecord($unit = 'item')
    {
        return Cache::remember("unit_$unit", 3600, fn() => Unit::findOrFail($unit));
    }

    private function lockAndLoadStock(Product|int $product, array $stockData): Stock
    {
        $productId = $product instanceof Product ? $product->id : $product;
        return Stock::where('product_id', $productId)
            ->where('location_id', $stockData['location_id'])
            ->where('batch_id', $stockData['batch_id'] ?? null)
            ->lockForUpdate()
            ->firstOrFail();
    }



    private function incrementStock(Product|int $product, array $stockData, float $quantity = 0, ?string $unit = null)
    {

        // Use unit conversion service to convert quantity to base unit
        if ($quantity < 0) {
            throw new \InvalidArgumentException('Quantity must be a positive number.');
        }

        DB::transaction(function () use ($product, $stockData, $quantity, $unit) {
            $productId = $product instanceof Product ? $product->id : $product;
            $productName = $product instanceof Product ? $product->name : (string) $product;

            $stock = Stock::firstOrCreate(
                [
                    'product_id' => $productId,
                    'location_id' => $stockData['location_id'],
                    'batch_id' => $stockData['batch_id']
                ],
                [
                    'quantity' => $quantity,
                    'unit' => $unit ?? $product->unit,
                    'status' => $this->setStockStatus($quantity, $stockData['minimum_quantity'] ?? 0),
                ]
            );

            if (!$stock) {
                throw new \Exception("No stock for product {$productName} at the specified location/batch");
            }

            $stockUnit = $stock->unit;
            $quantityUnit = $unit ?? ($product instanceof Product ? $product->unit : $stockUnit);

            $stockUnitRecord = $this->getUnitRecord($stockUnit);
            $quantityUnitRecord = $this->getUnitRecord($quantityUnit);

            if ($stockUnitRecord->base_unit !== $quantityUnitRecord->base_unit) {
                throw new \Exception("Base unit mismatch: stock unit '{$stockUnit}' vs quantity unit '{$quantityUnit}'.");
            }

            // Normalize stock quantity
            $stockInBaseUnit = $this->unitConverter->toBaseUnit($stock->quantity, $stockUnit);
            $quantityInBaseUnit = $this->unitConverter->toBaseUnit($quantity, $quantityUnit);

            // Calculate and convert base unit
            $totalQuantity = $stockInBaseUnit + $quantityInBaseUnit;
            $newQuantity = $this->unitConverter->fromBaseUnit($totalQuantity, $stockUnit);
            $stock->update([
                'quantity' => $newQuantity,
                'status' => $this->setStockStatus($newQuantity, $stock['minimum_quantity'] ?? 0),
            ]);
        });
    }

    private function decrementStock(Product|int $product, array $stockData, float $quantity, ?string $unit)
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be a positive number.');
        }
        DB::transaction(function () use ($product, $stockData, $quantity, $unit) {
            $productId = $product instanceof Product ? $product->id : $product;
            $productName = $product instanceof Product ? $product->name : (string) $product;

            // Lock the row to prevent concurrent decrements racing.
            $stock = Stock::where('product_id', $productId)
                ->where('location_id', $stockData['location_id'])
                ->where('batch_id', $stockData['batch_id'] ?? null)
                ->lockForUpdate()
                ->first();

            if (!$stock) {
                throw new \Exception("No stock for product {$productName} at the specified location/batch");
            }
            $stockUnit = $stock->unit;
            $quantityUnit = $unit ?? ($product instanceof Product ? $product->unit : $stockUnit);

            $stockUnitRecord = $this->getUnitRecord($stockUnit);
            $quantityUnitRecord = $this->getUnitRecord($quantityUnit);

            if ($stockUnitRecord->base_unit !== $quantityUnitRecord->base_unit) {
                throw new \Exception("Base unit mismatch: stock unit '{$stockUnit}' vs quantity unit '{$quantityUnit}'.");
            }

            // Normalize to base units to compare and compute
            $stockInBase = $this->unitConverter->toBaseUnit($stock->quantity, $stockUnit);
            $quantityInBase = $this->unitConverter->toBaseUnit($quantity, $quantityUnit);

            if ($stockInBase < $quantityInBase) {
                throw new \Exception('Insufficient stock for product: ' . $product->name ?? $product);
            }

            $remainingInBase = $stockInBase - $quantityInBase;
            $newQuantity = $this->unitConverter->fromBaseUnit($remainingInBase, $stockUnit);

            $stock->update([
                'quantity' => $newQuantity,
                'status' => $remainingInBase > 0
                    ? $this->setStockStatus($newQuantity, $stock->minimum_quantity ?? 0)
                    : 'out_of_stock'
            ]);
        });
    }
}
