<?php

use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('warehouse')->group(function () {
        Route::get('/', [WarehouseController::class, 'index'])->name('warehouse.index');
        Route::get('/create', [WarehouseController::class, 'create'])->name('warehouse.create');
        Route::get('menu', function () {
            return Inertia::render('Warehouse/Menu');
        })->name('warehouse.menu');
        Route::post('/', [WarehouseController::class, 'store'])->name('warehouse.store');
        Route::get('/{warehouse}', [WarehouseController::class, 'show'])->name('warehouse.show');
        Route::get('/{warehouse}/edit', [WarehouseController::class, 'edit'])->name('warehouse.edit');
        Route::delete('/{warehouse}', [WarehouseController::class, 'destroy'])->name('warehouse.destroy');
        Route::put('/{warehouse}', [WarehouseController::class, 'update'])->name('warehouse.update');
    });

    Route::prefix('location')->group(function () {
        Route::get('/', [LocationController::class, 'index'])->name('location.index');
        Route::get('/create', [LocationController::class, 'create'])->name('location.create');
        Route::post('/', [LocationController::class, 'store'])->name('location.store');
        Route::get('/{location}', [LocationController::class, 'show'])->name('location.show');
        Route::get('/{location}/edit', [LocationController::class, 'edit'])->name('location.edit');
        Route::delete('/{location}', [LocationController::class, 'destroy'])->name('location.destroy');
        Route::put('/{location}', [LocationController::class, 'update'])->name('location.update');
    });
});
