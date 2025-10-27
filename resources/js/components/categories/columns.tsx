import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'

type CategoryIndex = {
    id: number;
    name: string;
    slug?: string;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<CategoryIndex>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Category"
                />
            )
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
        },
        enableHiding: true
    },
    {
        accessorKey: "updated_at",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Last Updated"
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
            const category = row.original
            const viewCategory = route('categories.show', { id: category.id })
            const editCategory = route('categories.edit', { id: category.id })
            const deleteCategory = () => {
                if (confirm('Are you sure you want to delete this category?')) {
                    router.delete(route('category.destroy', { id: category.id }), {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Category deleted successfully')
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
                            <Link href={viewCategory} className={'w-full'}>
                                View Category
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editCategory} className={'w-full'}>
                                Edit Category
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
