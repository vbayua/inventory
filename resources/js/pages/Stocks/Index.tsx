import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/stocks/columns';
import { DataTable } from '@/components/stocks/data-table';
import StockStatus from '@/components/stocks/stock-status';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ChevronDown, Database, PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stocks',
        href: '/stocks',
    },
];

export default function Index({ stocks, stats }: { stocks: any[]; stats: { total_items: number; total_locations: number } }) {
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
                <div className={'mt-6 flex items-center justify-start'}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" className="px-4 py-2 hover:cursor-pointer">
                                Actions
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="space-y-2 p-2">
                            <DropdownMenuLabel>Operasi Stock</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="hover:cursor-pointer" asChild>
                                <Link href={route('operations.create')}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Buat Operasi Stock
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:cursor-pointer" asChild>
                                <Link href={route('operations.index')}>
                                    <Database className="mr-2 h-4 w-4" />
                                    Log Operasi Stock
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="my-4">
                    <DataTable columns={columns} data={stocks} clientSide={true} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
