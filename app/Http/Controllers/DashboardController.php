<?php

namespace App\Http\Controllers;

use App\Enums\ProductionOrderStatus;
use App\Models\Batch;
use App\Models\Operation;
use App\Models\ProductionOrder;
use App\Models\PurchaseOrder;
use App\Models\QcInspection;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Days ahead of today in which a batch counts as expiring soon.
     */
    private const EXPIRY_WINDOW_DAYS = 30;

    /**
     * Number of days shown in the stock movement chart.
     */
    private const MOVEMENT_WINDOW_DAYS = 30;

    /**
     * Maximum rows shown in each dashboard list.
     */
    private const LIST_LIMIT = 10;

    /**
     * Purchase order statuses that still expect goods to arrive.
     */
    private const OPEN_PURCHASE_ORDER_STATUSES = ['pending', 'partially_received'];

    /**
     * QC inspection statuses that still need an inspector's decision.
     */
    private const PENDING_QC_STATUSES = ['pending', 'checking'];

    /**
     * The minimum quantity that applies to a stock line: its batch's, else its own.
     */
    private const MINIMUM_QUANTITY_SQL = 'coalesce(batches.minimum_quantity, stocks.minimum_quantity)';

    /**
     * Render the dashboard shell immediately and load each section as a deferred prop.
     *
     * Each group is fetched in its own parallel request, so a slow section does not hold up the rest.
     */
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => Inertia::defer(fn (): array => $this->stats(), 'stats'),
            'stockMovements' => Inertia::defer(fn (): array => $this->stockMovements(), 'movements'),
            'stockByWarehouse' => Inertia::defer(fn (): array => $this->stockByWarehouse(), 'charts'),
            'topMovers' => Inertia::defer(fn (): array => $this->topMovers(), 'charts'),
            'lowStock' => Inertia::defer(fn (): array => $this->lowStock(), 'attention'),
            'expiringBatches' => Inertia::defer(fn (): array => $this->expiringBatches(), 'attention'),
            'pendingInspections' => Inertia::defer(fn (): array => $this->pendingInspections(), 'attention'),
            'overduePurchaseOrders' => Inertia::defer(fn (): array => $this->overduePurchaseOrders(), 'attention'),
            'recentOperations' => Inertia::defer(fn (): array => $this->recentOperations(), 'activity'),
        ]);
    }

    /**
     * Headline counts for the KPI tiles.
     *
     * @return array{products_in_stock: int, low_stock: int, out_of_stock: int, expiring_batches: int, expired_batches: int, open_purchase_orders: int, overdue_purchase_orders: int, pending_inspections: int, active_production_orders: int}
     */
    private function stats(): array
    {
        return [
            'products_in_stock' => Stock::query()->where('quantity', '>', 0)->distinct()->count('product_id'),
            'low_stock' => $this->lowStockQuery()->count(),
            'out_of_stock' => Stock::query()->where('quantity', '<=', 0)->count(),
            'expiring_batches' => $this->expiringBatchesQuery()->where('expiry_date', '>=', today())->count(),
            'expired_batches' => $this->expiringBatchesQuery()->where('expiry_date', '<', today())->count(),
            'open_purchase_orders' => PurchaseOrder::query()->whereIn('status', self::OPEN_PURCHASE_ORDER_STATUSES)->count(),
            'overdue_purchase_orders' => $this->overduePurchaseOrdersQuery()->count(),
            'pending_inspections' => QcInspection::query()->whereIn('status', self::PENDING_QC_STATUSES)->count(),
            'active_production_orders' => ProductionOrder::query()
                ->whereIn('status', [ProductionOrderStatus::Released->value, ProductionOrderStatus::InProgress->value])
                ->count(),
        ];
    }

    /**
     * Distinct products held in each warehouse.
     *
     * Counted in products rather than summed quantity because stock lines use mixed units.
     *
     * @return list<array{warehouse: string, products: int}>
     */
    private function stockByWarehouse(): array
    {
        return DB::table('warehouses')
            ->join('locations', 'locations.warehouse_id', '=', 'warehouses.id')
            ->join('stocks', 'stocks.location_id', '=', 'locations.id')
            ->where('stocks.quantity', '>', 0)
            ->groupBy('warehouses.id', 'warehouses.name')
            ->orderByDesc('products')
            ->get(['warehouses.name as warehouse', DB::raw('count(distinct stocks.product_id) as products')])
            ->map(fn (object $row): array => ['warehouse' => $row->warehouse, 'products' => (int) $row->products])
            ->all();
    }

    /**
     * Daily inbound and outbound movement counts, with zero-filled gaps.
     *
     * Initial stock counts as inbound. Transfers and adjustments are excluded
     * because they do not move goods into or out of the business.
     *
     * @return list<array{date: string, inbound: int, outbound: int}>
     */
    private function stockMovements(): array
    {
        $start = today()->subDays(self::MOVEMENT_WINDOW_DAYS - 1);

        $countsByDate = Operation::query()
            ->where('operation_date', '>=', $start)
            ->whereIn('operation_type', ['initial', 'inbound', 'outbound'])
            ->selectRaw('date(operation_date) as day')
            ->selectRaw("sum(case when operation_type = 'outbound' then 0 else 1 end) as inbound")
            ->selectRaw("sum(case when operation_type = 'outbound' then 1 else 0 end) as outbound")
            ->groupBy('day')
            ->get()
            ->keyBy(fn (Operation $row): string => Carbon::parse($row->day)->toDateString());

        return collect(range(0, self::MOVEMENT_WINDOW_DAYS - 1))
            ->map(function (int $offset) use ($start, $countsByDate): array {
                $date = $start->copy()->addDays($offset)->toDateString();
                $counts = $countsByDate->get($date);

                return [
                    'date' => $date,
                    'inbound' => (int) ($counts->inbound ?? 0),
                    'outbound' => (int) ($counts->outbound ?? 0),
                ];
            })
            ->all();
    }

    /**
     * Products with the most outbound operations in the movement window.
     *
     * Ranked by operation count rather than summed quantity because products use mixed units.
     *
     * @return list<array{product_id: int, product: string|null, movements: int}>
     */
    private function topMovers(): array
    {
        return Operation::query()
            ->where('operation_type', 'outbound')
            ->where('operation_date', '>=', today()->subDays(self::MOVEMENT_WINDOW_DAYS - 1))
            ->select('product_id', DB::raw('count(*) as movements'))
            ->groupBy('product_id')
            ->orderByDesc('movements')
            ->orderBy('product_id')
            ->limit(self::LIST_LIMIT)
            ->with('product:id,name')
            ->get()
            ->map(fn (Operation $operation): array => [
                'product_id' => $operation->product_id,
                'product' => $operation->product?->name,
                'movements' => (int) $operation->movements,
            ])
            ->all();
    }

    /**
     * Stock lines below their batch's minimum quantity, most depleted first.
     *
     * @return list<array{id: int, product: string|null, location: string|null, quantity: float, minimum_quantity: float, unit: string}>
     */
    private function lowStock(): array
    {
        return $this->lowStockQuery()
            ->addSelect(DB::raw(self::MINIMUM_QUANTITY_SQL.' as effective_minimum_quantity'))
            ->with(['product:id,name', 'location:id,name'])
            ->orderByRaw('(stocks.quantity * 1.0) / '.self::MINIMUM_QUANTITY_SQL)
            ->limit(self::LIST_LIMIT)
            ->get()
            ->map(fn (Stock $stock): array => [
                'id' => $stock->id,
                'product' => $stock->product?->name,
                'location' => $stock->location?->name,
                'quantity' => (float) $stock->quantity,
                'minimum_quantity' => (float) $stock->effective_minimum_quantity,
                'unit' => $stock->unit,
            ])
            ->all();
    }

    /**
     * Batches with stock on hand that are expired or expire soon, soonest first.
     *
     * @return list<array{id: int, batch_number: string, product: string|null, expiry_date: string, is_expired: bool}>
     */
    private function expiringBatches(): array
    {
        return $this->expiringBatchesQuery()
            ->with('product:id,name')
            ->orderBy('expiry_date')
            ->limit(self::LIST_LIMIT)
            ->get()
            ->map(fn (Batch $batch): array => [
                'id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'product' => $batch->product?->name,
                'expiry_date' => $batch->expiry_date->toDateString(),
                'is_expired' => $batch->isExpired(),
            ])
            ->all();
    }

    /**
     * QC inspections waiting for a decision, oldest first.
     *
     * @return list<array{id: int, product: string|null, receive_number: string|null, status: string, created_at: string}>
     */
    private function pendingInspections(): array
    {
        return QcInspection::query()
            ->whereIn('status', self::PENDING_QC_STATUSES)
            ->with(['receiveOrder:id,receive_number', 'receiveOrderItem.purchaseOrderItem.product:id,name'])
            ->oldest()
            ->limit(self::LIST_LIMIT)
            ->get()
            ->map(fn (QcInspection $inspection): array => [
                'id' => $inspection->id,
                'product' => $inspection->receiveOrderItem?->purchaseOrderItem?->product?->name,
                'receive_number' => $inspection->receiveOrder?->receive_number,
                'status' => $inspection->status,
                'created_at' => $inspection->created_at->toDateString(),
            ])
            ->all();
    }

    /**
     * Open purchase orders past their expected delivery date, most overdue first.
     *
     * @return list<array{id: int, po_number: string, supplier: string|null, expected_delivery_date: string, status: string}>
     */
    private function overduePurchaseOrders(): array
    {
        return $this->overduePurchaseOrdersQuery()
            ->with('supplier:id,name')
            ->orderBy('expected_delivery_date')
            ->limit(self::LIST_LIMIT)
            ->get()
            ->map(fn (PurchaseOrder $purchaseOrder): array => [
                'id' => $purchaseOrder->id,
                'po_number' => $purchaseOrder->po_number,
                'supplier' => $purchaseOrder->supplier?->name,
                'expected_delivery_date' => Carbon::parse($purchaseOrder->expected_delivery_date)->toDateString(),
                'status' => $purchaseOrder->status,
            ])
            ->all();
    }

    /**
     * The latest stock operations across all locations.
     *
     * @return list<array{id: int, operation_type: string, product: string|null, location: string|null, quantity: float, unit: string, user: string|null, operation_date: string}>
     */
    private function recentOperations(): array
    {
        return Operation::query()
            ->with(['product:id,name', 'location:id,name', 'user:id,name'])
            ->latest('operation_date')
            ->latest('id')
            ->limit(self::LIST_LIMIT)
            ->get()
            ->map(fn (Operation $operation): array => [
                'id' => $operation->id,
                'operation_type' => $operation->operation_type,
                'product' => $operation->product?->name,
                'location' => $operation->location?->name,
                'quantity' => (float) $operation->quantity,
                'unit' => $operation->unit,
                'user' => $operation->user?->name,
                'operation_date' => $operation->operation_date->toIso8601String(),
            ])
            ->all();
    }

    /**
     * Stock lines that still hold quantity but sit below their batch's minimum quantity.
     *
     * Mirrors StockOperationService::setStockStatus(), which compares against the batch
     * minimum; stock lines without a batch fall back to their own minimum.
     *
     * @return Builder<Stock>
     */
    private function lowStockQuery(): Builder
    {
        return Stock::query()
            ->select('stocks.*')
            ->leftJoin('batches', 'batches.id', '=', 'stocks.batch_id')
            ->where('stocks.quantity', '>', 0)
            ->whereRaw('stocks.quantity < '.self::MINIMUM_QUANTITY_SQL);
    }

    /**
     * Batches with stock on hand that expire within the expiry window, including already expired ones.
     *
     * @return Builder<Batch>
     */
    private function expiringBatchesQuery(): Builder
    {
        return Batch::query()
            ->whereNotNull('expiry_date')
            ->whereDate('expiry_date', '<=', today()->addDays(self::EXPIRY_WINDOW_DAYS))
            ->whereHas('stocks', fn (Builder $query) => $query->where('quantity', '>', 0));
    }

    /**
     * Open purchase orders whose expected delivery date has passed.
     *
     * @return Builder<PurchaseOrder>
     */
    private function overduePurchaseOrdersQuery(): Builder
    {
        return PurchaseOrder::query()
            ->whereIn('status', self::OPEN_PURCHASE_ORDER_STATUSES)
            ->whereDate('expected_delivery_date', '<', today());
    }
}
