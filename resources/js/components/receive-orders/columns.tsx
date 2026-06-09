import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { ReceiveOrder } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '../ui/button';

export const columns: ColumnDef<ReceiveOrder>[] = [
    {
        id: 'actions',
        cell: ({ row }) => {
            const receiveOrder = row.original;
            const viewReceiveOrder = route('receive-orders.show', { id: receiveOrder.id });
            return (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={viewReceiveOrder} className="flex items-center gap-1">
                            <span className="sr-only">View Details</span>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: 'receive_number',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Receive Order Number" />;
        },
        cell: ({ cell }) => {
            return <>{cell.getValue() as string}</>;
        },
    },
    {
        id: 'purchase_order',
        accessorFn: (row) => row.purchase_order?.po_number,
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="PO Number" />;
        },
        cell: ({ cell }) => {
            return (
                <Link
                    href={route('purchase-orders.show', { id: cell.row.original.purchase_order_id })}
                    className="hover:cursor-pointer hover:underline"
                >
                    {cell.getValue() as string}
                </Link>
            );
        },
    },
    {
        id: 'supplier',
        accessorFn: (row) => row.purchase_order?.supplier?.partner?.name,
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Supplier" />;
        },
        cell: ({ cell }) => {
            return <>{cell.getValue() as string}</>;
        },
    },
    {
        id: 'receive_date',
        accessorFn: (row) => row.receive_date,
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Received Date" />;
        },
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
        id: 'notes',
        accessorKey: 'notes',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Notes" />;
        },
        cell: ({ cell }) => {
            return <>{(cell.getValue() as string) ?? '-'}</>;
        },
    },
];
