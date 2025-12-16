import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

type LocationIndex = {
    id: number;
    name: string;
    warehouse: {
        id: number;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    created_at: string;
    updated_at: string;
};

export const columns: ColumnDef<LocationIndex>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Nama Lokasi" />;
        },
        cell: ({ row }) => {
            const location = row.original;
            return <Link href={route('location.show', { id: location.id })}>{location.name}</Link>;
        },
    },
    {
        id: 'warehouse_name',
        accessorFn: (row) => row.warehouse?.name,
        header: 'Nama Gudang',
        cell: ({ row }) => {
            const warehouse = row.original.warehouse;
            return <Link href={route('warehouse.show', { id: warehouse.id })}>{warehouse.name}</Link>;
        },
        meta: {
            filterVariant: 'select',
        },
    },
    // {
    //     accessorKey: "warehouse.name",
    //     header: ({ column }) => {
    //         return (
    //             <DataTableColumnHeader
    //                 column={column}
    //                 title="Warehouse Name"
    //             />
    //         )
    //     },
    // },
    {
        accessorKey: 'created_at',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Created At" />;
        },
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Updated At" />;
        },
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const location = row.original;
            const viewLocation = route('location.show', { id: location.id });
            const editLocation = route('location.edit', { id: location.id });
            const deleteProduct = () => {
                if (confirm('Are you sure you want to delete this location?')) {
                    router.delete(route('location.destroy', { id: location.id }), {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Warehouse deleted successfully');
                        },
                        onError: (errors) => {
                            if (errors.name) {
                                toast.error(errors.name);
                            }
                        },
                    });
                }
            };
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
                            <Link href={viewLocation} className={'w-full'}>
                                View Location
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editLocation} className={'w-full'}>
                                Edit Location
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
