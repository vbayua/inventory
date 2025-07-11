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
    operation_date: string;
}

export const columns: ColumnDef<OperationIndex>[] = [
    {
        id: "batch_number",
        accessorFn: row => row.batch?.batch_number,
        header: "Batch Number",
        meta: {
            filterVariant: 'select',
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
        accessorKey: "operation_type",
        header: "Operation Type",
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
        accessorKey: "operation_date",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Created At"
                />
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.operation_date)
            const localeDateString = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
            })
            return (
                <span className="text-sm text-muted-foreground">
                    {localeDateString}
                </span>
            )
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
