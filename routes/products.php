<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('products.index');
        Route::get('/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/', [ProductController::class, 'store'])->name('products.store');
        Route::get('/{product}', [ProductController::class, 'show'])->name('products.show');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::put('/{product}', [ProductController::class, 'update'])->name('products.update');
    });

    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('/', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('/{category}', [CategoryController::class, 'show'])->name('categories.show');
        Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::put('/{category}', [CategoryController::class, 'update'])->name('categories.update');
    });

    Route::prefix('units')->group(function () {
        Route::get('/', [UnitController::class, 'index'])->name('units.index');
        Route::get('/create', [UnitController::class, 'create'])->name('units.create');
        Route::post('/', [UnitController::class, 'store'])->name('units.store');
        Route::get('/{unit}', [UnitController::class, 'show'])->name('units.show');
        Route::get('/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit');
        Route::delete('/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
        Route::put('/{unit}', [UnitController::class, 'update'])->name('units.update');
    });
});
