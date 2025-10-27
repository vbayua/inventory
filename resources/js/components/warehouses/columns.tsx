import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'

type WarehouseIndex = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<WarehouseIndex>[] = [
    {
        accessorKey: "name",
        header: "Warehouse Name",
    },
    {
        accessorKey: "created_at",
        cell: ({ row }) => {
            const createdAt = new Date(row.original.created_at)
            return createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        },
        enableSorting: true,
        enableHiding: true,
        sortingFn: 'datetime',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created At" />
        ),
    },
    {
        accessorKey: "updated_at",
        cell: ({ row }) => {
            const updatedAt = new Date(row.original.updated_at)
            return updatedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        },
        enableSorting: true,
        enableHiding: true,
        sortingFn: 'datetime',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Updated At" />
        ),
        enableColumnFilter: false,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const warehouse = row.original
            const viewWarehouse = route('warehouse.show', { id: warehouse.id })
            const editWarehouse = route('warehouse.edit', { id: warehouse.id })
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
                            <Link href={viewWarehouse} className={'w-full'}>
                                View Warehouse
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editWarehouse} className={'w-full'}>
                                Edit Warehouse
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
