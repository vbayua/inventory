import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'

type Partner = {
    id: number;
    name: string;
}

type SupplierIndex = {
    id: number;
    name: string;
    partner: Partner;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<SupplierIndex>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Supplier Name"
                />
            )
        },
        cell: ({ row }) => {
            const id = row.original.id;
            const name = row.original.partner?.name;
            return (
                <Link href={route('supplier.show', id)}>
                    {name}
                </Link>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const supplier = row.original
            const viewSupplier = route('supplier.show', { id: supplier.id })
            const editSupplier = route('supplier.edit', { id: supplier.id })
            const deleteProduct = () => {
                if (confirm('Are you sure you want to delete this supplier?')) {
                    router.delete(route('supplier.destroy', { id: supplier.id }), {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Supplier deleted successfully')
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
            )
        }
    }
]
