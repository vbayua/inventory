import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
export default function StockStatus({ stats }: {
    stats: {
        total_items: number;
        total_locations: number;
        available_stocks: number;
        low_stock_stocks: number;
        out_of_stock_stocks: number;
    }
}) {
    // console.log('stats', stats);
    return (
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
                    <div className="text-3xl font-bold">{stats.available_stocks}</div>
                    <p className="text-xs text-muted-foreground mt-2">Items available</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Low Stock</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.low_stock_stocks}</div>
                    <p className="text-xs text-muted-foreground mt-2">Need restocking</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Out of Stock</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.out_of_stock_stocks}</div>
                    <p className="text-xs text-muted-foreground mt-2">Urgent attention needed</p>
                </CardContent>
            </Card>
        </div>
    )
}
