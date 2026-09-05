<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\QcChecklistController;
use App\Http\Controllers\QcInspectionController;
use App\Http\Controllers\ReceiveOrderController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    Route::prefix('operations')->group(function () {
        Route::get('/', [OperationController::class, 'index'])->name('operations.index');
        Route::get('/create', [OperationController::class, 'create'])->name('operations.create');
        Route::get('/api/stock', [OperationController::class, 'getStock'])->name('operations.stock');
        Route::post('/', [OperationController::class, 'store'])->name('operations.store');
        Route::get('/{operation}', [OperationController::class, 'show'])->name('operations.show');
        Route::get('/{operation}/edit', [OperationController::class, 'edit'])->name('operations.edit');
        Route::put('/{operation}', [OperationController::class, 'update'])->name('operations.update');
    });

    Route::prefix('batches')->group(function () {
        Route::get('/', [BatchController::class, 'index'])->name('batch.index');
        Route::get('/create', [BatchController::class, 'create'])->name('batch.create');
        Route::post('/', [BatchController::class, 'store'])->name('batch.store');
        Route::get('/{batch}', [BatchController::class, 'show'])->name('batch.show');
        Route::get('/{batch}/edit', [BatchController::class, 'edit'])->name('batch.edit');
        Route::put('/{batch}', [BatchController::class, 'update'])->name('batch.update');
    });

    Route::prefix('stocks')->group(function () {
        Route::get('/', [StockController::class, 'index'])->name('stocks.index');
        Route::get('/{stock}', [StockController::class, 'show'])->name('stocks.show');
        Route::get('/{stock}/export', [StockController::class, 'exportStockCardByLocation'])->name('stocks.export');
        Route::get('/{stock}/export/pdf', [StockController::class, 'exportPdf'])->name('stocks.export-pdf');
        Route::put('/{stock}', [StockController::class, 'update'])->name('stocks.update');
        Route::get('/stock-card/{stock}', [StockController::class, 'stockCard'])->name('stocks.stock-card');
        Route::get('/stock-card/{stock}/export/pdf', [StockController::class, 'exportStockCardPdf'])->name('stocks.stock-card.export-pdf');
        Route::get('/export/stock-card/{stock}', [StockController::class, 'exportStockCard'])->name('stocks.export.stock-card');
    });

    Route::prefix('stock-adjustments')->group(function () {
        Route::get('/', [StockAdjustmentController::class, 'index'])->name('stock-adjustments.index');
        Route::get('/create', [StockAdjustmentController::class, 'create'])->name('stock-adjustments.create');
        Route::post('/', [StockAdjustmentController::class, 'store'])->name('stock-adjustments.store');
        Route::get('/{stockAdjustment}', [StockAdjustmentController::class, 'show'])->name('stock-adjustments.show');
    });

    Route::prefix('partners')->group(function () {
        Route::get('/', [PartnerController::class, 'index'])->name('partners.index');
        Route::get('/create', [PartnerController::class, 'create'])->name('partners.create');
        Route::post('/', [PartnerController::class, 'store'])->name('partners.store');
        Route::get('/{partner}', [PartnerController::class, 'show'])->name('partners.show');
        Route::get('/{partner}/edit', [PartnerController::class, 'edit'])->name('partners.edit');
        Route::put('/{partner}', [PartnerController::class, 'update'])->name('partners.update');
    });

    Route::prefix('admin')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('admin.index');
        Route::get('/users', [AdminController::class, 'index'])->name('admin.users.index');
        Route::get('/users/create', [AdminController::class, 'create'])->name('admin.users.create');
        Route::post('/users', [AdminController::class, 'store'])->name('admin.users.store');
        Route::get('/users/{user}', [AdminController::class, 'show'])->name('admin.users.show');
        Route::get('/users/{user}/edit', [AdminController::class, 'edit'])->name('admin.users.edit');
        Route::put('/users/{user}', [AdminController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [AdminController::class, 'destroy'])->name('admin.users.destroy');
    });

    Route::prefix('roles')->name('role.')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('index');
        Route::get('/create', [RoleController::class, 'create'])->name('create');
        Route::post('/', [RoleController::class, 'store'])->name('store');
        Route::get('/{role}', [RoleController::class, 'show'])->name('show');
        Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit');
        Route::put('/{role}', [RoleController::class, 'update'])->name('update');
        Route::get('/{role}/permissions', [RoleController::class, 'editPermission'])->name('edit.permissions');
        Route::put('/{role}/permissions', [RoleController::class, 'updatePermission'])->name('update.permissions');
        Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('purchase-orders')->group(function () {
        Route::get('/', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::get('/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
        Route::post('/', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        Route::get('/{purchase_order}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
        Route::get('/{purchase_order}/edit', [PurchaseOrderController::class, 'edit'])->name('purchase-orders.edit');
        Route::put('/{purchase_order}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
        Route::get('/{purchase_order}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
        Route::post('/{purchase_order}/receive', [PurchaseOrderController::class, 'receiveStore'])->name('purchase-orders.process-receive');
    });

    Route::prefix('receive-orders')->group(function () {
        Route::get('/', [ReceiveOrderController::class, 'index'])->name('receive-orders.index');
        Route::get('/create', [ReceiveOrderController::class, 'create'])->name('receive-orders.create');
        Route::post('/', [ReceiveOrderController::class, 'store'])->name('receive-orders.store');
        Route::get('/{receive_order}', [ReceiveOrderController::class, 'show'])->name('receive-orders.show');
        Route::get('/{receive_order}/item/{item}', [ReceiveOrderController::class, 'showItem'])->name('receive-orders.item');
        Route::get('/{receive_order}/edit', [ReceiveOrderController::class, 'edit'])->name('receive-orders.edit');
        Route::put('/{receive_order}', [ReceiveOrderController::class, 'update'])->name('receive-orders.update');
        Route::get('/{receive_order}/receive', [ReceiveOrderController::class, 'receive'])->name('receive-orders.receive');
        Route::post('/{receive_order}/receive', [ReceiveOrderController::class, 'receiveStore'])->name('receive-orders.process-receive');
    });

    // QC Checklists
    Route::prefix('qc/checklists')->name('qc.checklists.')->group(function () {
        Route::get('/', [QcChecklistController::class, 'index'])->name('index');
        Route::get('/create', [QcChecklistController::class, 'create'])->name('create');
        Route::post('/', [QcChecklistController::class, 'store'])->name('store');
        Route::get('/{checklist}', [QcChecklistController::class, 'show'])->name('show');
        Route::get('/{checklist}/edit', [QcChecklistController::class, 'edit'])->name('edit');
        Route::put('/{checklist}', [QcChecklistController::class, 'update'])->name('update');
        Route::delete('/{checklist}', [QcChecklistController::class, 'destroy'])->name('destroy');
    });

    // QC Inspections
    Route::prefix('qc/inspections')->name('qc.inspections.')->group(function () {
        Route::get('/', [QcInspectionController::class, 'index'])->name('index');
        Route::get('/{inspection}', [QcInspectionController::class, 'show'])->name('show');
        Route::get('/{inspection}/approvals', [QcInspectionController::class, 'approvals'])->name('approvals');
        Route::post('/{inspection}/start', [QcInspectionController::class, 'start'])->name('start');
        Route::post('/{inspection}/approve', [QcInspectionController::class, 'approve'])->name('approve');
        Route::post('/{inspection}/submit', [QcInspectionController::class, 'submit'])->name('submit');
    });

    Route::prefix('production')->name('production.')->group(function () {
        Route::get('/', [ProductionController::class, 'index'])->name('index');
        Route::get('/create', [ProductionController::class, 'create'])->name('create');
        Route::get('/{production}', [ProductionController::class, 'show'])->name('show');
        Route::get('/{production}/edit', [ProductionController::class, 'edit'])->name('edit');
    });

    Route::prefix('production-plan')->name('production-plan.')->group(function () {
        Route::get('/', function () {
            return 'Production Plan Index';
        })->name('index');
        Route::get('/{plan}', function () {
            return 'Production Plan Show';
        })->name('show');
        Route::get('/{plan}/edit', function () {
            return 'Production Plan Edit';
        })->name('edit');
        Route::post('/{plan}', function () {
            return 'Production Plan Update';
        })->name('update');
        Route::delete('/{plan}', function () {
            return 'Production Plan Delete';
        })->name('destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/products.php';
require __DIR__.'/suppliers.php';
require __DIR__.'/warehouses.php';
