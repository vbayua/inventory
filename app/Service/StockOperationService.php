<?php

namespace App\Service;

use App\DTO\StockData;
use App\Models\Batch;
use App\Models\Location;
use App\Models\Operation;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockAdjustment;
use App\Models\Unit;
use App\Service\StockCalculatorService as UnitConverter;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class StockOperationService
{
    protected $unitConverter;

    protected $batchService;

    protected const string INITIAL = 'initial';

    protected const string INBOUND = 'inbound';

    protected const string OUTBOUND = 'outbound';

    protected const string TRANSFER = 'transfer';

    protected const string ADJUSTMENT = 'adjustment';

    public function __construct(UnitConverter $unitConverter, BatchAssignmentService $batchService)
    {
        $this->unitConverter = $unitConverter;
        $this->batchService = $batchService;
    }

    public function createStockOperation(string $operationType, Product|int $product, Stock|StockData $stockData, float $quantity, Unit|string $unit, string $remarks = '', $operationDate = null, ?bool $withContainer = false)
    {
        switch ($operationType) {
            case self::INBOUND:
                return $this->createInboundOperation($product, $stockData, $quantity, $unit, $remarks, $operationDate);
            case self::OUTBOUND:
                return $this->createOutboundOperation($product, $stockData, $quantity, $unit, $remarks, $operationDate);
            case self::ADJUSTMENT:
                return $this->adjustStockOperation($stockData, $quantity, $unit, 'adjustment', $remarks, $operationDate, $withContainer);
            default:
                throw new \InvalidArgumentException("Unknown operation type: {$operationType}");
        }
    }

    public function createInitialStock(Product|int $product, StockData $stockData)
    {
        return DB::transaction(function () use ($product, $stockData) {
            $supplierId = $stockData['supplier_id'] ?? null;
            $batchId = $stockData['batch_id'] ?? null;
            $product = $product instanceof Product ? $product : Product::findOrFail($product);

            $batch = $batchId ? $this->batchService->determineBatch(
                $product,
                (int) $batchId,
                self::INITIAL,
                $stockData['date'] ?? null,
                $supplierId,
                $stockData['quantity']
            ) : $this->batchService->determineBatch(
                product: $product,
                operationType: self::INITIAL,
                operationDate: $stockData['date'] ?? null,
                supplierId: $supplierId,
                minQty:$stockData['minimum_quantity']
            );

            $stockData = $stockData->with(['batch_id' => (int) $batch]);

            $operation = $this->createOperation(
                self::INITIAL,
                $product,
                $stockData,
                $stockData['quantity'],
                $stockData['unit'] ?? $product->unit,
                $stockData['remarks'] ?? 'Initial stock',
                $stockData['date'] ?? now()
            );
            $stock = $this->setStock(
                $product,
                $stockData,
                $stockData['quantity'],
                $product->unit ?? $stockData['unit'],
                'set',
                $stockData['with_container'] ?? false
            );

            return $stock;
        });
    }

    public function adjustStockOperation(Stock|int $stock, float $quantity, Unit|string $unit, string $type, string $remarks = 'Stock Adjustment', $operationDate = null, ?bool $withContainer = false)
    {
        return DB::transaction(function () use ($stock, $quantity, $unit, $type, $remarks, $operationDate, $withContainer) {

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
                'remarks' => $remarks ?? '',
            ]);

            if ($type === 'addition') {
                $this->setStock(
                    $productId,
                    $stock,
                    $quantity,
                    $unit,
                    'increment',
                    $withContainer
                );
            } elseif ($type === 'subtraction') {
                $this->setStock(
                    $productId,
                    $stock,
                    $quantity,
                    $unit,
                    'decrement',
                    $withContainer
                );
            } else {
                throw new \InvalidArgumentException("Stock Adjustment of type {$type} is unknown");
            }

            return $operation;
        });
    }

    public function createInboundOperation(Product|int $product, Stock|StockData $stockData, float $receiveQuantity, string $unit, string $remarks = 'Inbound Operation', $operationDate = null)
    {
        return DB::transaction(function () use ($product, $stockData, $receiveQuantity, $unit, $remarks, $operationDate) {
            $product = $product instanceof Product ? $product : Product::findOrFail($product);

            // A Stock model instance always refers to an existing record.
            // A StockData DTO requires a DB look-up to decide which path to take.
            $stockExists = $stockData instanceof Stock
                ? true
                : Stock::where('product_id', $product->id)
                    ->where('location_id', $stockData['location_id'])
                    ->where('batch_id', $stockData['batch_id'])
                    ->exists();

            if ($stockExists) {
                // ── Inbound into an existing batch ────────────────────────────
                $this->createOperation(
                    self::INBOUND,
                    $product,
                    $stockData,
                    $receiveQuantity,
                    $unit,
                    $remarks,
                    $operationDate
                );

                return $this->setStock(
                    $product,
                    $stockData,
                    $receiveQuantity,
                    $unit,
                    'increment',
                    $stockData['with_container'] ?? false
                );
            }

            // ── Initial stock: no existing stock record for this batch ────────
            // Determine (or create) the appropriate batch before recording stock.
            $batchId    = $stockData['batch_id'] ?? null;
            $supplierId = $stockData['supplier_id'] ?? null;

            $resolvedBatchId = $batchId
                ? $this->batchService->determineBatch(
                    $product,
                    (int) $batchId,
                    self::INBOUND,
                    $stockData['date'] ?? null,
                    $supplierId,
                )
                : $this->batchService->determineBatch(
                    product: $product,
                    operationType: self::INBOUND,
                    operationDate: $stockData['date'] ?? null,
                    supplierId: $supplierId,
                    minQty: (int) ($stockData['minimum_quantity'] ?? 0),
                );

            $stockData = $stockData->with(['batch_id' => (int) $resolvedBatchId]);

            $this->createOperation(
                self::INITIAL,
                $product,
                $stockData,
                $receiveQuantity,
                $unit,
                $remarks,
                $operationDate
            );

            return $this->setStock(
                $product,
                $stockData,
                $receiveQuantity,
                $unit,
                'set',
                $stockData['with_container'] ?? false
            );
        });
    }

    public function createOutboundOperation(Product|int $product, Stock|StockData $stockData, float $usageQuantity, string $unit, string $remarks = 'Outbound Operation', $operationDate = null)
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
            $stock = $this->setStock(
                $product,
                $stockData,
                $usageQuantity,
                $unit,
                'decrement',
                $stockData['with_container'] ?? false
            );

            return $stock;
        });
    }

    public function createReturnOperation(Product|int $product, Stock|StockData $stockData, float $returnQuantity, string $unit, string $remarks = 'Return Operation', $operationDate = null)
    {
        return DB::transaction(function () use ($product, $stockData, $returnQuantity, $unit, $remarks, $operationDate) {
            $product = $product instanceof Product ? $product : Product::findOrFail($product);
            $stockId = $stockData instanceof Stock ? $stockData->id : ($stockData['id'] ?? null);

            $operation = $this->createOperation(
                'return',
                $product,
                $stockData,
                $returnQuantity,
                $unit,
                $remarks,
                $operationDate
            );

            if ($stockId) {
                $this->setStock(
                    $product,
                    $stockData,
                    $returnQuantity,
                    $unit,
                    'increment',
                    $stockData['with_container'] ?? false
                );
            } else {
                // If stock record doesn't exist, create it
                $this->setStock(
                    $product,
                    $stockData,
                    $returnQuantity,
                    $unit,
                    'set',
                    $stockData['with_container'] ?? false
                );
            }

            return $operation;
        });
    }

    public function createTransferOperation(Product|int $product, int $batchId, int $sourceLocationId, int $destinationLocationId, float $quantity, ?string $unit, ?string $remarks = null, ?string $operationDate = null)
    {
        return DB::transaction(function () use ($product, $batchId, $sourceLocationId, $destinationLocationId, $quantity, $unit, $remarks, $operationDate) {
            $product = $product instanceof Product ? $product : Product::findOrFail($product);

            // Lock source row
            $sourceStock = Stock::where('product_id', $product->id)
                ->where('location_id', $sourceLocationId)
                ->where('batch_id', $batchId)
                ->lockForUpdate()
                ->firstOrFail();

            // Find or create destination, lock if exists
            $destinationStock = Stock::where('product_id', $product->id)
                ->where('location_id', $destinationLocationId)
                ->where('batch_id', $batchId)
                ->lockForUpdate()
                ->first();

            if ($quantity > $sourceStock->quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Transfer quantity {$quantity} exceeds available stock of {$sourceStock->quantity} at source location.",
                ]);
            }

            if (! $destinationStock) {
                $destinationStock = Stock::create([
                    'product_id' => $product->id,
                    'location_id' => $destinationLocationId,
                    'batch_id' => $batchId,
                    'quantity' => 0,
                    'minimum_quantity' => 0,
                    'unit' => $sourceStock->unit,
                    'status' => 'out_of_stock',
                    'remarks' => 'Created for transfer',
                ]);
                // Relock newly created row
                $destinationStock = Stock::where('id', $destinationStock->id)->lockForUpdate()->firstOrFail();
            }

            // Generate correlation ID and resolve location names
            $correlationId = (string) Str::uuid();
            $sourceLocationName = optional(Location::find($sourceLocationId))->name ?? (string) $sourceLocationId;
            $destinationLocationName = optional(Location::find($destinationLocationId))->name ?? (string) $destinationLocationId;

            // Build remarks with correlation ID
            $baseRemarks = $remarks ?: 'Stock Transfer';
            $outRemarks = "{$baseRemarks} | correlation_id={$correlationId} | from={$sourceLocationName} -> to={$destinationLocationName}";
            $inRemarks = "{$baseRemarks} | correlation_id={$correlationId} | from={$sourceLocationName} -> to={$destinationLocationName}";

            // Transfer out operation
            $operationOut = $this->createOperation(
                'transfer_out',
                $product,
                $sourceStock,
                $quantity,
                $unit ?? $sourceStock->unit,
                $outRemarks,
                $operationDate
            );

            $updatedSourceStock = $this->decrementStock(
                $product,
                $sourceStock,
                $quantity,
                $unit ?? $sourceStock->unit
            );

            // Transfer in operation
            $operationIn = $this->createOperation(
                'transfer_in',
                $product,
                $destinationStock,
                $quantity,
                $unit ?? $destinationStock->unit,
                $inRemarks,
                $operationDate
            );

            $updatedDestinationStock = $this->incrementStock(
                $product,
                $destinationStock,
                $quantity,
                $unit ?? $destinationStock->unit
            );

            // If source stock is depleted, delete the row
            if ($updatedSourceStock && ($updatedSourceStock->status === 'out_of_stock' || (float) $updatedSourceStock->quantity <= 0.0)) {
                $updatedSourceStock->delete();
            }

            return [
                        'transfer_out' => $operationOut,
                        'transfer_in' => $operationIn,
                        'source' => $updatedSourceStock,
                        'destination' => $updatedDestinationStock,
                    ];
        });
    }

    public function createTransferOutOperation(Product|int $product, Stock|StockData $stockData, float $quantity, string $unit, ?string $remarks = null, ?string $operationDate = null, ?bool $withContainer = false)
    {
        return DB::transaction(function () use ($product, $stockData, $quantity, $unit, $remarks, $operationDate) {
            $operation = $this->createOperation(
                'transfer_out',
                $product,
                $stockData,
                $quantity,
                $unit,
                $remarks ?? 'Transfer Out Operation',
                $operationDate
            );

            $this->decrementStock(
                $product,
                $stockData,
                $quantity,
                $unit
            );

            return $operation;
        });
    }

    public function createTransferInOperation(Product|int $product, Stock|StockData $stockData, float $quantity, string $unit, ?string $remarks = null, ?string $operationDate = null, ?bool $withContainer = false)
    {
        return DB::transaction(function () use ($product, $stockData, $quantity, $unit, $remarks, $operationDate) {
            $operation = $this->createOperation(
                'transfer_in',
                $product,
                $stockData,
                $quantity,
                $unit,
                $remarks ?? 'Transfer In Operation',
                $operationDate
            );

            $this->incrementStock(
                $product,
                $stockData,
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
     * @param  string  $type  The type/category of the operation (e.g., 'ISSUE', 'ADJUSTMENT', 'RECEIPT').
     * @param  Product|int  $product  Product model instance or its primary key.
     * @param  Stock|StockData  $stockData  Stock model instance or StockData DTO containing at least 'location_id' and optionally 'batch_id'.
     * @param  float  $usageQuantity  The quantity involved in the operation (stored as given; no unit conversion performed here).
     * @param  Unit|string  $unit  Unit model instance or its name string used for the operation record.
     * @param  string  $remarks  Free-form remarks or notes (empty string if null/omitted).
     * @param  \DateTimeInterface|string|null  $operationDate  Explicit operation date/time; if null, current time is used.
     * @return Operation The newly created Operation model instance.
     *
     * @throws \Throwable If the database transaction fails.
     */
    private function createOperation(string $type, Product|int $product, Stock|StockData $stockData, float $usageQuantity, Unit|string $unit, string $remarks, $operationDate = null): Operation
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
                'remarks' => $remarks ?? '',
                'user_id' => $stockData['user_id'] ?? Auth::id(),
            ]);

            return $operation;
        });
    }


    public function setStockStatus(float $quantity, float $minimum_quantity = 0, string $status = ''): string
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        } elseif ($quantity < $minimum_quantity) {
            return 'low_stock';
        } else {
            return 'available';
        }
    }

    private function resolveBucketColumn(?string $qualityStatus):string
    {
        return match($qualityStatus) {
            'pending', 'checking', 'on_hold' => 'quantity_on_hold',
            'reserved' => 'quantity_reserved',
            'rejected' => 'quantity_rejected',
            default => 'quantity',
        };
    }

    private function setStock(Product|int $product, Stock|StockData $stockData, float $quantity, ?string $unit, string $mode, ?bool $withContainer = false): Stock
    {
        return DB::transaction(function () use ($product, $stockData, $quantity, $unit, $mode, $withContainer) {
            $productId = $product instanceof Product ? $product->id : $product;
            $quantityUnit = $this->getUnitRecord($unit);
            $qualityStatus = $stockData['quality_status'] ?? 'not_required';
            $bucket = $this->resolveBucketColumn($qualityStatus);
            $stock = Stock::where('product_id', $productId)
                ->where('location_id', $stockData['location_id'])
                ->where('batch_id', $stockData['batch_id'])
                ->with('batch:id,batch_number,minimum_quantity')
                ->lockForUpdate()
                ->first();

            if (! $stock || $mode === 'set') {
                $stock = new Stock;
                $stock->product_id = $productId;
                $stock->location_id = $stockData['location_id'];
                $stock->batch_id = $stockData['batch_id'] ?? null;
                $stock->unit = $quantityUnit->name;
                $stock->quantity = 0;
                $stock->quantity_on_hold = 0;
                $stock->quantity_reserved = 0;
                $stock->quantity_rejected = 0;
                $stock->minimum_quantity = $stockData['minimum_quantity'];
                $stock->container_capacity = $stockData['container_capacity'] ?? null;
                $stock->container_unit = $stockData['container_unit'] ?? null;
                $stock->status = 'out_of_stock';
                $stock->user_id = $stockData['user_id'] ?? Auth::id();
                $stock->save();
                // Relock newly reted row to be safe in high contention
                $stock = Stock::where('id', $stock->id)->lockForUpdate()->firstOrFail();
            }

            $stockUnit = $this->getUnitRecord($stock->unit);

            if ($stockUnit->base_unit !== $quantityUnit->base_unit) {
                throw new \Exception("Base unit mismatch: stock unit '{$stockUnit}' vs quantity unit '{$quantityUnit}'.");
            }

            $qtyInBase = $withContainer
                ? $this->unitConverter->containerToBaseUnit($quantity, $stock)
                : $this->unitConverter->toBaseUnit($quantity, $quantityUnit);

            //  Read from TARGET bucket.
            $currentBucketQtyInBase = $this->unitConverter->toBaseUnit($stock->{$bucket} ?? 0, $stockUnit);

            $newInBase = (float) 0;

            switch ($mode) {
                case 'set':
                    $newInBase = $qtyInBase;
                    break;
                case 'increment':
                    $newInBase = $currentBucketQtyInBase + $qtyInBase;
                    break;
                case 'decrement':
                    if ($currentBucketQtyInBase < $qtyInBase) {
                        $name = $product instanceof Product ? $product->name : (string) $productId;
                        throw ValidationException::withMessages([
                            'quantity' => "Insufficient stock for product: {$name}",
                        ]);
                    }
                    $newInBase = $currentBucketQtyInBase - $qtyInBase;
                    break;
                default:
                    throw new InvalidArgumentException("Unknown stock change mode: {$mode}");
            }

            $newQuantity = $this->unitConverter->fromBaseUnit($newInBase, $stockUnit);
            $stock->updateOrFail([
                $bucket => $newQuantity,
                'quality_status' => $qualityStatus,
                'status' => $this->setStockStatus($newQuantity, $stock->batch->minimum_quantity),
            ]);

            return $stock;
        });
    }

    public function transitionStockBucket(Stock $stock, float $quantity, string $fromBucket, string $toBucket, string $qualityStatus): Stock
    {
        return DB::transaction(function () use ($stock, $quantity, $fromBucket, $toBucket, $qualityStatus) {
            $stock = Stock::where('id', $stock->id)->lockForUpdate()->firstOrFail();

            $stock->updateOrFail([
                $fromBucket => max(0, ($stock->{$fromBucket} ?? 0) - $quantity),
                $toBucket => ($stock->{$toBucket} ?? 0) + $quantity,
                'quality_status' => $qualityStatus,
                'status' => $this->setStockStatus($stock->{$toBucket} + $quantity, $stock->batch->minimum_quantity),
            ]);

            return $stock->fresh();
        });
    }
    private function transferStock(Product|int $product, int $sourceStockLocation, int $destinationStockLocation, int $batchId, float $quantity, ?string $unit)
    {
        return DB::transaction(function () use ($product, $sourceStockLocation, $destinationStockLocation, $batchId, $quantity, $unit) {
            $product = $product instanceof Product ? $product : Product::findOrFail($product);
            $sourceStockData = Stock::where('product_id', $product->id)
                ->where('location_id', $sourceStockLocation)
                ->where('batch_id', $batchId)
                ->firstOrFail();

            $destinationStockData = Stock::where('product_id', $product->id)
                ->where('location_id', $destinationStockLocation)
                ->where('batch_id', $batchId)
                ->first();

            if (! $destinationStockData) {
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
            if ($newStockSource && ($newStockSource->status === 'out_of_stock' || (float) $newStockSource->quantity <= 0.0)) {
                $newStockSource->delete();
            }
        });
    }

    private function getUnitRecord($unit)
    {
        return Unit::findOrFail($unit);
    }

    private function lockAndLoadStock(Product|int $product, StockData $stockData): Stock
    {
        $productId = $product instanceof Product ? $product->id : $product;

        return Stock::where('product_id', $productId)
            ->where('location_id', $stockData['location_id'])
            ->where('batch_id', $stockData['batch_id'] ?? null)
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function incrementStock(Product|int $product, Stock|StockData $stockData, float $quantity = 0, ?string $unit = null)
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

            if (! $stock) {
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

    private function decrementStock(Product|int $product, Stock|StockData $stockData, float $quantity, ?string $unit)
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
                ->with('batch:id,batch_number,minimum_quantity')
                ->lockForUpdate()
                ->first();

            if (! $stock) {
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
                throw new \Exception('Insufficient stock for product: '.$product->name);
            }

            $newInBase = $currentStockInBase - $qtyInBase;
            $newQuantity = $this->unitConverter->fromBaseUnit($newInBase, $stockUnit);

            $stock->update([
                'quantity' => $newQuantity,
                'status' => $newInBase > 0
                    ? $this->setStockStatus($newQuantity, $stock->batch->minimum_quantity)
                    : 'out_of_stock',
            ]);

            return $stock->fresh();
        });
    }
}
