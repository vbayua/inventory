import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PurchaseOrder } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

export const columns: ColumnDef<PurchaseOrder>[] = [
    {
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
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const purchaseOrder = row.original;
            const viewPurchaseOrder = route('purchase-orders.show', { id: purchaseOrder.id });
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
                            <Link href={viewPurchaseOrder} className="w-full">
                                View PO
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
