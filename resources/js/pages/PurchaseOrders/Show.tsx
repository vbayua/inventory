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
import { Item, ItemContent } from '@/components/ui/item';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PurchaseOrder, ReceiveOrder } from '@/types/resources';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, File, Mail, MapPin, PencilIcon, PenIcon, PhoneCall, User } from 'lucide-react';
import { useEffect, useState } from 'react';

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

const statusConfig = (status: string) => {
    switch (status) {
        case 'pending':
            return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
        case 'partially_received':
            return { color: 'bg-green-100 text-green-800', label: 'Partially Received' };
        case 'received':
            return { color: 'bg-blue-100 text-blue-800', label: 'Received' };
        case 'cancelled':
            return { color: 'bg-red-100 text-red-800', label: 'Cancelled' };
        default:
            return { color: 'gray', label: 'Unknown' };
    }
};

export default function Show({ purchaseOrder, receiveOrders }: { purchaseOrder: PurchaseOrder; receiveOrders: ReceiveOrder[] }) {
    breadcrumbs[1].href = `/purchase-orders/${purchaseOrder.id}`;

    // console.log(purchaseOrder);
    console.log(receiveOrders.length);

    const [activeTab, setActiveTab] = useState<'overview' | 'log_history'>('overview');
    const [hasLoadedReceiveOps, setHasLoadedReceiveOps] = useState(false);

    useEffect(() => {
        if ((activeTab === 'overview' || activeTab === 'log_history') && !hasLoadedReceiveOps) {
            router.reload({ only: ['receive-orders'] });
            setHasLoadedReceiveOps(true);
        }
    }, [activeTab, hasLoadedReceiveOps]);
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

    const recentReceiveOrders = hasLoadedReceiveOps ? (receiveOrders ?? [])?.slice(0, 5) : [];

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
                                        {!receiveOrders && receiveOrders?.length !== 0 && (
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem variant={'destructive'}>Cancel Order</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        )}
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
                                    <p className={`rounded px-2 py-1 ${statusConfig(purchaseOrder.status).color}`}>
                                        {statusConfig(purchaseOrder.status).label}
                                    </p>
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
                        <div className="col-span-2 space-y-6">
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
                        <div>
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
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Receive Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs onValueChange={(value) => setActiveTab(value as 'overview' | 'log_history')} value={activeTab}>
                                    <TabsList>
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="log_history">History</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="overview">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Card className="md:col-span-3">
                                                <CardHeader>
                                                    <CardTitle>Recently Received</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {hasLoadedReceiveOps === false || recentReceiveOrders?.length === 0 ? (
                                                        <p className="text-muted-foreground">No received orders yet.</p>
                                                    ) : (
                                                        <div>
                                                            {recentReceiveOrders?.map((order) => (
                                                                <Link href={route('receive-orders.show', order.id)}>
                                                                    <Item
                                                                        key={order.id}
                                                                        variant={'outline'}
                                                                        size="sm"
                                                                        className="hover:bg-accent/50 mb-4 last:mb-0"
                                                                    >
                                                                        <ItemContent>
                                                                            <div className="flex items-center justify-between">
                                                                                <p>{order.receive_number}</p>
                                                                                <div>
                                                                                    <p>
                                                                                        {order.user ? `Received by ${order.user?.name} ` : ''}
                                                                                        {formatRelativeTime(order.receive_date)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </ItemContent>
                                                                    </Item>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="log_history">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Receive Number</TableHead>
                                                    <TableHead>Reference</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                    <TableHead>Received By</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {receiveOrders.map((receiveOrder) => (
                                                    <TableRow key={receiveOrder.id}>
                                                        <TableCell>{receiveOrder.receive_number}</TableCell>
                                                        <TableCell>{receiveOrder.reference_number ?? '-'}</TableCell>
                                                        <TableCell>{receiveOrder.receive_date}</TableCell>
                                                        <TableCell>{receiveOrder.notes ?? '-'}</TableCell>
                                                        <TableCell>{receiveOrder.user?.name ?? '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
