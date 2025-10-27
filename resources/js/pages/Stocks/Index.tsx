import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/stocks/columns';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, Cog, Database, Package, PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/stocks/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import StockStatus from '@/components/stocks/stock-status';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stocks',
        href: '/stocks',
    },
];

export default function Index({ stocks, stats }: { stocks: any[], stats: { total_items: number; total_locations: number } }) {
    console.log('stocks', stocks);
    const availableStocks = stocks.filter(stock => stock.status === 'available').length;
    const lowStockStocks = stocks.filter(stock => stock.status === 'low_stock').length;
    const outOfStockStocks = stocks.filter(stock => stock.status === 'out_of_stock').length;
    const stockStatus = {
        total_items: stats.total_items,
        total_locations: stats.total_locations,
        available_stocks: availableStocks,
        low_stock_stocks: lowStockStocks,
        out_of_stock_stocks: outOfStockStocks,
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Operation List" />
            <div className={'py-12'}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <StockStatus stats={stockStatus} />
                    <div className={'flex items-center justify-between mt-6'}>
                        <Link className={buttonVariants({ variant: 'default' })} href={`/operations/create`}>
                            <PlusIcon className='w-4 h-4 mr-2' />
                            New Stock Operation
                        </Link>
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/operations`}>
                            <Database className='w-4 h-4 mr-2' />
                            Stock Operations
                        </Link>
                    </div>
                    <DataTable columns={columns} data={stocks} clientSide={true} />
                </div>
            </div>
        </AppLayout>
    );
}
