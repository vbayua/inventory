<?php

use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('suppliers')->group(function () {
        Route::get('/', [SupplierController::class, 'index'])->name('supplier.index');
        Route::get('/create', [SupplierController::class, 'create'])->name('supplier.create');
        Route::post('/', [SupplierController::class, 'store'])->name('supplier.store');
        Route::get('/{supplier}', [SupplierController::class, 'show'])->name('supplier.show');
        Route::get('/{supplier}/edit', [SupplierController::class, 'edit'])->name('supplier.edit');
        Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('supplier.destroy');
        Route::put('/{supplier}', [SupplierController::class, 'update'])->name('supplier.update');
        Route::put('/{supplier}/assign-products', [SupplierController::class, 'assignProduct'])->name('supplier.assign-products');
    });
});
