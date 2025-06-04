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
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Warehouse Name"
                />
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const warehouse = row.original
            const viewWarehouse = route('warehouse.show', { id: warehouse.id })
            const editWarehouse = route('warehouse.edit', { id: warehouse.id })
            const deleteProduct = () => {
                if (confirm('Are you sure you want to delete this warehouse?')) {
                    router.delete(route('warehouse.destroy', { id: warehouse.id }), {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Warehouse deleted successfully')
                        },
                        onError: (errors) => {
                            if (errors.name) {
                                toast.error(errors.name)
                            }
                        }
                    })
                }
            }
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
