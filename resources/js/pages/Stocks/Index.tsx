import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/stocks/columns';
import { DataTable } from '@/components/stocks/data-table';
import StockStatus from '@/components/stocks/stock-status';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Stock } from '@/types/resources';
import { Head } from '@inertiajs/react';

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Stock" />
            <ContainerLayout>
                <StockStatus stats={stockStatus} />
                <div className="my-4">
                    <DataTable columns={columns} data={stocks} clientSide={true} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
