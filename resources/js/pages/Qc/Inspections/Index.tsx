import ContainerLayout from '@/components/container-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { QcInspection } from '@/types/resources';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quality Control', href: '/qc/inspections' },
    { title: 'Inspections', href: '/qc/inspections' },
];

type FilterTab = 'all' | 'pending' | 'checking' | 'pass' | 'reject';

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
    checking: { label: 'Checking', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    pass: { label: 'Pass', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    reject: { label: 'Reject', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
};

const tabLabels: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'checking', label: 'Checking' },
    { key: 'pass', label: 'Pass' },
    { key: 'reject', label: 'Reject' },
];

export default function Index({ inspections }: { inspections: QcInspection[] }) {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered =
        activeTab === 'all' ? inspections : inspections.filter((i) => i.status === activeTab);

    const countFor = (tab: FilterTab) =>
        tab === 'all' ? inspections.length : inspections.filter((i) => i.status === tab).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QC Inspections" />
            <ContainerLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">QC Inspections</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Quality control inspections for received items.
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 rounded-lg border p-1 w-fit">
                        {tabLabels.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                                    activeTab === key
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                {label}
                                <span
                                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                                        activeTab === key
                                            ? 'bg-primary-foreground/20 text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {countFor(key)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5" />
                                Inspections
                            </CardTitle>
                            <CardDescription>
                                {filtered.length} inspection(s) found.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Receive Order</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Qty Received</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead>Inspector</TableHead>
                                        <TableHead>Inspection Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-muted-foreground py-10 text-center"
                                            >
                                                No inspections found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((inspection) => {
                                            const cfg = statusConfig[inspection.status] ?? {
                                                label: inspection.status,
                                                className: 'bg-gray-100 text-gray-800',
                                            };
                                            const product =
                                                inspection.receive_order_item?.product ??
                                                inspection.receive_order_item?.purchase_order_item?.product;

                                            return (
                                                <TableRow
                                                    key={inspection.id}
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        router.get(
                                                            route('qc.inspections.show', inspection.id),
                                                        )
                                                    }
                                                >
                                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                                        #{inspection.id}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {inspection.receive_order?.receive_number ?? '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{product?.name ?? '-'}</p>
                                                            {product?.sku && (
                                                                <p className="text-muted-foreground text-xs">
                                                                    {product.sku}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {inspection.receive_order_item?.quantity_received ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={cfg.className}>{cfg.label}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {inspection.inspector?.name ?? (
                                                            <span className="text-muted-foreground">Unassigned</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {inspection.inspection_date
                                                            ? format(
                                                                  new Date(inspection.inspection_date),
                                                                  'LLL dd, yyyy',
                                                              )
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell
                                                        className="text-right"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link
                                                                href={route(
                                                                    'qc.inspections.show',
                                                                    inspection.id,
                                                                )}
                                                            >
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
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
