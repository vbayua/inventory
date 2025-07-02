import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'

type BatchIndex = {
    id: number;
    batch_number: string;
    product: {
        id: number;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<BatchIndex>[] = [
    {
        accessorKey: "batch_number",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Batch Number"
                />
            )
        },
    },
    {
        id: "product_name",
        accessorFn: row => row.product?.name,
        header: "Product Name",
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Created At"
                />
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.created_at)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        }
    },
    {
        accessorKey: "updated_at",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Updated At"
                />
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const batch = row.original
            const viewBatch = route('batch.show', { id: batch.id })
            const editBatch = route('batch.edit', { id: batch.id })
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
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
            )
        }
    }
]
