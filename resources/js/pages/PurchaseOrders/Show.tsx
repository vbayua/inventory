import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PurchaseOrder } from '@/types/resources';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, File, Mail, MapPin, PencilIcon, PhoneCall, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
    },
    {
        title: 'Details',
        href: '',
    },
];

export default function Show({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) {
    breadcrumbs[1].href = `/purchase-orders/${purchaseOrder.id}`;

    console.log(purchaseOrder);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`PO - ${purchaseOrder.po_number}`} />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button variant={'link'} asChild>
                                <Link href={route('purchase-orders.index')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Purchase Orders
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-col justify-between md:flex-row">
                            <div>
                                <CardTitle>Purchase Order Details</CardTitle>
                                <CardDescription>Detail information about the purchase order.</CardDescription>
                            </div>
                            <div className="mt-4 flex items-center space-x-2 md:mt-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Actions
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {/*<DropdownMenuLabel>Order Action</DropdownMenuLabel>*/}
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem asChild>
                                                <Link href={route('purchase-orders.edit', purchaseOrder.id)}>
                                                    <PencilIcon className="mr-2 h-4 w-4" />
                                                    Edit Order
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={route('purchase-orders.receive', { id: purchaseOrder.id })}>
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Create Receive Order
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <a href={route('purchase-orders.show', purchaseOrder.id)} target="_blank" rel="noopener noreferrer">
                                                    <File className="mr-2 h-4 w-4" />
                                                    Export as PDF
                                                </a>
                                            </DropdownMenuItem>
                                            {/* Add more actions here if needed */}
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem variant={'destructive'}>Cancel Order</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">PO Number</p>
                                    <p className="text-lg font-medium">{purchaseOrder.po_number}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Order Date</p>
                                    <p className="text-lg font-medium">{new Date(purchaseOrder.order_date).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Expected Delivery Date</p>
                                    <p className="text-lg font-medium">
                                        {purchaseOrder.expected_delivery_date
                                            ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('id-ID')
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Status</p>
                                    <p className={`text-lg font-medium capitalize`}>{purchaseOrder.status}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead>Quantity Ordered</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchaseOrder.items?.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {item.product?.name} <span className="text-muted-foreground">({item.product?.sku})</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {Number(item.price).toLocaleString('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    })}
                                                </TableCell>
                                                <TableCell>x {item.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    {(item.quantity * item.price).toLocaleString('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-2xl font-semibold max-md:py-6 md:text-right">
                                                Total{' '}
                                                <span className="md:hidden">
                                                    {purchaseOrder.items
                                                        ?.reduce((acc, item) => acc + item.quantity * item.price, 0)
                                                        .toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-6 text-2xl font-semibold max-md:hidden">
                                                {purchaseOrder.items
                                                    ?.reduce((acc, item) => acc + item.quantity * item.price, 0)
                                                    .toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">Name</p>
                                            <p className="text-lg font-medium">{purchaseOrder.supplier?.partner?.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <PhoneCall className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">Phone Number</p>
                                            <p className="text-lg font-medium">{purchaseOrder.supplier?.partner?.phone_number || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Mail className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">Email</p>
                                            <p className="text-lg font-medium">{purchaseOrder.supplier?.partner?.email || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">Address</p>
                                            <p className="text-lg font-medium">{purchaseOrder.supplier?.address || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {purchaseOrder.notes ? (
                                        <p className="text-lg font-medium">{purchaseOrder.notes}</p>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No additional notes.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Audit</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-muted-foreground text-sm">Created By</p>
                                            <p className="text-lg font-medium">{purchaseOrder.created_by?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Last Updated</p>
                                            <p className="text-lg font-medium">{new Date(purchaseOrder.updated_at).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Created At</p>
                                            <p className="text-lg font-medium">{new Date(purchaseOrder.created_at).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
