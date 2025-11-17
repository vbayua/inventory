import ContainerLayout from '@/components/container-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Supplier {
    id?: string;
    name?: string;
    pivot?: {
        price?: string;
    };
}
interface Product {
    id: number;
    name: string;
    brand_name?: string;
    scientific_name?: string;
    sku: string;
    unit: string;
    price: number;
}
export default function Show({ product, suppliers, total_stock_qty }: { product: Product; suppliers: Supplier[]; total_stock_qty: number }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Product',
            href: '/products',
        },
        {
            title: `${product.name}`,
            href: `/products/${product.id}`,
        },
    ];

    const deleteProduct = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            // Call the delete API endpoint
            router.delete(`/products/${id}`, {
                onSuccess: () => {
                    toast.success('Product deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete product');
                },
            });
        }
    };

    const getStockBadge = (status: string) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            out_of_stock: 'bg-red-100 text-red-800',
        };

        return colors[status as keyof typeof colors] || colors['available'];
    };
    const stockStatus = total_stock_qty > 0 ? 'available' : 'out_of_stock';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${product?.name}`} />
            <ContainerLayout>
                <div className="p-4">
                    <h2 className="mb-2.5 text-3xl font-semibold">{product.name}</h2>
                    <p className="text-muted-foreground text-sm">SKU: {product.sku}</p>
                    <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="grid grid-cols-2">
                                <CardTitle className="text-lg font-semibold">Stock</CardTitle>
                                <div data-slot="card-action" className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                                    <Button variant={'ghost'} size={'sm'} asChild>
                                        <Link href={route('stocks.index')}>
                                            View
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-foreground text-2xl font-medium">{total_stock_qty.toString()}</h3>
                            </CardContent>
                            <CardFooter className="space-x-2">
                                <span className="text-foreground text-light text-sm">Status:</span>
                                <Badge variant={'secondary'} className={getStockBadge(stockStatus)}>
                                    {stockStatus === 'available' ? 'Available' : 'Out Of Stock'}
                                </Badge>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Unit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-foreground text-2xl font-medium">{product.unit}</h3>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="text-xl">Supplier</CardTitle>
                            <CardDescription>A list of {product.name} suppliers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">Supplier Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {suppliers.length > 0 ? (
                                            suppliers.map((supplier: any) => (
                                                <TableRow key={supplier.id}>
                                                    <TableCell className="text-md font-medium">{supplier.partner?.name}</TableCell>
                                                    <TableCell>{supplier.pivot.price ?? '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={route('supplier.show', supplier.id)}>
                                                            <Button variant={'ghost'} size={'sm'} className="hover:cursor-pointer">
                                                                View
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center">
                                                    No Results.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
