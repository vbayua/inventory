import ContainerLayout from '@/components/container-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, Mail, MapPin, Package, Phone, PhoneIcon } from 'lucide-react';
import { toast } from 'sonner';


interface Product {
    id?: number;
    name?: string;
    sku?: string;
    unit?: string;
    categories?: {
        name?: string;
        slug?: string;
    };
    status?: string;
    pivot?: {
        price?: number;
    }
}
interface Supplier {
    id: number;
    name?: string;
    phone_number?: string;
    email?: string;
    contact_person?: string;
    address?: string;
    notes?: string;
}
export default function Show({ supplier, products, totalProducts }: {
    supplier: Supplier,
    products: Product[],
    totalProducts: number,
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Suppliers',
            href: '/suppliers',
        },
        {
            title: `${supplier.name}`,
            href: `/supplier/${supplier.id}`,
        }
    ];

    const deleteSupplier = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('supplier.destroy', { id }))
            toast.success('Supplier deleted successfuly')
        }
    }

    const getStockBadge = (status: string) => {
        const colors = {
            "available": "bg-green-100 text-green-800",
            "out_of_stock": 'bg-red-100 text-red-800',
        }

        return colors[status as keyof typeof colors] || colors["available"];
    }
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
    }
    const total_stock_qty = 0;
    const stockStatus = total_stock_qty > 0 ? "available" : "out_of_stock";
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${supplier?.name}`} />
            <ContainerLayout>
                <div>
                    {/* <h2 className="text-3xl font-semibold mb-2.5">{supplier.name}</h2>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                    <div className="grid grid-cols-2 gap-4 mt-4"></div> */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle>
                                    <h2 className="text-3xl font-semibold mb-2.5">{supplier.name}</h2>
                                </CardTitle>
                                <Badge variant={"secondary"} className='text-base px-4 py-2'>
                                    <Package className="mr-2 h-4 w-4" />
                                    {totalProducts.toString()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <Mail className='h-5 w-5 text-primary mt-0.5' />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                                        <a href={supplier.email ? `mailto:${supplier.email}` : "#"} className="text-foreground hover:text-primary transition-colors">
                                            {supplier.email ?? "-"}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className='h-5 w-5 text-primary mt-0.5' />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                                        <a href={supplier.phone_number ? `tel:${supplier.email}` : "#"} className="text-foreground hover:text-primary transition-colors">
                                            {supplier.phone_number ?? "-"}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className='h-5 w-5 text-primary mt-0.5' />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Address</p>
                                        <p className="text-foreground">
                                            {supplier.address ?? "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    {/* Products Table */}
                    <Card>
                        <CardHeader >
                            <CardTitle>Products from {supplier.name}</CardTitle>
                            <CardDescription>View and manage all products supplied by this vendor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="h-14">
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products ? products?.map((product) => (
                                            <TableRow key={product.id} className="h-16">
                                                <TableCell>
                                                    {product.name}
                                                </TableCell>
                                                <TableCell className="">{product.sku}</TableCell>
                                                <TableCell>
                                                    <Link href={route('products.index', {
                                                        category: product.categories?.slug
                                                    })}>
                                                        <Badge variant="outline">{product.categories?.name}</Badge>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(product.pivot?.price ? formatPrice(product.pivot.price) : 0)} / {product.unit}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={'secondary'} className={getStockBadge(stockStatus)}>
                                                        {stockStatus === "available" ? "Available" : "Out Of Stock"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <Link href={route('products.show', product.id)}>
                                                        <Button variant={'ghost'} size={'sm'} className='hover:cursor-pointer'>
                                                            View
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )) :
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    No Results.
                                                </TableCell>
                                            </TableRow>
                                        }
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
