<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('operations')->group(function () {
        Route::get('/', [\App\Http\Controllers\OperationController::class, 'index'])->name('operations.index');
        Route::get('/create', [\App\Http\Controllers\OperationController::class, 'create'])->name('operations.create');
        Route::get('/api/stock', [\App\Http\Controllers\OperationController::class, 'getStock'])->name('operations.stock');
        Route::post('/', [\App\Http\Controllers\OperationController::class, 'store'])->name('operations.store');
        Route::get('/{operation}', [\App\Http\Controllers\OperationController::class, 'show'])->name('operations.show');
        Route::get('/{operation}/edit', [\App\Http\Controllers\OperationController::class, 'edit'])->name('operations.edit');
        Route::put('/{operation}', [\App\Http\Controllers\OperationController::class, 'update'])->name('operations.update');
    });

    Route::resource('stocks', \App\Http\Controllers\StockController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/products.php';
require __DIR__ . '/suppliers.php';
require __DIR__ . '/warehouses.php';
