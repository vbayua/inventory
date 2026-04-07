import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReceiveOrder } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

export const columns: ColumnDef<ReceiveOrder>[] = [
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
            return <Link href={route('purchase-orders.show', { id: cell.row.original.purchase_order_id })}>{cell.getValue() as string}</Link>;
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
    {
        id: 'actions',
        cell: ({ row }) => {
            const receiveOrder = row.original;
            const viewReceiveOrder = route('receive-orders.show', { id: receiveOrder.id });
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Link href={viewReceiveOrder} className="w-full">
                                View Details
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
