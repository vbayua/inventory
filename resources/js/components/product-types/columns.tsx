import { ProductType } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const columns: ColumnDef<ProductType>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Product Type Name" />;
        },
        cell: ({ row }) => {
            const productType = row.original;
            return <Link href={route('product-types.show', { id: productType.id })}>{productType.name}</Link>;
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
            const date = new Date(row.original.created_at ?? '');
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
        enableHiding: true,
        enableSorting: true,
        sortingFn: 'datetime',
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Updated At" />;
        },
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at ?? '');
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
        enableHiding: true,
        enableSorting: true,
        sortingFn: 'datetime',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const productType = row.original;
            const viewProductType = route('product-types.show', { id: productType.id });
            const editProductType = route('product-types.edit', { id: productType.id });
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
                            <Link href={viewProductType} className={'w-full'}>
                                View Product Type
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editProductType} className={'w-full'}>
                                Edit Product Type
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
