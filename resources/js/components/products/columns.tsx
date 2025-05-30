import { ColumnDef } from '@tanstack/react-table'
import { type Product } from '@/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'


export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant={'ghost'}
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: "created_at"
    },
    {
        accessorKey: "updated_at",
        header: "updated_at"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original
            const viewProduct = route('products.show', { id: product.id })
            const editProduct = route('products.edit', { id: product.id })
            const deleteProduct = () => {
                if (confirm('Are you sure you want to delete this product?')) {
                    router.delete(route('products.destroy', { id: product.id }), {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Product deleted successfully')
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
                            <Link href={viewProduct} className={'w-full'}>
                                View Product
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editProduct} className={'w-full'}>
                                Edit Product
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
