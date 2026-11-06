import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { type ReactNode } from 'react';
import { type ExpiringBatch, formatQuantity, type LowStockItem, type OverduePurchaseOrder, type PendingInspection } from './types';

const formatDate = (date: string) => format(parseISO(date), 'd MMM yyyy');

const humanizeStatus = (status: string) => status.replace(/_/g, ' ');

function EmptyRow({ columns, children }: { columns: number; children: ReactNode }) {
    return (
        <TableRow>
            <TableCell colSpan={columns} className="text-muted-foreground h-24 text-center">
                {children}
            </TableCell>
        </TableRow>
    );
}

function TabCount({ count }: { count: number }) {
    return (
        <Badge variant={count > 0 ? 'secondary' : 'outline'} size="sm" className="ml-1.5 tabular-nums">
            {count}
        </Badge>
    );
}

function RecordLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="font-medium hover:underline">
            {children}
        </Link>
    );
}

const ACTION_LIST_TITLE = 'Needs attention';
const ACTION_LIST_DESCRIPTION = 'Stock, batches and orders that need action';

type ActionListProps = {
    lowStock: LowStockItem[];
    lowStockTotal: number;
    expiringBatches: ExpiringBatch[];
    expiringBatchesTotal: number;
    pendingInspections: PendingInspection[];
    pendingInspectionsTotal: number;
    overduePurchaseOrders: OverduePurchaseOrder[];
    overduePurchaseOrdersTotal: number;
};

export default function ActionList({
    lowStock,
    lowStockTotal,
    expiringBatches,
    expiringBatchesTotal,
    pendingInspections,
    pendingInspectionsTotal,
    overduePurchaseOrders,
    overduePurchaseOrdersTotal,
}: ActionListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{ACTION_LIST_TITLE}</CardTitle>
                <CardDescription>{ACTION_LIST_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="low-stock">
                    <TabsList className="h-auto flex-wrap">
                        <TabsTrigger value="low-stock">
                            Low stock
                            <TabCount count={lowStockTotal} />
                        </TabsTrigger>
                        <TabsTrigger value="expiring">
                            Expiring
                            <TabCount count={expiringBatchesTotal} />
                        </TabsTrigger>
                        <TabsTrigger value="qc">
                            Pending QC
                            <TabCount count={pendingInspectionsTotal} />
                        </TabsTrigger>
                        <TabsTrigger value="overdue-po">
                            Overdue POs
                            <TabCount count={overduePurchaseOrdersTotal} />
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="low-stock">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">On hand</TableHead>
                                    <TableHead className="text-right">Minimum</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStock.length === 0 ? (
                                    <EmptyRow columns={4}>No stock below its minimum.</EmptyRow>
                                ) : (
                                    lowStock.map((stock) => (
                                        <TableRow key={stock.id}>
                                            <TableCell>
                                                <RecordLink href={route('stocks.show', stock.id)}>{stock.product ?? '—'}</RecordLink>
                                            </TableCell>
                                            <TableCell>{stock.location ?? '—'}</TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatQuantity(stock.quantity)} {stock.unit}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-right tabular-nums">
                                                {formatQuantity(stock.minimum_quantity)} {stock.unit}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="expiring">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Expiry date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expiringBatches.length === 0 ? (
                                    <EmptyRow columns={4}>No batches with stock expire in the next 30 days.</EmptyRow>
                                ) : (
                                    expiringBatches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell>
                                                <RecordLink href={route('batch.show', batch.id)}>{batch.batch_number}</RecordLink>
                                            </TableCell>
                                            <TableCell>{batch.product ?? '—'}</TableCell>
                                            <TableCell className="tabular-nums">{formatDate(batch.expiry_date)}</TableCell>
                                            <TableCell>
                                                {batch.is_expired ? (
                                                    <Badge variant="destructive">Expired</Badge>
                                                ) : (
                                                    <Badge variant="outline">Expiring soon</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="qc">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Receive order</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingInspections.length === 0 ? (
                                    <EmptyRow columns={4}>No inspections waiting for a decision.</EmptyRow>
                                ) : (
                                    pendingInspections.map((inspection) => (
                                        <TableRow key={inspection.id}>
                                            <TableCell>
                                                <RecordLink href={route('qc.inspections.show', inspection.id)}>
                                                    {inspection.product ?? '—'}
                                                </RecordLink>
                                            </TableCell>
                                            <TableCell>{inspection.receive_number ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {humanizeStatus(inspection.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="tabular-nums">{formatDate(inspection.created_at)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="overdue-po">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO number</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Expected</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overduePurchaseOrders.length === 0 ? (
                                    <EmptyRow columns={4}>No overdue purchase orders.</EmptyRow>
                                ) : (
                                    overduePurchaseOrders.map((purchaseOrder) => (
                                        <TableRow key={purchaseOrder.id}>
                                            <TableCell>
                                                <RecordLink href={route('purchase-orders.show', purchaseOrder.id)}>
                                                    {purchaseOrder.po_number}
                                                </RecordLink>
                                            </TableCell>
                                            <TableCell>{purchaseOrder.supplier ?? '—'}</TableCell>
                                            <TableCell className="tabular-nums">{formatDate(purchaseOrder.expected_delivery_date)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {humanizeStatus(purchaseOrder.status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export function ActionListSkeleton() {
    return (
        <Card aria-busy="true">
            <CardHeader>
                <CardTitle>{ACTION_LIST_TITLE}</CardTitle>
                <CardDescription>{ACTION_LIST_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-9 w-full max-w-md" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
                <span className="sr-only">Loading items that need attention…</span>
            </CardContent>
        </Card>
    );
}
