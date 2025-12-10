import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

type BatchIndex = {
    id: number;
    batch_number: string;
    product: {
        id: number;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    created_at: string;
    updated_at: string;
};

export const columns: ColumnDef<BatchIndex>[] = [
    {
        accessorKey: 'batch_number',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="No. Batch" />;
        },
    },
    {
        accessorKey: 'product_sku',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Kode Item" />;
        },
        cell: ({ row }) => {
            return row.original.product?.sku;
        },
    },
    {
        id: 'product_name',
        accessorFn: (row) => row.product?.name,
        header: 'Nama Product ',
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Tgl Dibuat" />;
        },
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        },
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Tgl Diubah" />;
        },
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const batch = row.original;
            const viewBatch = route('batch.show', { id: batch.id });
            const editBatch = route('batch.edit', { id: batch.id });
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
                            <Link href={viewBatch} className={'w-full'}>
                                View Batch
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editBatch} className={'w-full'}>
                                Edit Batch
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
