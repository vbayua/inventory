<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    Route::prefix('operations')->group(function () {
        Route::get('/', [\App\Http\Controllers\OperationController::class, 'index'])->name('operations.index');
        Route::get('/create', [\App\Http\Controllers\OperationController::class, 'create'])->name('operations.create');
        Route::get('/api/stock', [\App\Http\Controllers\OperationController::class, 'getStock'])->name('operations.stock');
        Route::post('/', [\App\Http\Controllers\OperationController::class, 'store'])->name('operations.store');
        Route::get('/{operation}', [\App\Http\Controllers\OperationController::class, 'show'])->name('operations.show');
        Route::get('/{operation}/edit', [\App\Http\Controllers\OperationController::class, 'edit'])->name('operations.edit');
        Route::put('/{operation}', [\App\Http\Controllers\OperationController::class, 'update'])->name('operations.update');
    });

    Route::prefix('batches')->group(function () {
        Route::get('/', [\App\Http\Controllers\BatchController::class, 'index'])->name('batch.index');
        Route::get('/create', [\App\Http\Controllers\BatchController::class, 'create'])->name('batch.create');
        Route::post('/', [\App\Http\Controllers\BatchController::class, 'store'])->name('batch.store');
        Route::get('/{batch}', [\App\Http\Controllers\BatchController::class, 'show'])->name('batch.show');
        Route::get('/{batch}/edit', [\App\Http\Controllers\BatchController::class, 'edit'])->name('batch.edit');
        Route::put('/{batch}', [\App\Http\Controllers\BatchController::class, 'update'])->name('batch.update');
    });

    Route::prefix('stocks')->group(function () {
        Route::get('/', [\App\Http\Controllers\StockController::class, 'index'])->name('stocks.index');
        Route::get('/{stock}', [\App\Http\Controllers\StockController::class, 'show'])->name('stocks.show');
        Route::get('/{stock}/export', [\App\Http\Controllers\StockController::class, 'exportStockCardByLocation'])->name('stocks.export');
        Route::get('/{stock}/export/pdf', [\App\Http\Controllers\StockController::class, 'exportPdf'])->name('stocks.export-pdf');
        Route::put('/{stock}', [\App\Http\Controllers\StockController::class, 'update'])->name('stocks.update');
        Route::get('/stock-card/{stock}', [\App\Http\Controllers\StockController::class, 'stockCard'])->name('stocks.stock-card');
        Route::get('/stock-card/{stock}/export/pdf', [\App\Http\Controllers\StockController::class, 'exportStockCardPdf'])->name('stocks.stock-card.export-pdf');
        Route::get('/export/stock-card/{stock}', [\App\Http\Controllers\StockController::class, 'exportStockCard'])->name('stocks.export.stock-card');
    });

    Route::prefix('stock-adjustments')->group(function () {
        Route::get('/', [\App\Http\Controllers\StockAdjustmentController::class, 'index'])->name('stock-adjustments.index');
        Route::get('/create', [\App\Http\Controllers\StockAdjustmentController::class, 'create'])->name('stock-adjustments.create');
        Route::post('/', [\App\Http\Controllers\StockAdjustmentController::class, 'store'])->name('stock-adjustments.store');
        Route::get('/{stockAdjustment}', [\App\Http\Controllers\StockAdjustmentController::class, 'show'])->name('stock-adjustments.show');
    });

    Route::prefix('partners')->group(function () {
        Route::get('/', [\App\Http\Controllers\PartnerController::class, 'index'])->name('partners.index');
        Route::get('/create', [\App\Http\Controllers\PartnerController::class, 'create'])->name('partners.create');
        Route::post('/', [\App\Http\Controllers\PartnerController::class, 'store'])->name('partners.store');
        Route::get('/{partner}', [\App\Http\Controllers\PartnerController::class, 'show'])->name('partners.show');
        Route::get('/{partner}/edit', [\App\Http\Controllers\PartnerController::class, 'edit'])->name('partners.edit');
        Route::put('/{partner}', [\App\Http\Controllers\PartnerController::class, 'update'])->name('partners.update');
    });

    Route::prefix('admin')->group(function () {
        Route::get('/', [\App\Http\Controllers\AdminController::class, 'index'])->name('admin.index');
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'index'])->name('admin.users.index');
        Route::get('/users/create', [\App\Http\Controllers\AdminController::class, 'create'])->name('admin.users.create');
        Route::post('/users', [\App\Http\Controllers\AdminController::class, 'store'])->name('admin.users.store');
        Route::get('/users/{user}', [\App\Http\Controllers\AdminController::class, 'show'])->name('admin.users.show');
        Route::get('/users/{user}/edit', [\App\Http\Controllers\AdminController::class, 'edit'])->name('admin.users.edit');
        Route::put('/users/{user}', [\App\Http\Controllers\AdminController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [\App\Http\Controllers\AdminController::class, 'destroy'])->name('admin.users.destroy');
    });

    Route::prefix('purchase-orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::get('/create', [\App\Http\Controllers\PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
        Route::post('/', [\App\Http\Controllers\PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        Route::get('/{purchase_order}', [\App\Http\Controllers\PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
        Route::get('/{purchase_order}/edit', [\App\Http\Controllers\PurchaseOrderController::class, 'edit'])->name('purchase-orders.edit');
        Route::put('/{purchase_order}', [\App\Http\Controllers\PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
        Route::get('/{purchase_order}/receive', [\App\Http\Controllers\PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
        Route::post('/{purchase_order}/receive', [\App\Http\Controllers\PurchaseOrderController::class, 'receiveStore'])->name('purchase-orders.process-receive');
    });

    Route::prefix('receive-orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\ReceiveOrderController::class, 'index'])->name('receive-orders.index');
        Route::get('/create', [\App\Http\Controllers\ReceiveOrderController::class, 'create'])->name('receive-orders.create');
        Route::post('/', [\App\Http\Controllers\ReceiveOrderController::class, 'store'])->name('receive-orders.store');
        Route::get('/{receive_order}', [\App\Http\Controllers\ReceiveOrderController::class, 'show'])->name('receive-orders.show');
        Route::get('/{receive_order}/item/{item}', [\App\Http\Controllers\ReceiveOrderController::class, 'showItem'])->name('receive-orders.item');
        Route::get('/{receive_order}/edit', [\App\Http\Controllers\ReceiveOrderController::class, 'edit'])->name('receive-orders.edit');
        Route::put('/{receive_order}', [\App\Http\Controllers\ReceiveOrderController::class, 'update'])->name('receive-orders.update');
        Route::get('/{receive_order}/receive', [\App\Http\Controllers\ReceiveOrderController::class, 'receive'])->name('receive-orders.receive');
        Route::post('/{receive_order}/receive', [\App\Http\Controllers\ReceiveOrderController::class, 'receiveStore'])->name('receive-orders.process-receive');
    });

    // QC Checklists
    Route::prefix('qc/checklists')->name('qc.checklists.')->group(function () {
        Route::get('/', [\App\Http\Controllers\QcChecklistController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\QcChecklistController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\QcChecklistController::class, 'store'])->name('store');
        Route::get('/{checklist}', [\App\Http\Controllers\QcChecklistController::class, 'show'])->name('show');
        Route::get('/{checklist}/edit', [\App\Http\Controllers\QcChecklistController::class, 'edit'])->name('edit');
        Route::put('/{checklist}', [\App\Http\Controllers\QcChecklistController::class, 'update'])->name('update');
        Route::delete('/{checklist}', [\App\Http\Controllers\QcChecklistController::class, 'destroy'])->name('destroy');
    });

    // QC Inspections
    Route::prefix('qc/inspections')->name('qc.inspections.')->group(function () {
        Route::get('/', [\App\Http\Controllers\QcInspectionController::class, 'index'])->name('index');
        Route::get('/{inspection}', [\App\Http\Controllers\QcInspectionController::class, 'show'])->name('show');
        Route::post('/{inspection}/start', [\App\Http\Controllers\QcInspectionController::class, 'start'])->name('start');
        Route::post('/{inspection}/approve', [\App\Http\Controllers\QcInspectionController::class, 'approve'])->name('approve');
        Route::post('/{inspection}/submit', [\App\Http\Controllers\QcInspectionController::class, 'submit'])->name('submit');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/products.php';
require __DIR__.'/suppliers.php';
require __DIR__.'/warehouses.php';
