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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ReceiveOrder } from '@/types/resources';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, File, Link2Icon, Mail, MapPin, PenIcon, PhoneCall, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Receive Order',
        href: '/receive-orders',
    },
    {
        title: 'Details',
        href: '',
    },
];

export default function Show({ receiveOrder }: { receiveOrder: ReceiveOrder }) {
    breadcrumbs[1].href = `/receive-orders/${receiveOrder.id}`;

    // console.log(receiveOrder);
    // console.log(receiveOrder.receive_order_items);
    const receiveItems = receiveOrder.receive_order_items;

    const [receiveOrderNotes, setReceiveOrderNotes] = useState(receiveOrder.notes ?? '');
    const [editNoteOpen, setEditNoteOpen] = useState(false);

    const handleSetReceiveOrderNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReceiveOrderNotes(e.target.value);
    };

    const handleSaveReceiveOrderNotes = () => {
        if (receiveOrderNotes !== receiveOrder.notes) {
            router.put(
                route('receive-orders.update', receiveOrder.id),
                { notes: receiveOrderNotes },
                {
                    onSuccess: () => {
                        setEditNoteOpen(false);
                    },
                    onError: () => {
                        toast.error('Failed to save receive order notes.');
                    },
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`PO - ${receiveOrder.receive_number}`} />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button variant={'link'} asChild>
                                <Link href={route('receive-orders.index')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Receive Order
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-col justify-between md:flex-row">
                            <div>
                                <CardTitle>Receive Order Details</CardTitle>
                                <CardDescription>Detail information about the receive order.</CardDescription>
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
                                                <a href={route('receive-orders.show', receiveOrder.id)} target="_blank" rel="noopener noreferrer">
                                                    <File className="mr-2 h-4 w-4" />
                                                    Export as PDF
                                                </a>
                                            </DropdownMenuItem>
                                            {/* Add more actions here if needed */}
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        {/*<DropdownMenuGroup>
                                            <DropdownMenuItem variant={'destructive'}>Cancel Order</DropdownMenuItem>
                                        </DropdownMenuGroup>*/}
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
                                <div className="flex-1">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <span className="text-sm font-medium">Receive Number</span>
                                            <p className="mt-1 text-sm">{receiveOrder.receive_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Supplier</span>
                                            <p className="mt-1 text-sm">{receiveOrder.purchase_order?.supplier?.partner?.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Receive Date</span>
                                            <p className="mt-1 text-sm">{format(receiveOrder.receive_date, 'LLL dd, y')}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Purchase Order</span>
                                            <div className="mt-1 space-x-1 text-sm">
                                                <Link
                                                    href={route('purchase-orders.show', { purchase_order: receiveOrder.purchase_order_id })}
                                                    className="flex items-center hover:cursor-pointer hover:underline"
                                                >
                                                    <span className="mx-1">{receiveOrder.purchase_order?.po_number}</span>
                                                    <Link2Icon className="inline-block h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
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
                                            <TableHead className="text-right">Received Qty</TableHead>
                                            <TableHead>Location</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receiveItems?.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                onClick={() => {
                                                    router.get(route('receive-orders.item', { receive_order: receiveOrder.id, item: item.id }));
                                                }}
                                            >
                                                <TableCell>{item.purchase_order_item?.product?.name}</TableCell>
                                                <TableCell className="text-right">{item.quantity_received}</TableCell>
                                                <TableCell>{item.location?.name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Info Supplier</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">{receiveOrder.purchase_order?.supplier?.partner?.name}</p>
                                            {/*<p className="text-lg font-medium">{receiveOrder.supplier?.partner?.name}</p>*/}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <PhoneCall className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">
                                                {receiveOrder.purchase_order?.supplier?.phone_number ?? '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Mail className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">{receiveOrder.purchase_order?.supplier?.email ?? '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="mr-2 inline-block h-4 w-4" />
                                        <div>
                                            <p className="text-muted-foreground text-sm">{receiveOrder.purchase_order?.supplier?.address ?? '-'}</p>
                                            {/*<p className="text-lg font-medium">{receiveOrder.supplier?.address || '-'}</p>*/}
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
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Notes</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setEditNoteOpen(!editNoteOpen)}>
                                            <PenIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4" hidden={editNoteOpen}>
                                        {receiveOrder.notes ?? '-'}
                                    </p>
                                    <div className="">
                                        <Textarea
                                            className="w-full"
                                            placeholder="Enter notes here..."
                                            value={receiveOrderNotes}
                                            onChange={handleSetReceiveOrderNotes}
                                            disabled={!editNoteOpen}
                                            hidden={!editNoteOpen}
                                        />
                                        <Button
                                            onClick={handleSaveReceiveOrderNotes}
                                            className="mt-4"
                                            disabled={!editNoteOpen}
                                            hidden={!editNoteOpen}
                                        >
                                            Save
                                        </Button>
                                    </div>
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
                                            <p className="text-lg font-medium">{receiveOrder.created_by?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Last Updated</p>
                                            <p className="text-lg font-medium">{new Date(receiveOrder.updated_at).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Created At</p>
                                            <p className="text-lg font-medium">{new Date(receiveOrder.created_at).toLocaleString('id-ID')}</p>
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
