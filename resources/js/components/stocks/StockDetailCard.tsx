import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Status } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { Hash, MapPin, Package, Truck, Warehouse } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export default function StockDetailCard({
    batch_number,
    product_id,
    product_name,
    warehouse_name,
    location_name,
    supplier_name,
    quantity,
    unit,
    status,
    minimum_quantity,
}: {
    batch_number: string | undefined;
    product_id: number | undefined;
    product_name: string | undefined;
    warehouse_name: string | undefined;
    location_name: string | undefined;
    supplier_name: string | undefined;
    quantity: number | undefined;
    unit: string | undefined;
    status: Status | undefined;
    minimum_quantity: number | undefined;
}) {
    const getStatusBadge = () => {
        switch (status) {
            case 'out_of_stock':
                return (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                        Expired
                    </Badge>
                );
            case 'low_stock':
                return <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>;
            case 'reserved':
                return <Badge className="bg-yellow-100 text-yellow-800">Reserved</Badge>;
            default:
                return <Badge className="bg-green-100 text-green-800">Available</Badge>;
        }
    };
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle>Detail Stok</CardTitle>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                            <Hash className="text-primary h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <CardDescription className="text-muted-foreground text-sm">No. Batch</CardDescription>
                            <p className="font-medium">{batch_number}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                            <Package className="text-primary h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <CardDescription className="text-muted-foreground text-sm">Nama Product</CardDescription>
                            <Button variant="link" className="p-0 font-medium" asChild>
                                <Link href={route('products.show', { id: product_id })}>{product_name}</Link>
                            </Button>
                        </div>
                    </div>
                    <Separator className="md:col-span-2" />
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                            <Warehouse className="text-primary h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <CardDescription className="text-muted-foreground text-sm">Gudang</CardDescription>
                            <p className="font-medium">{warehouse_name}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                            <MapPin className="text-primary h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <CardDescription className="text-muted-foreground text-sm">Lokasi</CardDescription>
                            <p className="font-medium">{location_name}</p>
                        </div>
                    </div>
                    <Separator className="md:col-span-2" />
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                            <Truck className="text-primary h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <CardDescription className="text-muted-foreground text-sm">Supplier</CardDescription>
                            <p className="font-medium">{supplier_name}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-border border-t pt-4">
                <div className="w-full">
                    <div className="flex items-center justify-between">
                        <CardDescription className="text-muted-foreground text-sm">Quantity</CardDescription>
                        <p className="text-primary text-2xl font-medium">{`${quantity} ${unit}`}</p>
                    </div>
                    <Separator className="my-3" />
                    <div className="mt-2 flex items-center justify-between">
                        <CardDescription className="text-muted-foreground text-sm">Minimum Quantity</CardDescription>
                        <p className="text-muted-foreground text-sm">{`${minimum_quantity} ${unit}`}</p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
