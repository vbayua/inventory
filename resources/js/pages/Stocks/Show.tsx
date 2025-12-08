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
import { ArrowDown, ArrowLeft, ArrowUp, Edit2, LogIn, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type StockStatus = 'available' | 'out_of_stock' | 'reserved' | 'low_stock';

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
            color: 'bg-green-100 text-green-800',
            variant: 'default' as const,
            icon: ArrowDown,
        },
        outbound: {
            id: 'outbound',
            label: 'OUT',
            color: 'bg-blue-100 text-blue-800',
            variant: 'secondary' as const,
            icon: ArrowUp,
        },
        initial: {
            id: 'initial',
            label: 'INITIAL',
            color: 'bg-purple-100 text-purple-800',
            variant: 'secondary' as const,
            icon: PlusCircle,
        },
        adjustment: {
            id: 'adjustment',
            label: 'Adjustment',
            color: 'bg-yellow-100 text-yellow-800',
            variant: 'outline' as const,
            icon: Edit2,
        },
        transfer: {
            id: 'transfer',
            label: 'TRANSFER',
            color: 'bg-indigo-100 text-indigo-800',
            variant: 'default' as const,
            icon: LogIn,
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

    const recentOperations = hasLoadedOps ? (operations ?? [])?.slice(0, 5) : [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${stock?.batch?.batch_number} - ${stock?.product?.name}`} />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                            <Link href={route('stocks.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Stocks
                            </Link>
                        </Button>
                        <h1 className="mt-4 text-3xl font-bold">
                            {stock?.batch?.batch_number} - {stock?.product?.name}
                        </h1>
                        <p className="text-muted-foreground mt-2">View stock detail and operation history</p>
                    </div>

                    <div>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Stock Actions</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>Edit Stock</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setShowAdjustDialog(true)}>Adjust Stock</DropdownMenuItem>
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
                                                                        Lokasi: {operation.location.name} by: {operation.user.name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-muted-foreground text-sm">
                                                                    {formatRelativeTime(operation.operation_date)}
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
