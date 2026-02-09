import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PurchaseOrder } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`PO - ${purchaseOrder.po_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant={'link'} asChild>
                            <Link href={route('purchase-orders.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Purchase Orders
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">PO - {purchaseOrder.po_number}</h1>
                        <p className="text-muted-foreground text-sm">Details for purchase order {purchaseOrder.po_number}.</p>
                    </div>
                    {purchaseOrder.status !== 'received' && (
                        <Button asChild>
                            <Link href={route('purchase-orders.receive', purchaseOrder.id)}>Receive Items</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Order Details</CardTitle>
                        <CardDescription>Information about the purchase order.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold">PO Number:</p>
                            <p>{purchaseOrder.po_number}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Supplier:</p>
                            <p>{purchaseOrder.supplier?.partner?.name}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Warehouse:</p>
                            <p>{purchaseOrder.warehouse?.name}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Order Date:</p>
                            <p>{new Date(purchaseOrder.order_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Expected Delivery Date:</p>
                            <p>
                                {purchaseOrder.expected_delivery_date ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold">Status:</p>
                            <p className="capitalize">{purchaseOrder.status}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="font-semibold">Notes:</p>
                            <p>{purchaseOrder.notes || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity Ordered</TableHead>
                                    <TableHead>Quantity Received</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrder.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.product?.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.quantity_received}</TableCell>
                                        <TableCell>{item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                        <TableCell>
                                            {(item.quantity * item.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={4} className="text-right font-bold">
                                        Total
                                    </TableCell>
                                    <TableCell>
                                        {purchaseOrder.items
                                            ?.reduce((acc, item) => acc + item.quantity * item.price, 0)
                                            .toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
