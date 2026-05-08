import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QcInspection } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
    checking: { label: 'Checking', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    pass: { label: 'Pass', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    reject: { label: 'Reject', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    partial_pass: { label: 'Partial Pass', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
};

export const columns: ColumnDef<QcInspection>[] = [
    {
        id: 'ID',
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span>#{row.original.id ?? '-'}</span>,
    },
    {
        id: 'receive_number',
        accessorKey: 'receive_number',
        header: 'RO Number',
        cell: ({ row }) => row.original.receive_order?.receive_number ?? '-',
    },
    {
        id: 'product',
        accessorKey: 'product',
        header: 'Product',
        cell: ({ row }) => {
            const inspection = row.original;
            const product = inspection.receive_order_item?.product ?? inspection.receive_order_item?.purchase_order_item?.product;
            return (
                <div>
                    {product ? (
                        <div>
                            <span className="text-muted-foreground text-xs">({product.sku}) </span>
                            {product.name}
                        </div>
                    ) : (
                        '-'
                    )}
                </div>
            );
        },
    },
    {
        id: 'quantity_received',
        accessorKey: 'quantity_received',
        header: ({ column }) => <div className="text-center">Quantity Received</div>,
        cell: ({ row }) => <div className="text-center">{row.original.receive_order_item?.quantity_received ?? '-'}</div>,
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Quality Status',
        cell: ({ row }) => {
            const inspection = row.original;
            const cfg = statusConfig[inspection.status] ?? {
                label: inspection.status,
                className: 'bg-gray-100 text-gray-800',
            };

            return <Badge className={cfg.className}>{cfg.label}</Badge>;
        },
    },
    {
        id: 'inspector',
        accessorKey: 'inspector',
        header: ({ column }) => <div className="text-center">Inspector</div>,
        cell: ({ row }) => <div className="text-center">{row.original.inspector?.name ?? '-'}</div>,
    },
    {
        id: 'inspection_date',
        accessorKey: 'inspection_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Inspection Date" />,
        cell: ({ row }) => {
            const date = new Date(row.original.inspection_date ?? '');
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
        // Enable filtering by a date range passed in the column filter value
        filterFn: (row, id, value) => {
            // value is expected to be a DateRange from react-day-picker: { from?: Date; to?: Date }
            if (!value || (!value.from && !value.to)) {
                return true;
            }

            const rowDate = new Date(row.original.inspection_date ?? '');

            const normalizeStartOfDay = (d: Date) => {
                const nd = new Date(d);
                nd.setHours(0, 0, 0, 0);
                return nd;
            };

            const normalizeEndOfDay = (d: Date) => {
                const nd = new Date(d);
                nd.setHours(23, 59, 59, 999);
                return nd;
            };

            const hasFrom = !!value.from;
            const hasTo = !!value.to;

            if (hasFrom && hasTo) {
                const start = normalizeStartOfDay(value.from as Date);
                const end = normalizeEndOfDay(value.to as Date);
                return rowDate >= start && rowDate <= end;
            }
            if (hasFrom) {
                const start = normalizeStartOfDay(value.from as Date);
                return rowDate >= start;
            }
            if (hasTo) {
                const end = normalizeEndOfDay(value.to as Date);
                return rowDate <= end;
            }
            return true;
        },
    },
    {
        id: 'approval',
        accessorKey: 'approval',
        header: 'Approval',
        cell: ({ row }) => {
            const approval = row.original.approval;
            console.log(approval?.status);
            const cfg = statusConfig[approval?.status ?? 'pending'];
            return <Badge className={cfg.className}>{cfg.label}</Badge>;
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const inspection = row.original;
            return (
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/qc/inspections/${inspection.id}`}>View</Link>
                    </Button>
                </div>
            );
        },
    },
];
