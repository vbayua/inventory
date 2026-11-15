import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';

export function StockStatusSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="mt-2 h-3 w-24" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function StockStatus({
    total_items,
    total_locations,
    available_stocks,
    low_stocks,
    out_of_stock,
}: {
    total_items: number;
    total_locations: number;
    available_stocks: number;
    low_stocks: number;
    out_of_stock: number;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Jumlah Item Stok</CardTitle>
                    <Package className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{total_items}</div>
                    <p className="text-muted-foreground mt-2 text-xs"> Dari {total_locations} locations</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Available Stock</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{available_stocks}</div>
                    <p className="text-muted-foreground mt-2 text-xs">Items available</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Low Stock</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{low_stocks}</div>
                    <p className="text-muted-foreground mt-2 text-xs">Need restocking</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium">Out of Stock</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{out_of_stock}</div>
                    <p className="text-muted-foreground mt-2 text-xs">Urgent attention needed</p>
                </CardContent>
            </Card>
        </div>
    );
}
