import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/stocks/columns';
import { Head } from '@inertiajs/react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
import { DataTable } from '@/components/stocks/data-table';
import { Button } from '@/components/ui/button';



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stocks',
        href: '/stocks',
    },
];

export default function Index({ stocks, stats }: { stocks: any[], stats: { total_items: number; total_locations: number } }) {
    // console.log('stocks', stocks);
    const availableStocks = stocks.filter(stock => stock.status === 'available').length;
    const lowStockStocks = stocks.filter(stock => stock.status === 'low_stock').length;
    const outOfStockStocks = stocks.filter(stock => stock.status === 'out_of_stock').length;
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Operation List" />

            <div className={'py-12'}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-md font-medium">Total Items</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.total_items}</div>
                                <p className="text-xs text-muted-foreground mt-2">Across {stats.total_locations} locations</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-md font-medium">Available Stock</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{availableStocks}</div>
                                <p className="text-xs text-muted-foreground mt-2">Items available</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-md font-medium">Low Stock</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{lowStockStocks}</div>
                                <p className="text-xs text-muted-foreground mt-2">Need restocking</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-md font-medium">Out of Stock</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{outOfStockStocks}</div>
                                <p className="text-xs text-muted-foreground mt-2">Urgent attention needed</p>
                            </CardContent>
                        </Card>
                    </div>
                    <DataTable columns={columns} data={stocks} clientSide={true} />
                </div>
            </div>
        </AppLayout>
    );
}
