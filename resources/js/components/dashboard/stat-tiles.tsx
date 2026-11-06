import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CalendarClock, ClipboardList, Package } from 'lucide-react';
import { type ReactNode } from 'react';
import { type DashboardStats } from './types';

function StatTile({ title, value, detail, icon }: { title: string; value: number; detail: ReactNode; icon: ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tabular-nums">{value}</div>
                <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
            </CardContent>
        </Card>
    );
}

export default function StatTiles({ stats }: { stats: DashboardStats }) {
    const pendingWork = stats.open_purchase_orders + stats.pending_inspections + stats.active_production_orders;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatTile
                title="Products in stock"
                value={stats.products_in_stock}
                detail="Distinct products with quantity on hand"
                icon={<Package className="text-muted-foreground size-4" />}
            />
            <StatTile
                title="Low stock"
                value={stats.low_stock}
                detail={`${stats.out_of_stock} stock lines out of stock`}
                icon={<AlertTriangle className="text-muted-foreground size-4" />}
            />
            <StatTile
                title="Expiring in 30 days"
                value={stats.expiring_batches}
                detail={`${stats.expired_batches} batches already expired`}
                icon={<CalendarClock className="text-muted-foreground size-4" />}
            />
            <StatTile
                title="Pending work"
                value={pendingWork}
                detail={`${stats.open_purchase_orders} open POs · ${stats.pending_inspections} QC · ${stats.active_production_orders} production`}
                icon={<ClipboardList className="text-muted-foreground size-4" />}
            />
        </div>
    );
}

export function StatTilesSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="size-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="mt-2 h-3 w-40" />
                    </CardContent>
                </Card>
            ))}
            <span className="sr-only">Loading summary…</span>
        </div>
    );
}
