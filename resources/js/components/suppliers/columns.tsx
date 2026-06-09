import { Supplier } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const columns: ColumnDef<Supplier>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Supplier Name" />;
        },
        cell: ({ row }) => {
            const id = row.original.id;
            const name = row.original.partner?.name;
            return <Link href={route('supplier.show', id)}>{name}</Link>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const supplier = row.original;
            const viewSupplier = route('supplier.show', { id: supplier.id });
            const editSupplier = route('supplier.edit', { id: supplier.id });
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
                            <Link href={viewSupplier} className={'w-full'}>
                                View Supplier
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editSupplier} className={'w-full'}>
                                Edit Supplier
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
