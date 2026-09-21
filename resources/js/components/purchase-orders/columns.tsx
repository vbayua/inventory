import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { PurchaseOrder } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Badge } from '../ui/badge';

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
    return <Badge variant={statusConfig[status].variant} className={`capitalize ${statusConfig[status].color}`}>
        <span className="capitalize">{statusConfig[status].label}</span>
    </Badge>
}
console.log(statusConfig['pending' as keyof typeof statusConfig].color)
export const columns: ColumnDef<PurchaseOrder>[] = [
    {
        id: 'po_number',
        accessorKey: 'po_number',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="PO Number" />;
        },
        cell: ({ cell }) => {
            return <Link href={route('purchase-orders.show', { id: cell.row.original.id })}>{cell.getValue() as string}</Link>;
        },
    },
    {
        id: 'supplier',
        accessorKey: 'Supplier',
        accessorFn: (row) => row.supplier?.partner?.name,
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Supplier" />;
        },
    },
    {
        accessorKey: 'order_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order Date" />,
        cell: ({ cell }) => {
            const date = new Date(cell.getValue() as string);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        },
        filterFn: (row, id, value) => {
            if (!value || (!value.from && !value.to)) return true;

            const rowDate = new Date(row.getValue<string>(id) ?? '');

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

            if (value.from && value.to) {
                return rowDate >= normalizeStartOfDay(value.from as Date) && rowDate <= normalizeEndOfDay(value.to as Date);
            }
            if (value.from) return rowDate >= normalizeStartOfDay(value.from as Date);
            if (value.to) return rowDate <= normalizeEndOfDay(value.to as Date);
            return true;
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ cell }) => {
            return badge(cell.getValue() as keyof typeof statusConfig);
        },
    },
];
