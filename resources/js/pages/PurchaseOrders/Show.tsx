import ContainerLayout from '@/components/container-layout';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PurchaseOrder, ReceiveOrder } from '@/types/resources';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckIcon, File, FilePenIcon, Mail, MapPin, MoreHorizontalIcon, PenIcon, PhoneCall, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

const statusConfig = {
    pending:
        { variant: 'outline', color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    partially_received:
        { variant: 'secondary', color: 'bg-blue-600/20 border-blue-100 border-dashed', label: 'Partial' },
    received:
        { variant: 'secondary', color: 'bg-blue-800 border-blue-100 text-blue-100', label: 'Received' },
    completed:
        { variant: 'default', color: 'bg-green-800 border-green-100 text-green-100', label: 'Closed' },
    cancelled:
        { variant: 'destructive', color: 'bg-red-100 text-red-800', label: 'Cancelled' },
} as const;
const badge = (status: keyof typeof statusConfig) => {
    return <Badge variant={statusConfig[status].variant} className={statusConfig[status].color}>{statusConfig[status].label}</Badge>;
};

export default function Show({ purchaseOrder, receiveOrders }: { purchaseOrder: PurchaseOrder; receiveOrders: ReceiveOrder[] }) {
    breadcrumbs[1].href = `/purchase-orders/${purchaseOrder.id}`;
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${diffDays}d ago`;
    };
    console.log(receiveOrders)
    const [purchaseOrderNotes, setPurchaseOrderNotes] = useState(purchaseOrder.notes ?? '');

    const [editNoteOpen, setEditNoteOpen] = useState(false);

    const handleSetPurchaseOrderNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPurchaseOrderNotes(e.target.value);
    };

    const handleSavePurchaseOrderNote = () => {
        setEditNoteOpen(false);
        if (purchaseOrderNotes !== purchaseOrder.notes) {
            router.put(
                route('purchase-orders.update', { id: purchaseOrder.id }),
                { notes: purchaseOrderNotes },
                {
                    onSuccess: () => {
                        setEditNoteOpen(false);
                        router.reload({ only: ['purchase-orders'] });
                    },
                },
            );
        }
    };

    const cancelPurchaseOrder = () => {
        router.put(
            route('purchase-orders.cancel', purchaseOrder.id),
            {},
            {
                onSuccess: () => {
                    router.reload({ only: ['purchase-orders'] });
                },
                onError: (errors) => {
                    toast.error(errors.message);
                },
            }
        );
    };

    const closePurchaseOrder = () => {
        router.put(
            route('purchase-orders.close', { id: purchaseOrder.id }),
            {},
            {
                onSuccess: () => {
                    router.reload({ only: ['purchase-orders'] });
                },
                onError: (errors) => {
                    toast.error(errors.message);
                    console.log(errors);
                },
            },
        );
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`PO - ${purchaseOrder.po_number}`} />
            <ContainerLayout>
                <div className="mb-6 grid grid-cols-1 gap-6">
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
                                <ButtonGroup>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={route('purchase-orders.receive', { purchase_order: purchaseOrder.id, receive_all: true })}>
                                            <FilePenIcon />
                                            Create Receive Order
                                        </Link>
                                    </Button>
                                    <ButtonGroup>
                                        {purchaseOrder.status !== 'completed' &&
                                            <Button variant="outline" size="sm" onClick={closePurchaseOrder}>
                                            <CheckIcon />
                                            Mark as Complete
                                            </Button>
                                        }
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <MoreHorizontalIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                {/*<DropdownMenuLabel>Order Action</DropdownMenuLabel>*/}
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('purchase-orders.receive', { purchase_order: purchaseOrder.id, receive_all: true })}>
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
                                                {purchaseOrder.status !== 'cancelled' && receiveOrders && receiveOrders.length === 0 && (
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem variant={'destructive'} asChild>
                                                            <Button variant={'link'} onClick={cancelPurchaseOrder} className="w-full">Cancel Order</Button>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </ButtonGroup>
                                </ButtonGroup>
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
                                    {badge(purchaseOrder.status as keyof typeof statusConfig)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-center">Order Qty</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchaseOrder.items?.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="md:text-xl">
                                                    {item.product?.name} <span className="text-muted-foreground">({item.product?.sku})</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {Number(item.price).toLocaleString('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-center md:text-xl">x {item.quantity}</TableCell>
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
                        <div className="col-span-2 space-y-6">
                            <Card className="h-full">
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
                                        {purchaseOrder.notes ?? '-'}
                                    </p>
                                    <div className="">
                                        <Textarea
                                            className="w-full"
                                            placeholder="Enter notes here..."
                                            value={purchaseOrderNotes}
                                            onChange={handleSetPurchaseOrderNote}
                                            disabled={!editNoteOpen}
                                            hidden={!editNoteOpen}
                                        />
                                        <Button
                                            onClick={handleSavePurchaseOrderNote}
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
                    </div>
                    <Separator />
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Receive Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Receive Number</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Received By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receiveOrders.map((receiveOrder) => (
                                            <TableRow key={receiveOrder.id} onClick={() => {
                                                router.visit(`/receive-orders/${receiveOrder.id}`);
                                            }}>
                                                <TableCell>{receiveOrder.receive_number}</TableCell>
                                                <TableCell>{receiveOrder.receive_date}</TableCell>
                                                <TableCell>{receiveOrder.notes ?? '-'}</TableCell>
                                                <TableCell>{receiveOrder.user?.name ?? '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Audit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Created By</p>
                                        <p className="text-lg font-medium">{purchaseOrder.user?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Last Updated</p>
                                        <p className="text-lg font-medium">{new Date(purchaseOrder.updated_at ?? '').toLocaleString('id-ID')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Created At</p>
                                        <p className="text-lg font-medium">{new Date(purchaseOrder.created_at ?? '').toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
