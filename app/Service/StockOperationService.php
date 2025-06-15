<?php

namespace App\Service;

use App\Models\Operation;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;


class StockOperationService
{
    public function createInitialStock($product, $stockData)
    {
        return DB::transaction(function () use ($product, $stockData) {
            $operation = $this->createOperation(
                'initial',
                $product,
                $stockData,
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

    public function createInboundOperation($product, $stockData)
    {
        return DB::transaction(function () use ($product, $stockData) {
            $operation = $this->createOperation(
                'inbound',
                $product,
                $stockData,
                $stockData['remarks'] ?? null
            );
            $this->incrementStock(
                $product,
                $stockData,
                $stockData['quantity']
            );
            return $operation;
        });
    }
    public function createOutboundOperation($product, $stockData)
    {
        return DB::transaction(function () use ($product, $stockData) {
            $operation = $this->createOperation(
                'inbound',
                $product,
                $stockData,
                $stockData['remarks'] ?? null
            );
            $this->decrementStock(
                $product,
                $stockData,
                $stockData['quantity']
            );
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
                $stockData['quantity']
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
    private function createOperation($type, $product, $stockData, $remarks = null)
    {
        return Operation::create([
            'operation_type' => $type,
            'product_id' => $product->id,
            'location_id' => $stockData['location_id'],
            'batch_id' => $stockData['batch_id'] ?? null,
            'unit' => $product->unit,
            'quantity' => $stockData['quantity'],
            'operation_date' => now(),
            'remarks' => $remarks
        ]);
    }

    private function setStock($product, $stockData, $quantity, $remarks = null, $status = 'available')
    {
        Stock::updateOrCreate(
            [
                'product_id' => $product->id,
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

    private function incrementStock($product, $stockData, $quantity)
    {
        $stock = Stock::firstOrCreate(
            [
                'product_id' => $product->id,
                'location_id' => $stockData['location_id'],
                'batch_id' => $stockData['batch_id'] ?? null,
            ],
            ['quantity' => 0, 'unit' => $product->unit, 'status' => 'available']
        );
    }

    private function decrementStock($product, $stockData, $quantity)
    {
        $stock = Stock::where('product_id', $product->id)
            ->where('location_id', $stockData['location_id'])
            ->where('batch_id', $stockData['batch_id'] ?? null)
            ->first();

        if (!$stock || $stock->quantity < $quantity) {
            throw new \Exception('Insufficient stock for product: ' . $product->name);
        }
        $stock->quantity -= $quantity;
        $stock->save();
    }
}
