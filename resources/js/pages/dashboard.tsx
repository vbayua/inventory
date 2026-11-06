import ActionList, { ActionListSkeleton } from '@/components/dashboard/action-list';
import ChartCardSkeleton from '@/components/dashboard/chart-card-skeleton';
import RecentActivity, { RecentActivitySkeleton } from '@/components/dashboard/recent-activity';
import StatTiles, { StatTilesSkeleton } from '@/components/dashboard/stat-tiles';
import StockByWarehouseChart, { STOCK_BY_WAREHOUSE_DESCRIPTION, STOCK_BY_WAREHOUSE_TITLE } from '@/components/dashboard/stock-by-warehouse-chart';
import StockMovementChart, { STOCK_MOVEMENT_DESCRIPTION, STOCK_MOVEMENT_TITLE } from '@/components/dashboard/stock-movement-chart';
import TopMoversChart, { TOP_MOVERS_DESCRIPTION, TOP_MOVERS_TITLE } from '@/components/dashboard/top-movers-chart';
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

/**
 * Every prop is deferred by DashboardController, so each is undefined until its group loads.
 * Children of <Deferred> only render once the props they name have arrived.
 */
type DashboardProps = {
    stats?: DashboardStats;
    stockMovements?: StockMovement[];
    stockByWarehouse?: WarehouseStock[];
    topMovers?: TopMover[];
    lowStock?: LowStockItem[];
    expiringBatches?: ExpiringBatch[];
    pendingInspections?: PendingInspection[];
    overduePurchaseOrders?: OverduePurchaseOrder[];
    recentOperations?: RecentOperation[];
};

export default function Dashboard({
    stats,
    stockMovements,
    stockByWarehouse,
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
                <Deferred data="stats" fallback={<StatTilesSkeleton />}>
                    <StatTiles stats={stats!} />
                </Deferred>

                <Deferred
                    data="stockMovements"
                    fallback={<ChartCardSkeleton title={STOCK_MOVEMENT_TITLE} description={STOCK_MOVEMENT_DESCRIPTION} />}
                >
                    <StockMovementChart movements={stockMovements ?? []} />
                </Deferred>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Deferred
                        data="stockByWarehouse"
                        fallback={<ChartCardSkeleton title={STOCK_BY_WAREHOUSE_TITLE} description={STOCK_BY_WAREHOUSE_DESCRIPTION} />}
                    >
                        <StockByWarehouseChart warehouses={stockByWarehouse ?? []} />
                    </Deferred>
                    <Deferred data="topMovers" fallback={<ChartCardSkeleton title={TOP_MOVERS_TITLE} description={TOP_MOVERS_DESCRIPTION} />}>
                        <TopMoversChart movers={topMovers ?? []} />
                    </Deferred>
                </div>

                <div className="grid gap-4 lg:grid-cols-5">
                    <div className="min-w-0 lg:col-span-3">
                        <Deferred
                            data={['stats', 'lowStock', 'expiringBatches', 'pendingInspections', 'overduePurchaseOrders']}
                            fallback={<ActionListSkeleton />}
                        >
                            <ActionList
                                lowStock={lowStock ?? []}
                                lowStockTotal={stats?.low_stock ?? 0}
                                expiringBatches={expiringBatches ?? []}
                                expiringBatchesTotal={(stats?.expiring_batches ?? 0) + (stats?.expired_batches ?? 0)}
                                pendingInspections={pendingInspections ?? []}
                                pendingInspectionsTotal={stats?.pending_inspections ?? 0}
                                overduePurchaseOrders={overduePurchaseOrders ?? []}
                                overduePurchaseOrdersTotal={stats?.overdue_purchase_orders ?? 0}
                            />
                        </Deferred>
                    </div>
                    <div className="min-w-0 lg:col-span-2">
                        <Deferred data="recentOperations" fallback={<RecentActivitySkeleton />}>
                            <RecentActivity operations={recentOperations ?? []} />
                        </Deferred>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
