<?php

namespace App\Service;

use App\Models\Operation;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockAdjustment;
use App\Models\Unit;
use App\Service\StockCalculatorService as UnitConverter;
use App\Service\BatchAssignmentService;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Illuminate\Support\Carbon;

class StockOperationService
{
    protected $unitConverter;
    protected $batchService;
    protected const INITIAL = 'initial';
    protected const INBOUND = 'inbound';
    protected const OUTBOUND = 'outbound';
    protected const TRANSFER = 'transfer';
    protected const ADJUSTMENT = 'adjustment';
    public function __construct(UnitConverter $unitConverter, BatchAssignmentService $batchService)
    {
        $this->unitConverter = $unitConverter;
        $this->batchService = $batchService;
    }

    public function createInitialStock(Product|int $product, array $stockData)
    {
        // dd($product->id, $product, $stockData);
        return DB::transaction(function () use ($product, $stockData) {;
            $supplierId = $stockData['supplier_id'] ?? null;
            $product = $product instanceof Product ? $product : Product::findOrFail($product);

            $batchId = isset($stockData['batch_id'])
                ? $this->batchService->determineBatch(
                    $product,
                    $stockData['batch_id'],
                    operationType: self::INBOUND,
                    supplierId: $supplierId
                )
                : $this->batchService->determineBatch(
                    $product,
                    operationType: self::INBOUND,
                    supplierId: $supplierId
                );

            if ($batchId) {
                $stockData['batch_id'] = $batchId;
            }
            $operation = $this->createOperation(
                self::INITIAL,
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
                $product->unit ?? $stockData['unit'],
                'set'
            );
            return $operation;
        });
    }

    public function adjustStockOperation(Stock|int $stock, float $quantity, Unit|string $unit, string $type, string $remarks = 'Stock Adjustment', $operationDate = null)
    {
        return DB::transaction(function () use ($stock, $quantity, $unit, $type, $remarks, $operationDate) {

            $stock = $stock instanceof Stock ? $stock : Stock::findOrFail($stock);
            $productId = $stock->product_id;

            $operation = $this->createOperation(
                'adjustment',
                $productId,
                $stock,
                $quantity,
                $unit,
                $remarks,
                $operationDate
            );

            StockAdjustment::create([
                'stock_id' => $stock->id,
                'quantity' => $quantity,
                'unit' => $unit,
                'adjustment_type' => $type,
                'remarks' => $remarks ?? ''
            ]);

            if ($type === 'addition') {
                $this->setStock(
                    $productId,
                    $stock,
                    $quantity,
                    $unit,
                    'increment'
                );
            } elseif ($type === 'subtraction') {
                $this->setStock(
                    $productId,
                    $stock,
                    $quantity,
                    $unit,
                    'decrement'
                );
            } else {
                throw new \InvalidArgumentException("Stock Adjustment of type {$type} is unknown");
            }

            return $operation;
        });
    }

