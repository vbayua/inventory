import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'

type OperationIndex = {
    id: number;
    operation_type: string;
    product: {
        id: number;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    location: {
        id: number;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    batch: {
        id: number;
        batch_number: string;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    unit: string;
    quantity: number;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<OperationIndex>[] = [
    {
        accessorKey: "operation_type",
        header: "Operation Type",
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
        id: "location_name",
        accessorFn: row => row.location?.name,
        header: "Location",
        meta: {
            filterVariant: 'select',
        },
    },
    {
        id: "batch_number",
        accessorFn: row => row.batch?.batch_number,
        header: "Batch Number",
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
            const operation = row.original
            const viewOperation = route('operations.show', { id: operation.id })
            const editOperation = route('operations.edit', { id: operation.id })
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
                            <Link href={viewOperation} className={'w-full'}>
                                View Operation
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editOperation} className={'w-full'}>
                                Edit Operation
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
