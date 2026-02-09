import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PurchaseOrder } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
    },
    {
        title: 'Receive Items',
        href: '',
    },
];

export default function Receive({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) {
    breadcrumbs[1].href = `/purchase-orders/${purchaseOrder.id}/receive`;

    const { data, setData, post, processing, errors } = useForm({
        items:
            purchaseOrder.items?.map((item) => ({
                purchase_order_item_id: item.id,
                quantity_received: 0,
            })) || [],
    });

    const receiveItemsHandler: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('purchase-orders.receive.store', purchaseOrder.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Receive Items for PO - ${purchaseOrder.po_number}`} />

            <div className="space-y-6">
                <div className="mb-4">
                    <Button variant={'link'} asChild>
                        <Link href={route('purchase-orders.show', purchaseOrder.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Purchase Order Details
                        </Link>
                    </Button>
                </div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Receive Items for PO - {purchaseOrder.po_number}</h1>
                </div>

                <form onSubmit={receiveItemsHandler}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Receive Items</CardTitle>
                            <CardDescription>Enter the quantity of items received.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity Ordered</TableHead>
                                        <TableHead>Quantity Already Received</TableHead>
                                        <TableHead>Quantity to Receive</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchaseOrder.items?.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product?.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.quantity_received}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity - item.quantity_received}
                                                    value={data.items[index]?.quantity_received}
                                                    onChange={(e) => {
                                                        const newItems = [...data.items];
                                                        newItems[index].quantity_received = parseInt(e.target.value);
                                                        setData('items', newItems);
                                                    }}
                                                />
                                                <InputError message={errors[`items.${index}.quantity_received`]} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end">
                        <Button disabled={processing}>Receive Items</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
