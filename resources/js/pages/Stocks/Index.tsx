import ContainerLayout from '@/components/container-layout';
import { DataTableViewOptions } from '@/components/data-table-view-options';
import { columns } from '@/components/stocks/columns';
import { DataTable } from '@/components/stocks/data-table';
import StockStatus, { StockStatusSkeleton } from '@/components/stocks/stock-status';
import StockTableSkeleton from '@/components/stocks/stock-table-skeleton';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Stock } from '@/types/resources';
import { Deferred, Head, router } from '@inertiajs/react';
import { useReactTable } from '@tanstack/react-table';
import { Database, ListChecksIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stocks',
        href: '/stocks',
    },
];

const stockStatusProps = ['total_items', 'total_locations', 'available_stocks', 'low_stocks', 'out_of_stock'];

type StockProps = {
    stocks?: Stock[];
    available_stocks?: number;
    low_stocks?: number;
    out_of_stock?: number;
    total_items?: number;
    total_locations?: number;
}
export default function Index(
    {
        stocks,
        available_stocks,
        low_stocks,
        out_of_stock,
        total_items,
        total_locations,
    }: StockProps) {
    const [hideStatus, setHideStatus] = useState(true);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Stock" />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="flex justify-between">
                        <ButtonGroup>
                            <Button variant="outline" className="px-4 py-2 hover:cursor-pointer" onClick={() => setHideStatus(!hideStatus)}>
                                <ListChecksIcon className="mr-2 h-4 w-4" />
                                {hideStatus ? 'Show' : 'Hide'} Status
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button variant="default" className="px-4 py-2 hover:cursor-pointer" onClick={() => {
                                router.visit(route('operations.create'))
                            }}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Buat Operasi Stock
                            </Button>
                            <Button variant="outline" className="px-4 py-2 hover:cursor-pointer" onClick={() => {
                                router.visit(route('operations.index'))
                            }}>
                                <Database className="mr-2 h-4 w-4" />
                                Mutasi Stok
                            </Button>
                        </ButtonGroup>
                    </div>
                    {!hideStatus && (
                        <Deferred data={stockStatusProps} fallback={<StockStatusSkeleton />}>
                            <StockStatus
                                total_items={total_items ?? 0}
                                total_locations={total_locations ?? 0}
                                available_stocks={available_stocks ?? 0}
                                low_stocks={low_stocks ?? 0}
                                out_of_stock={out_of_stock ?? 0}
                            />
                        </Deferred>
                    )}
                </div>
                <div className="my-4">
                    <Deferred data="stocks" fallback={<StockTableSkeleton />} rescue={({ reloading }) => {
                        return (
                            <div className="my-4">
                                <p>{reloading ? 'Loading...' : 'Failed to load stocks'}</p>
                                <Button type="button" disabled={reloading} onClick={() => router.reload()}>Retry</Button>
                            </div>
                        )
                    }}>
                    <DataTable columns={columns} data={stocks ?? []} clientSide={true} onRowClick={(row) => {
                        router.visit(route('stocks.show', { id: row.id }))
                    }} />
                    </Deferred>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
