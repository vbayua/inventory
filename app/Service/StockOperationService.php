<?php

namespace App\Service;

use App\Models\Operation;
use App\Models\Stock;
use App\Models\Unit;
use App\Service\StockCalculatorService as UnitConverter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

// DONE: Implement Stock Calculator Service for unit conversions and calculations
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
                $stockData['remarks'] ?? 'Initial stock'
            );
            $this->setStock(
                $product,
                $stockData,
                $stockData['quantity'],
                $stockData['remarks'] ?? 'Initial stock',
                'available'
            );
            return $operation;
        });
    }

    public function createInboundOperation($product, $stockData, $receiveQuantity, $unit = null, $remarks = "Inbound Operation")
    {
        return DB::transaction(function () use ($product, $stockData, $receiveQuantity, $unit, $remarks) {
            $operation = $this->createOperation(
                'inbound',
                $product,
                $stockData,
                $receiveQuantity,
                $unit,
                $remarks
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
    public function createOutboundOperation($product, $stockData, $usageQuantity, $unit = null, $remarks = "Outbound Operation")
    {

        return DB::transaction(function () use ($product, $stockData, $usageQuantity, $unit, $remarks) {
            $operation = $this->createOperation(
                'outbound',
                $product,
                $stockData,
                $usageQuantity,
                $unit,
                $remarks
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
    private function createOperation($type, $product, $stockData, $usageQuantity, $unit = null,  $remarks = null)
    {
        return Operation::create([
            'operation_type' => $type,
            'product_id' => $product->id ?? $product,
            'location_id' => $stockData['location_id'],
            'batch_id' => $stockData['batch_id'] ?? null,
            'unit' => $unit ?? $product->unit,
            'quantity' => $usageQuantity,
            'operation_date' => now(),
            'remarks' => $remarks
        ]);
    }

    private function setStock($product, $stockData, $quantity, $remarks = null, $status = 'available')
    {
        Stock::updateOrCreate(
            [
                'product_id' => $product->id ?? $product,
                'location_id' => $stockData['location_id'],
                'batch_id' => $stockData['batch_id'] ?? null,
            ],
            [
                'quantity' => $quantity,
                'unit' => $product->unit,
                'status' => $status,
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
                'quantity' => 0, // Initialize quantity to 0 if stock does not exist
                'unit' => $unit ?? $product->unit,
                'status' => 'out_of_stock',
            ]
        );

        $stockUnit = $stock->unit ?? $product->unit;
        $quantityUnit = $unit ?? $product->unit;

        $stockUnitRecord = Cache::remember("unit_$stockUnit", 3600, fn() => Unit::findOrFail($stockUnit));
        $quantityUnitRecord = Cache::remember("unit_$quantityUnit", 3600, fn() => Unit::findOrFail($quantityUnit));

        if ($stockUnitRecord['unit_type'] !== $quantityUnitRecord['unit_type']) {
            throw new \Exception('Unit type mismatch: Stock unit (' . $stockUnit . ') does not match unit type of (' . $quantityUnit . ')');
        }

        $stockInBaseUnit = $stockUnit['base_unit'] === 'item' ? $stock->quantity : $this->unitConverter->toBaseUnit($stock->quantity, $stockUnit);
        $quantityInBaseUnit = $quantityUnit['base_unit'] === 'item' ? $quantity : $this->unitConverter->toBaseUnit($quantity, $quantityUnit);

        if ($stock) {
            $newQuantityInBaseUnit = $stockInBaseUnit + $quantityInBaseUnit;
            $newQuantity = $this->unitConverter->fromBaseUnit($newQuantityInBaseUnit, $stockUnit);
            $stock->update([
                'quantity' => $newQuantity,
                'status' => 'available'
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
            $stock->update([
                'quantity' => $this->unitConverter->fromBaseUnit($remainingQuantity, $stockUnit),
                'status' => $remainingQuantity > 0 ? 'available' : 'out_of_stock'
            ]);
        } else {
            $stock->update([
                'quantity' => 0,
                'status' => 'out_of_stock'
            ]);
        }
    }
}
