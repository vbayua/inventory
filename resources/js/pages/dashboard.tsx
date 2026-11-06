import ActionList from '@/components/dashboard/action-list';
import RecentActivity from '@/components/dashboard/recent-activity';
import StatTiles from '@/components/dashboard/stat-tiles';
import StockByWarehouseChart from '@/components/dashboard/stock-by-warehouse-chart';
import StockMovementChart, { StockMovementChartSkeleton } from '@/components/dashboard/stock-movement-chart';
import TopMoversChart from '@/components/dashboard/top-movers-chart';
import {
    type DashboardStats,
    type ExpiringBatch,
    type LowStockItem,
    type OverduePurchaseOrder,
    type PendingInspection,
    type RecentOperation,
    type StockMovement,
    type TopMover,
    type WarehouseStock,
} from '@/components/dashboard/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type DashboardProps = {
    stats: DashboardStats;
    stockByWarehouse: WarehouseStock[];
    stockMovements?: StockMovement[];
    topMovers: TopMover[];
    lowStock: LowStockItem[];
    expiringBatches: ExpiringBatch[];
    pendingInspections: PendingInspection[];
    overduePurchaseOrders: OverduePurchaseOrder[];
    recentOperations: RecentOperation[];
};

export default function Dashboard({
    stats,
    stockByWarehouse,
    stockMovements,
    topMovers,
    lowStock,
    expiringBatches,
    pendingInspections,
    overduePurchaseOrders,
    recentOperations,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <StatTiles stats={stats} />

                <Deferred data="stockMovements" fallback={<StockMovementChartSkeleton />}>
                    <StockMovementChart movements={stockMovements ?? []} />
                </Deferred>

                <div className="grid gap-4 lg:grid-cols-2">
                    <StockByWarehouseChart warehouses={stockByWarehouse} />
                    <TopMoversChart movers={topMovers} />
                </div>

                <div className="grid gap-4 lg:grid-cols-5">
                    <div className="min-w-0 lg:col-span-3">
                        <ActionList
                            lowStock={lowStock}
                            lowStockTotal={stats.low_stock}
                            expiringBatches={expiringBatches}
                            expiringBatchesTotal={stats.expiring_batches + stats.expired_batches}
                            pendingInspections={pendingInspections}
                            pendingInspectionsTotal={stats.pending_inspections}
                            overduePurchaseOrders={overduePurchaseOrders}
                            overduePurchaseOrdersTotal={stats.overdue_purchase_orders}
                        />
                    </div>
                    <div className="min-w-0 lg:col-span-2">
                        <RecentActivity operations={recentOperations} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
