import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/stocks/details/columns';
import { DataTable } from '@/components/stocks/details/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function StockCard({
    stock,
    operations,
    total_locations,
    total_stock_quantity_across_locations,
}: {
    stock: any;
    operations: any[];
    total_locations: number;
    total_stock_quantity_across_locations: number;
}) {
    console.log({ stock, operations, total_stock_quantity_across_locations });
    return (
        <AppLayout>
            <Head title="Stock Card" />
            <ContainerLayout>
                <div>
                    <h1 className="mb-4 text-2xl font-bold">Stock Card | {stock.batch?.batch_number}</h1>
                    <p className="text-muted-foreground mb-6 text-sm">Detailed information about the stock item.</p>
                    {/* Stock details and operations would be rendered here */}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Locations</CardTitle>
                        </CardHeader>
                        <CardContent className="text-lg font-bold">{total_locations} Locations</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Total Quantity</CardTitle>
                        </CardHeader>
                        <CardContent className="text-lg font-bold">
                            {total_stock_quantity_across_locations} {stock.unit}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Operations</h2>
                    <DataTable columns={columns} data={operations} clientSide={true} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
