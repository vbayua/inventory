import ContainerLayout from '@/components/container-layout';
import AdjustOperation from '@/components/operations/adjust-operation';
import { columns } from '@/components/stocks/details/columns';
import { DataTable } from '@/components/stocks/details/data-table';
import StockDetailCard from '@/components/stocks/StockDetailCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemContent } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowDownUp, ArrowLeft, ArrowUp, Edit2, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';

type StockStatus = 'available' | 'out_of_stock' | 'reserved' | 'low_stock';
type OperationType = 'outbound' | 'inbound' | 'adjustment' | 'transfer';

export default function Show({ stock, operations }: { stock: any; operations: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Stock Index',
            href: '/stocks',
        },
        {
            title: `${stock?.batch?.batch_number} - ${stock?.product?.name}`,
            href: `/stocks/${stock?.id}`,
        },
    ];

    const stockStatus = stock.status;
    const [activeTab, setActiveTab] = useState<'overview' | 'log_history'>('overview');
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAdjustDialog, setShowAdjustDialog] = useState(false);
    const [minimumQuantity, setMinimumQuantity] = useState(stock?.minimum_quantity || 0);
    const [hasLoadedOps, setHasLoadedOps] = useState(false);
    useEffect(() => {
        // Reload operations only once when Operations tab becomes active
        if ((activeTab === 'overview' || activeTab === 'log_history') && !hasLoadedOps) {
            router.reload({ only: ['operations'] });
            setHasLoadedOps(true);
        }
    }, [activeTab, hasLoadedOps]);
    const handleMinimumQuantityUpdate = () => {
        router.put(
            route('stocks.update', stock.id),
            {
                minimum_quantity: minimumQuantity,
            },
            {
                onSuccess: () => {
                    setShowEditDialog(false);
                },
                onError: (errors) => {
                    console.log(errors);
                },
            },
        );
    };
    // console.log(stock);
    const operationConfig = {
        inbound: {
            id: 'inbound',
            label: 'IN',
            color: 'bg-green-200 text-green-800',
            variant: 'default' as const,
            icon: ArrowDown,
            prefix: '+',
        },
        outbound: {
            id: 'outbound',
            label: 'OUT',
            color: 'bg-red-200 text-red-800',
            variant: 'secondary' as const,
            icon: ArrowUp,
            prefix: '-',
        },
        initial: {
            id: 'initial',
            label: 'IN',
            color: 'bg-purple-200 text-purple-800',
            variant: 'secondary' as const,
            icon: ArrowDown,
            prefix: '+',
        },
        adjustment: {
            id: 'adjustment',
            label: 'ADJ',
            color: 'bg-yellow-100 text-yellow-800',
            variant: 'outline' as const,
            icon: Edit2,
        },
        transfer: {
            id: 'transfer',
            label: 'Transfer',
            color: 'bg-indigo-100 text-indigo-800',
            variant: 'default' as const,
            icon: LogIn,
        },
        transfer_in: {
            id: 'transfer_in',
            label: 'TRANSFER IN',
            color: 'bg-teal-100 text-teal-800',
            variant: 'default' as const,
            icon: ArrowDownUp,
            prefix: '+',
        },
        transfer_out: {
            id: 'transfer_out',
            label: 'TRANSFER OUT',
            color: 'bg-indigo-100 text-indigo-800',
            variant: 'default' as const,
            icon: ArrowDownUp,
            prefix: '-',
        },
    };
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

    const handleCreateOperation = (id: number, operation_type: OperationType) => {
        return function () {
            router.get(
                route('operations.create'),
                {
                    stock_id: id,
                    operation_type: operation_type,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        };
    };

    const recentOperations = hasLoadedOps ? (operations ?? [])?.slice(0, 5) : [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${stock?.batch?.batch_number} Stock`} />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Button variant="link" className="text-muted-foreground hover:text-foreground" asChild>
                            <Link href={route('stocks.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Stok
                            </Link>
                        </Button>
                        <div className="space-y-1.5">
                            <h1 className="mt-4 text-2xl font-bold">{stock?.product?.name}</h1>
                            <Separator orientation="vertical" />
                            <h2 className="text-xl font-normal">{stock?.batch?.batch_number}</h2>
                            <p className="text-muted-foreground mt-2">View stock detail and operation history</p>
                        </div>
                    </div>

                    <div>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Action</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>Edit Minimum Qty</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowAdjustDialog(true)}>Adjust Stock</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Operasi Stok</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={handleCreateOperation(stock.id, 'inbound')}>Stock In</DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleCreateOperation(stock.id, 'outbound')}>Stock Out</DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleCreateOperation(stock.id, 'transfer')}>Transfer Stock</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuLabel>Kartu Stock</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('stocks.stock-card', { stock: stock.id })}> View Stock Card </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Stock</DialogTitle>
                                <DialogDescription>Edit stock details here.</DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Minimum Quantity</FieldLabel>
                                    <Input
                                        name="minimum_quantity"
                                        type="number"
                                        className="w-full rounded-md border px-3 py-2"
                                        defaultValue={stock?.minimum_quantity}
                                        onChange={(e) => setMinimumQuantity(e.target.valueAsNumber)}
                                        min={0}
                                        step={0.1}
                                    />
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleMinimumQuantityUpdate}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adjust Stock</DialogTitle>
                                <DialogDescription>Adjust stock quantity here.</DialogDescription>
                            </DialogHeader>
                            <AdjustOperation stock={stock} isDialogOpen={showAdjustDialog} setDialogOpen={setShowAdjustDialog} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-6">
                    <StockDetailCard
                        batch_number={stock?.batch?.batch_number}
                        product_id={stock?.product?.id}
                        product_name={stock?.product?.name}
                        warehouse_name={stock?.location?.warehouse?.name}
                        location_name={stock?.location?.name}
                        supplier_name={stock?.batch?.supplier?.partner?.name}
                        quantity={stock?.quantity}
                        unit={stock?.unit}
                        status={stockStatus}
                        minimum_quantity={stock?.minimum_quantity}
                    />
                    {/* <OperationHistoryTable operations={operations} /> */}
                </div>

                {/*Operations*/}
                <div className="my-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Operations</h2>
                    </div>
                    <Tabs
                        onValueChange={(value) => {
                            // Activate tab; operations will lazy-load once when log_history becomes active
                            setActiveTab(value as 'overview' | 'log_history');
                        }}
                        className="space-y-6"
                    >
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="log_history">Log Operasi Stok</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <Card className="md:col-span-3">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recent Operations</CardTitle>
                                        <Separator />
                                    </CardHeader>
                                    <CardContent>
                                        {hasLoadedOps === false || recentOperations?.length === 0 ? (
                                            <p className="text-muted-foreground">No recent operations found.</p>
                                        ) : (
                                            recentOperations?.map((operation) => {
                                                const config = operationConfig[operation.operation_type as keyof typeof operationConfig];

                                                return (
                                                    <Item key={operation.id} className="mb-4 last:mb-0" variant={'outline'} size={'sm'}>
                                                        {/*<ItemHeader className="flex items-center justify-between">
                                                            <ItemTitle
                                                                className={`inline-flex items-center px-2 py-1 text-xs font-medium ${config.color} rounded`}
                                                            >
                                                                {config.icon && <config.icon className="mr-1 inline-block h-4 w-4 text-current" />}
                                                                {config.label}
                                                            </ItemTitle>
                                                            <span className="text-muted-foreground text-sm">
                                                                {formatRelativeTime(operation.operation_date)}
                                                            </span>
                                                        </ItemHeader>*/}
                                                        <ItemContent>
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span
                                                                        className={`inline-flex items-center px-2 py-1 text-lg font-bold ${config.color} rounded`}
                                                                    >
                                                                        {config.icon && (
                                                                            <config.icon className="mr-1 inline-block h-4 w-4 text-current" />
                                                                        )}
                                                                        {config.label}
                                                                    </span>
                                                                    <Separator orientation="vertical" className="h-4" />
                                                                </div>
                                                                <div className="flex-1 px-4">
                                                                    <div>
                                                                        <span className="text-accent-foreground text-lg">{operation.quantity} </span>
                                                                        <span className="text-accent-foreground text-lg">{operation.unit}</span>
                                                                    </div>
                                                                    <span className="text-muted-foreground text-sm">
                                                                        Lokasi: {operation.location.name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-muted-foreground flex shrink-0 flex-col items-end">
                                                                    <span className="text-sm">{formatRelativeTime(operation.operation_date)}</span>
                                                                    <span className="text-xs">by: {operation.user?.name || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </ItemContent>
                                                    </Item>
                                                );
                                            })
                                        )}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Audit</CardTitle>
                                        <Separator />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-muted-foreground text-sm">Created At</p>
                                                <p className="font-medium">
                                                    {new Date(stock.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm">Created By</p>
                                                <p className="font-medium">{stock.user?.name || 'N/A'}</p>
                                            </div>
                                            <Separator />
                                            <div>
                                                <p className="text-muted-foreground text-sm">Last Updated At</p>
                                                <p className="font-medium">
                                                    {new Date(stock.updated_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-sm">Last Updated By</p>
                                                <p className="font-medium">{(operations ?? [])[0]?.user?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="log_history">
                            {/*<OperationHistoryTable operations={operations} />*/}
                            {hasLoadedOps ? (
                                <DataTable columns={columns} data={operations ?? []} clientSide={true} />
                            ) : (
                                <p className="text-muted-foreground">Loading operations...</p>
                            )}
                        </TabsContent>
                    </Tabs>
                    {/*{operations.length > 0 ? ()}*/}
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
