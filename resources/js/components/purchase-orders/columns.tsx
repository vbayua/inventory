import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PurchaseOrder } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

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

export const columns: ColumnDef<PurchaseOrder>[] = [
    {
        id: 'actions',
        cell: ({ row }) => {
            const purchaseOrder = row.original;
            const viewPurchaseOrder = route('purchase-orders.show', { id: purchaseOrder.id });
            return (
                <div className="flex items-center">
                    <Button variant="ghost" className="h-8 w-8 p-0" asChild>
                        <Link href={viewPurchaseOrder} className="text-primary text-lg font-medium">
                        <span className="sr-only">View PO</span>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            );
        },
    },
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
        header: 'Order Date',
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
            const status = cell.getValue() as string;
            const config = statusConfig(status);
            return <span className={`inline-block rounded px-2 py-1 ${config.color}`}>{config.label}</span>;
        },
    },
];
