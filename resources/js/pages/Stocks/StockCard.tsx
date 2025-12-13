import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/stocks/stock-card/columns';
import { DataTable } from '@/components/stocks/stock-card/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Download, ExternalLink } from 'lucide-react';

export default function StockCard({
    stock,
    operations,
    total_locations,
    total_stock_quantity_across_locations,
    opening_balance,
}: {
    stock: any;
    operations: any[];
    total_locations: number;
    total_stock_quantity_across_locations: number;
    opening_balance: number;
}) {
    // console.log({ stock, operations, total_stock_quantity_across_locations });
    return (
        <AppLayout>
            <Head title="Stock Card" />
            <ContainerLayout>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Stock Card | {stock.batch?.batch_number}</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Detailed information about the stock item.</p>
                    </div>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <a href={route('stocks.stock-card.export-pdf', { stock: stock.id, range: 'all' })}>All</a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={route('stocks.stock-card.export-pdf', { stock: stock.id, range: 'this_month' })}>Bulan Ini</a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={route('stocks.stock-card.export-pdf', { stock: stock.id, range: 'this_year' })}>Tahun Ini</a>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <a href={route('stocks.stock-card.export-pdf', { stock: stock.id, range: '30d' })}>30 Days</a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={route('stocks.stock-card.export-pdf', { stock: stock.id, range: '90d' })}>90 Days</a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={route('stocks.stock-card.export-pdf', { stock: stock.id, range: '180d' })}>180 Days</a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={route('stocks.stock-card.export-pdf', { stock: stock.id, range: '1y' })}>1 Year</a>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {/* Stock details and operations would be rendered here */}
                </div>

                <div className="mb-6 grid gap-1 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Nama Product</CardTitle>
                        </CardHeader>
                        <CardContent className="text-lg font-bold">
                            {stock.product?.name}
                            <Button variant="link" asChild>
                                <Link href={route('products.show', { id: stock.product_id })} className="flex items-center gap-2">
                                    <ExternalLink className="ml-2 inline-block h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">No. Batch</CardTitle>
                        </CardHeader>
                        <CardContent className="text-lg font-bold">{stock.batch?.batch_number}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Lokasi</CardTitle>
                        </CardHeader>
                        <CardContent className="text-lg font-bold">{total_locations} Locations</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier</CardTitle>
                        </CardHeader>
                        <CardContent className="text-lg font-bold">
                            {stock.batch?.supplier?.partner?.name}
                            <Button variant="link" asChild>
                                <Link href={route('supplier.show', { id: stock.batch?.supplier_id })} className="flex items-center gap-2">
                                    <ExternalLink className="ml-2 inline-block h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div>
                                <CardTitle className="text-end text-lg">Total Quantity</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-center md:justify-end">
                            <div className="flex items-center justify-between">
                                <p className="text-primary text-2xl font-medium">{`${total_stock_quantity_across_locations} ${stock.unit}`}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-border border-t pt-4">
                            <div className="w-full">
                                <div className="flex items-center justify-between">
                                    <CardDescription className="text-muted-foreground text-sm">Opening Balance</CardDescription>
                                    <p className="text-muted-foreground text-sm">{`${opening_balance} ${stock.unit}`}</p>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    {/*<h2 className="mb-4 text-xl font-semibold">Operations</h2>*/}
                    <DataTable columns={columns} data={operations} clientSide={true} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
