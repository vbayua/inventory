import ContainerLayout from '@/components/container-layout';
import { DataTableViewOptions } from '@/components/data-table-view-options';
import { columns } from '@/components/stocks/columns';
import { DataTable } from '@/components/stocks/data-table';
import StockStatus from '@/components/stocks/stock-status';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Stock } from '@/types/resources';
import { Head, router } from '@inertiajs/react';
import { useReactTable } from '@tanstack/react-table';
import { Database, PlusIcon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stocks',
        href: '/stocks',
    },
];

export default function Index({ stocks, stats }: { stocks: Stock[]; stats: { total_items: number; total_locations: number } }) {
    const availableStocks = stocks.filter((stock) => stock.status === 'available').length;
    const lowStockStocks = stocks.filter((stock) => stock.status === 'low_stock').length;
    const outOfStockStocks = stocks.filter((stock) => stock.status === 'out_of_stock').length;
    const stockStatus = {
        total_items: stats.total_items,
        total_locations: stats.total_locations,
        available_stocks: availableStocks,
        low_stock_stocks: lowStockStocks,
        out_of_stock_stocks: outOfStockStocks,
    };
    const [hideStatus, setHideStatus] = useState(true);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Stock" />
            <ContainerLayout>
                <div className="space-y-6">
                    <ButtonGroup className="flex justify-between">
                        <ButtonGroup>
                            <Button variant="outline" className="px-4 py-2 hover:cursor-pointer" onClick={() => setHideStatus(!hideStatus)}>
                                <Database className="mr-2 h-4 w-4" />
                                {hideStatus ? 'Show' : 'Hide'} Status
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button variant="outline" className="px-4 py-2 hover:cursor-pointer" onClick={() => {
                                router.visit(route('operations.create'))
                            }}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Buat Operasi Stock
                            </Button>
                            <Button variant="outline" className="px-4 py-2 hover:cursor-pointer" onClick={() => {
                                router.visit(route('operations.index'))
                            }}>
                                <Database className="mr-2 h-4 w-4" />
                                Log Operasi Stock
                            </Button>
                        </ButtonGroup>
                    </ButtonGroup>
                    {!hideStatus && <StockStatus stats={stockStatus} />}
                </div>
                <div className="my-4">
                    <DataTable columns={columns} data={stocks} clientSide={true} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
