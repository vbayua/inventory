import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { ReceiveOrder, ReceiveOrderItem } from '@/types/resources';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Item({ receive_order, item }: { receive_order: ReceiveOrder; item: ReceiveOrderItem }) {
    console.log(item.purchase_order_item);
    return (
        <AppLayout>
            <Head title="RO - Item" />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button variant={'link'} asChild>
                                <Link href={route('receive-orders.show', { receive_order: receive_order.id })}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Receive Order
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Receive Order Item Details</CardTitle>
                                <span className="text-muted-foreground text-sm">{receive_order.receive_number}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity Received</TableHead>
                                        <TableHead>Received Date</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {item.purchase_order_item?.product && (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.purchase_order_item?.product?.name}</TableCell>
                                            <TableCell>{item.quantity_received}</TableCell>
                                            <TableCell>{new Date(item.created_at ?? '').toLocaleDateString()}</TableCell>
                                            <TableCell>{item.location?.name}</TableCell>
                                            <TableCell>{item.notes ?? '-'}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
