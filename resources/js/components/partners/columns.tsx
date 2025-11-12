import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'

type PartnerIndex = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<PartnerIndex>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Name"
                />
            )
        },
        cell: ({ row }) => {
            const id = row.original.id;
            const name = row.original.name;
            return (
                <Link href={route('partners.show', id)}>
                    {name}
                </Link>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const partner = row.original
            const viewPartner = route('partners.show', { id: partner.id })
            const editPartner = route('partners.edit', { id: partner.id })
            const deleteProduct = () => {
                if (confirm('Are you sure you want to delete this partner?')) {
                    router.delete(route('partners.destroy', { id: partner.id }), {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Partner deleted successfully')
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
                            <Link href={viewPartner} className={'w-full'}>
                                View Partner
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editPartner} className={'w-full'}>
                                Edit Partner
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