    public function createInboundOperation(Product|int $product, Stock|array $stockData, float $receiveQuantity, string $unit, string $remarks = "Inbound Operation", $operationDate = null)
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
            $this->setStock(
                $product,
                $stockData,
                $receiveQuantity,
                $unit,
                'increment'
            );
            return $operation;
        });
    }
    public function createOutboundOperation(Product|int $product, Stock|array $stockData, float $usageQuantity, string $unit, string $remarks = "Outbound Operation", $operationDate = null)
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
            $this->setStock(
                $product,
                $stockData,
                $usageQuantity,
                $unit,
                'decrement'
            );
            return $operation;
        });
    }


    public function createTransferOperation($product, $stockData, $quantity, $unit, $remarks = null, $operationDate = null)
    {
        return DB::transaction(function () use ($product, $stockData, $quantity, $unit, $remarks, $operationDate) {
            $operation = $this->createOperation(
                'transfer',
                $product,
                $stockData,
                $quantity,
                $unit,
                $remarks ?? 'Transfer Operation',
                $operationDate
            );

            $this->transferStock(
                $product,
                $stockData['source_location_id'],
                $stockData['destination_location_id'],
                $stockData['batch_id'],
                $quantity,
                $unit
            );

            return $operation;
        });
    }


    // Helper methods

    /**
     * Create and persist a new Operation record inside a database transaction.
     *
     * Resolves the product (accepts a Product model instance or its integer ID) and unit
     * (accepts a Unit model instance or its string name), then creates an Operation
     * referencing the specified location and (optionally) batch from the provided stock
     * data array or Stock-like structure. The operation date defaults to the current
     * timestamp when not explicitly supplied.
     *
     * @param string                 $type           The type/category of the operation (e.g., 'ISSUE', 'ADJUSTMENT', 'RECEIPT').
     * @param Product|int            $product        Product model instance or its primary key.
     * @param Stock|array            $stockData      Stock instance or associative array containing at least 'location_id' and optionally 'batch_id'.
     * @param float                  $usageQuantity  The quantity involved in the operation (stored as given; no unit conversion performed here).
     * @param Unit|string            $unit           Unit model instance or its name string used for the operation record.
     * @param string                 $remarks        Free-form remarks or notes (empty string if null/omitted).
     * @param \DateTimeInterface|string|null $operationDate Explicit operation date/time; if null, current time is used.
     *
     * @return Operation The newly created Operation model instance.
     *
     * @throws \Throwable If the database transaction fails.
     */
    private function createOperation(string $type, Product|int $product, Stock|array $stockData, float $usageQuantity, Unit|string $unit, string $remarks, $operationDate = null): Operation
    {
        return DB::transaction(function () use ($type, $product, $stockData, $usageQuantity, $unit, $remarks, $operationDate) {
            $productId = $product instanceof Product ? $product->id : $product;
            $unitName = $unit instanceof Unit ? $unit->name : $unit;

            // Keep the provided date, but set the time to "now"
            $operationDateWithAddedTime = $operationDate
                ? ($operationDate instanceof \DateTimeInterface
                    ? Carbon::instance($operationDate)
                    : Carbon::parse($operationDate))
                : now();
            $now = now();
            $operationDateWithAddedTime = $operationDateWithAddedTime->setTime($now->hour, $now->minute, $now->second);

            $operation = Operation::create([
                'operation_type' => $type,
                'product_id' => $productId,
                'location_id' => $stockData['location_id'],
                'batch_id' => $stockData['batch_id'] ?? null,
                'unit' => $unitName,
                'quantity' => $usageQuantity,
                'operation_date' => $operationDateWithAddedTime,
                'remarks' => $remarks ?? ''
            ]);

            return $operation;
        });
    }

    public function setStockStatus(float $quantity, float $minimum_quantity)
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        } elseif ($quantity < $minimum_quantity) {
            return 'low_stock';
        } else {
            return 'available';
        }
    }

    private function setStock(Product|int $product, Stock|array $stockData, float $quantity, ?string $unit, string $mode): Stock
    {
        return DB::transaction(function () use ($product, $stockData, $quantity, $unit, $mode) {
            $productId = $product instanceof Product ? $product->id : $product;

            $quantityUnit = $this->getUnitRecord($unit);
            $stock = Stock::where('product_id', $productId)
                ->where('location_id', $stockData['location_id'])
                ->where('batch_id', $stockData['batch_id'])
                ->lockForUpdate()
                ->first();

            if (!$stock && $mode === 'set') {
                $stock = new Stock();
                $stock->product_id = $productId;
                $stock->location_id = $stockData['location_id'];
                $stock->batch_id = $stockData['batch_id'] ?? null;
                $stock->unit = $quantityUnit->name;
                $stock->quantity = 0;
                $stock->minimum_quantity = $stockData['minimum_quantity'];
                $stock->status = 'out_of_stock';
                $stock->save();
                // Relock newly reted row to be safe in high contention
                $stock = Stock::where('id', $stock->id)->lockForUpdate()->firstOrFail();
            }


            $stockUnit = $this->getUnitRecord($stock->unit);

            if ($stockUnit->base_unit !== $quantityUnit->base_unit) {
                throw new \Exception("Base unit mismatch: stock unit '{$stockUnit}' vs quantity unit '{$quantityUnit}'.");
            }

            $qtyInBase = $this->unitConverter->toBaseUnit($quantity, $quantityUnit);
            $currentStockQtyInBase = $this->unitConverter->toBaseUnit($stock->quantity, $stockUnit);

            $newInBase = (float) 0;

            switch ($mode) {
                case 'set':
                    $newInBase = $qtyInBase;
                    break;
                case 'increment':
                    $newInBase = $currentStockQtyInBase + $qtyInBase;
                    break;
                case 'decrement':
                    if ($currentStockQtyInBase < $qtyInBase) {
                        $name = $product instanceof Product ? $product->name : (string) $productId;
                        throw new \Exception("Insufficient stock for product: '{$name}'.");
                    }
                    $newInBase = $currentStockQtyInBase - $qtyInBase;
                    break;
                default:
                    throw new InvalidArgumentException("Unknown stock change mode: {$mode}");
            }

            $newQuantity = $this->unitConverter->fromBaseUnit($newInBase, $stockUnit);
            $stock->updateOrFail([
                'quantity' => $newQuantity,
                'status' => $this->setStockStatus($newQuantity, $stock->minimum_quantity),
            ]);

            return $stock;
        });
    }

    private function transferStock(Product|int $product, int $sourceStockLocation, int $destinationStockLocation, int $batchId, float $quantity, ?string $unit)
    {
        DB::transaction(function () use ($product, $sourceStockLocation, $destinationStockLocation, $batchId, $quantity, $unit) {
            $product = $product instanceof Product ? $product : Product::findOrFail($product);
            $sourceStockData = Stock::where('product_id', $product->id)
                ->where('location_id', $sourceStockLocation)
                ->where('batch_id', $batchId)
                ->firstOrFail();


            $destinationStockData = Stock::where('product_id', $product->id)
                ->where('location_id', $destinationStockLocation)
                ->where('batch_id', $batchId)
                ->first();

            if (!$destinationStockData) {
                // Create destination stock record if it doesn't exist
                $destinationStockData = Stock::create([
                    'product_id' => $product->id,
                    'location_id' => $destinationStockLocation,
                    'batch_id' => $batchId,
                    'quantity' => 0,
                    'minimum_quantity' => 0,
                    'unit' => $sourceStockData->unit,
                    'status' => 'out_of_stock',
                    'remarks' => 'Created for transfer',
                ]);
            }

            $newStockSource = $this->decrementStock($product, $sourceStockData, $quantity, $unit);
            $newStockDestination = $this->incrementStock($product, $destinationStockData, $quantity, $unit);
            // If everything was moved, delete the source stock row
            if ($newStockSource && ($newStockSource->status === 'out_of_stock' || (float)$newStockSource->quantity <= 0.0)) {
                $newStockSource->delete();
            }
        });
    }

    private function getUnitRecord($unit)
    {
        return Unit::findOrFail($unit);
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

    private function incrementStock(Product|int $product, Stock|array $stockData, float $quantity = 0, ?string $unit = null)
    {

        // Use unit conversion service to convert quantity to base unit
        if ($quantity < 0) {
            throw new \InvalidArgumentException('Quantity must be a positive number.');
        }

        return DB::transaction(function () use ($product, $stockData, $quantity, $unit) {
            $product = $product instanceof Product ? $product : Product::findOrFail($product);
            $unit = $unit ?? $product->unit;

            $stock = Stock::where('product_id', $product->id)
                ->where('location_id', $stockData['location_id'])
                ->where('batch_id', $stockData['batch_id'] ?? null)
                ->lockForUpdate()
                ->first();

            if (!$stock) {
                throw new \Exception("No stock for product {$product->name} at the specified location/batch");
            }

            // $quantityUnit = $unit ?? ($product instanceof Product ? $product->unit : $stockUnit);

            $stockUnit = $this->getUnitRecord($stock->unit);
            $quantityUnit = $this->getUnitRecord($unit);

            if ($stockUnit->base_unit !== $quantityUnit->base_unit) {
                throw new \Exception("Base unit mismatch: stock unit '{$stockUnit}' vs quantity unit '{$quantityUnit}'.");
            }

            // Normalize stock quantity
            $qtyInBase = $this->unitConverter->toBaseUnit($quantity, $quantityUnit);
            $currentStockInBase = $this->unitConverter->toBaseUnit($stock->quantity, $stockUnit);

            // Calculate and convert base unit
            $newInBase = $currentStockInBase + $qtyInBase;
            $newQuantity = $this->unitConverter->fromBaseUnit($newInBase, $stockUnit);
            $stock->update([
                'quantity' => $newQuantity,
                'status' => $this->setStockStatus($newQuantity, $stock['minimum_quantity']),
            ]);

            return $stock->fresh();
        });
    }

    private function decrementStock(Product|int $product, Stock|array $stockData, float $quantity, ?string $unit)
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be a positive number.');
        }
        return DB::transaction(function () use ($product, $stockData, $quantity, $unit) {
            $product = $product instanceof Product ? $product : Product::findOrFail($product);
            $unit = $unit ?? $product->unit; // Default to product unit if not provided

            // Lock the row to prevent concurrent decrements racing.
            $stock = Stock::where('product_id', $product->id)
                ->where('location_id', $stockData['location_id'])
                ->where('batch_id', $stockData['batch_id'] ?? null)
                ->lockForUpdate()
                ->first();

            if (!$stock) {
                throw new \Exception("No stock for product {$product->name} at the specified location/batch");
            }
            $stockUnit = $this->getUnitRecord($stock->unit);
            $quantityUnit = $this->getUnitRecord($unit);

            if ($stockUnit->base_unit !== $quantityUnit->base_unit) {
                throw new \Exception("Base unit mismatch: stock unit '{$stockUnit}' vs quantity unit '{$quantityUnit}'.");
            }

            // Normalize to base units to compare and compute
            $qtyInBase = $this->unitConverter->toBaseUnit($quantity, $quantityUnit);
            $currentStockInBase = $this->unitConverter->toBaseUnit($stock->quantity, $stockUnit);

            if ($currentStockInBase < $qtyInBase) {
                throw new \Exception('Insufficient stock for product: ' . $product->name);
            }

            $newInBase = $currentStockInBase - $qtyInBase;
            $newQuantity = $this->unitConverter->fromBaseUnit($newInBase, $stockUnit);

            $stock->update([
                'quantity' => $newQuantity,
                'status' => $newInBase > 0
                    ? $this->setStockStatus($newQuantity, $stock->minimum_quantity)
                    : 'out_of_stock'
            ]);

            return $stock->fresh();
        });
    }
}
