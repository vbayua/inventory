import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
export default function StockStatus({
    stats,
}: {
    stats: {
        total_items: number;
        total_locations: number;
        available_stocks: number;
        low_stock_stocks: number;
        out_of_stock_stocks: number;
    };
}) {
    // console.log('stats', stats);
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Jumlah Item Stok</CardTitle>
                    <Package className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.total_items}</div>
                    <p className="text-muted-foreground mt-2 text-xs"> Dari {stats.total_locations} locations</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Available Stock</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.available_stocks}</div>
                    <p className="text-muted-foreground mt-2 text-xs">Items available</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Low Stock</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.low_stock_stocks}</div>
                    <p className="text-muted-foreground mt-2 text-xs">Need restocking</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Out of Stock</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.out_of_stock_stocks}</div>
                    <p className="text-muted-foreground mt-2 text-xs">Urgent attention needed</p>
                </CardContent>
            </Card>
        </div>
    );
}
