import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Hash, MapPin, Package, Warehouse } from 'lucide-react';


export default function StockDetailCard({
    batch_number,
    product_name,
    warehouse_name,
    location_name,
    quantity,
    unit,
    status
}: {
    batch_number: string,
    product_name: string,
    warehouse_name: string,
    location_name: string,
    quantity: number,
    unit: string,
    status: "available" | "out_of_stock" | "reserved" | "low_stock",
}) {
    const getStatusBadge = () => {
        switch (status) {
            case "out_of_stock":
                return <Badge variant="destructive" className='bg-red-100 text-red-800'>Expired</Badge>;
            case "low_stock":
                return <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>;
            case "reserved":
                return <Badge className="bg-yellow-100 text-yellow-800">Reserved</Badge>;
            default:
                return <Badge className="bg-green-100 text-green-800">Available</Badge>;
        }
    };
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle>Stock Details</CardTitle>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className='flex items-start gap-3'>
                        <div className='p-2 rounded-lg bg-primary/10'>
                            <Hash className="h-6 w-6 text-primary" />
                        </div>
                        <div className='flex-1'>
                            <CardDescription className="text-sm text-muted-foreground">Batch Number</CardDescription>
                            <p className="font-medium">{batch_number}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-3'>
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className='flex-1'>
                            <CardDescription className="text-sm text-muted-foreground">Product Name</CardDescription>
                            <p className="font-medium">{product_name}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-3'>
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Warehouse className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardDescription className="text-sm text-muted-foreground">Warehouse</CardDescription>
                            <p className="font-medium">{warehouse_name}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-3'>
                        <div className="p-2 rounded-lg bg-primary/10">
                            <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardDescription className="text-sm text-muted-foreground">Location</CardDescription>
                            <p className="font-medium">{location_name}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className='pt-4 border-t border-border'>
                <div className='w-full'>
                    <div className='flex items-center justify-between'>
                        <CardDescription className="text-sm text-muted-foreground">Current Quantity</CardDescription>
                        <p className="font-medium text-2xl text-primary">{`${quantity} ${unit}`}</p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
