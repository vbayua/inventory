<?php

use App\Models\Location;
use App\Service\BatchAssignmentService;
use App\Service\StockCalculatorService;
use App\Service\StockOperationService;
use Database\Seeders\BlankStateSeeder;

beforeEach(function () {
    $this->seed(BlankStateSeeder::class);
    $this->service = app(StockCalculatorService::class);

});


describe('Unit Conversion', function () {

    test('Unit to base unit', function () {
    $units = [
        'kg',
        'gallon',
        'liter',
        'pcs'
    ];
    $baseUnits = [];
    foreach($units as $unit){
        $baseUnits[] = $this->service->toBaseUnit(1, $unit);
    }

    expect($baseUnits[0])->toBe(floatval(1000)); // 1 kg = 1000 g
    expect($baseUnits[1])->toBe(floatval(3785.41)); // 1 gallon = 3785.41 ml
    expect($baseUnits[2])->toBe(floatval(1000)); // 1 liter = 1000 ml
    expect($baseUnits[3])->toBe(floatval(1)); // 1 pcs = 1 item
    });

    test('From base unit to unit', function () {
        $quantities = [1000, 3785.41, 1000, 1];
        $units = ['kg', 'gallon', 'liter', 'pcs'];
        $convertedQuantities = [];
        foreach($units as $index => $unit){
            $convertedQuantities[] = $this->service->fromBaseUnit($quantities[$index], $unit);
        }

        expect($convertedQuantities[0])->toBe(floatval(1)); // 1000 g = 1 kg
        expect($convertedQuantities[1])->toBe(floatval(1)); // 3785.41 ml = 1 gallon
        expect($convertedQuantities[2])->toBe(floatval(1)); // 1000 ml = 1 liter
        expect($convertedQuantities[3])->toBe(floatval(1)); // 1 item = 1 pcs
    });

    it('Throws an exception when trying to convert using an invalid unit', function () {
        $this->service->toBaseUnit(1, 'invalid_unit');
    })->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
});

describe('Base Unit Retrieval', function () {
    test('Get base unit from unit name', function () {
        $baseUnit = $this->service->getBaseUnit('kg');
        expect($baseUnit)->toBe('g'); // Base unit for kg is g
    });

    test('Get base unit from Unit model instance', function () {
        $unitModel = \App\Models\Unit::where('name', 'liter')->first();
        $baseUnit = $this->service->getBaseUnit($unitModel);
        expect($baseUnit)->toBe('ml'); // Base unit for liter is ml
    });

    it('Throws an exception when trying to get base unit for an invalid unit', function () {
        $this->service->getBaseUnit('invalid_unit');
    })->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
});

describe('Container conversion', function () {

    test('Convert from container to base unit', function () {
        $stockService = app(StockOperationService::class);
        $batchService = app(BatchAssignmentService::class);

        $product = productWithSupplier([
            'product_type_id' => 1,
            'unit' => 'bottle',
        ]);
        $location = Location::factory()->create();
        $supplier = $product->suppliers->first();

        $batch = $batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $product->suppliers->first()->id
        );
        $stockData = [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'supplier_id' => $supplier->id,
            'batch_id' => $batch,
            'minimum_quantity' => 10,
            'container_capacity' => 500,
            'container_unit' => 'ml'
        ];
        $stock = $stockService->createInitialStock(
            $product,
            $stockData
        );

        $convertedQuantity = $this->service->containerToBaseUnit($stock->quantity, $stock);

        expect($convertedQuantity)->toBe(floatval(50000)); // 100 bottles * 500 ml = 50000 ml
    });

    test('Convert from base unit to container', function () {
        $stockService = app(StockOperationService::class);
        $batchService = app(BatchAssignmentService::class);

        $product = productWithSupplier([
            'product_type_id' => 1,
            'unit' => 'bottle',
        ]);
        $location = Location::factory()->create();
        $supplier = $product->suppliers->first();

        $batch = $batchService->determineBatch(
            product: $product,
            requestedBatchId: null,
            operationType: 'inbound',
            operationDate: now(),
            supplierId: $product->suppliers->first()->id
        );
        $stockData = [
            'product_id' => $product->id,
            'location_id' => $location->id,
            'warehouse_id' => $location->warehouse_id,
            'quantity' => 100,
            'supplier_id' => $supplier->id,
            'batch_id' => $batch,
            'minimum_quantity' => 10,
            'container_capacity' => 500,
            'container_unit' => 'ml'
        ];
        $stock = $stockService->createInitialStock(
            $product,
            $stockData
        );

        $convertedQuantity = $this->service->baseUnitToContainer(50000, $stock);

        expect($convertedQuantity)->toBe(floatval(100)); // 50000 ml / 500 ml per bottle = 100 bottles
    });

     it('Throws an exception when trying to convert using an invalid container unit', function () {
         $stockService = app(StockOperationService::class);
         $batchService = app(BatchAssignmentService::class);

         $product = productWithSupplier([
             'product_type_id' => 1,
             'unit' => 'bottle',
         ]);
         $location = Location::factory()->create();
         $supplier = $product->suppliers->first();

         $batch = $batchService->determineBatch(
             product: $product,
             requestedBatchId: null,
             operationType: 'inbound',
             operationDate: now(),
             supplierId: $product->suppliers->first()->id
         );
         $stockData = [
             'product_id' => $product->id,
             'location_id' => $location->id,
             'warehouse_id' => $location->warehouse_id,
             'quantity' => 100,
             'supplier_id' => $supplier->id,
             'batch_id' => $batch,
             'minimum_quantity' => 10,
             'container_capacity' => 500,
             'container_unit' => 'invalid_unit'
         ];
         $stock = $stockService->createInitialStock(
             $product,
             $stockData
         );

         $convertedQuantity = $this->service->baseUnitToContainer(50000, $stock);
    })->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
});
