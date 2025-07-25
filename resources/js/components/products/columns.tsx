import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'

type ProductIndex = {
    id: number;
    name: string;
    sku: string;
    unit: string;
    price: number;
    categories: {
        id: number;
        [key: string]: any; // Adjust this type based on your category structure
    };
    product_type?: {
        id: number;
        type_code: string;
    };
    created_at: string;
    updated_at: string;
}

const productTypeConfig = {
    RMP: {
        color: 'bg-blue-100 text-blue-800',
        label: 'Raw Material',
    },
    PP: {
        color: 'bg-green-100 text-green-800',
        label: 'Primary Packaging',
    },
    PS: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Secondary Packaging',
    },
}
export const columns: ColumnDef<ProductIndex>[] = [
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
        accessorKey: "sku",
        header: "SKU"
    },
    {
        accessorKey: "unit",
        header: "Unit"
    },
    {
        id: "product_type",
        accessorFn: row => row.product_type?.type_code,
        header: "Product Type",
        meta: {
            filterVariant: 'select',
        },
        cell: ({ row }) => {
            const productType = row.original.product_type?.type_code;
            const config = productTypeConfig[productType as keyof typeof productTypeConfig] || { color: 'bg-gray-200', label: 'Unknown' };
            return (
                <span className={`${config.color} text-gray-800 px-2 py-1 rounded`}>
                    {config.label}
                </span>
            );
        }
    },
    {
        id: "categories_name",
        accessorFn: row => row.categories?.name,
        header: "Category Name",
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: "created_at",
        header: "created_at",
        cell: ({ cell }) => {
            const date = new Date(cell.getValue() as string)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    },
    {
        accessorKey: "updated_at",
        header: "updated_at",
        cell: ({ cell }) => {
            const date = new Date(cell.getValue() as string)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
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
