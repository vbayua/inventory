import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { MoreHorizontal } from 'lucide-react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu'

interface StockIndex {
    id: number;
    product?: {
        id: number;
        name?: string;
        [key: string]: any;
    };
    location?: {
        id: number;
        name?: string;
        warehouse?: {
            id: number;
            name?: string;
            [key: string]: any;
        };
        [key: string]: any;
    };
    batch?: {
        id: number;
        batch_number?: string;
        [key: string]: any;
    };
    status?: string;
    unit?: string;
    quantity?: number;
    created_at?: string;
    updated_at?: string;
}

const handleCopyBatchNumber = (batchNumber: string) => {
    return function () {
        navigator.clipboard.writeText(batchNumber)
            .then(() => {
                toast.success('Batch number copied to clipboard');
            })
            .catch(() => {
                toast.error('Failed to copy batch number');
            });
    }
}

const handleViewStock = (id: number) => {
    return function () {
        router.get(`/stocks/${id}`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }
}

const statusConfig = {
    available: {
        label: 'Available',
        color: 'bg-green-100 text-green-800',
        variant: 'default' as const,
    },
    low_stock: {
        label: 'Low Stock',
        color: 'bg-yellow-100 text-yellow-800',
        variant: 'secondary' as const,
    },
    out_of_stock: {
        label: 'Out of Stock',
        color: 'bg-red-100 text-red-800',
        variant: 'destructive' as const,
    },
    reserved: {
        label: 'Reserved',
        color: 'bg-blue-100 text-blue-800',
        variant: 'outline' as const,
    }
}

export const columns: ColumnDef<StockIndex>[] = [
    {
        id: "batch_number",
        accessorFn: row => row.batch?.batch_number ?? '-',
        header: "Batch Number",
        meta: {
            filterVariant: 'select',
        },
        cell: ({ row }) => row.original.batch?.batch_number ?? '-',
    },
    {
        accessorKey: "product.name",
        header: "Product Name",
        meta: {
            filterVariant: 'select',
        },
        cell: ({ row }) => row.original.product?.name ?? '-',
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
        id: "warehouse_name",
        accessorFn: row => row.location?.warehouse?.name, // for filtering and sorting
        header: "Warehouse",
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            const unit = row.original.unit ?? '';
            return quantity !== undefined ? `${quantity} ${unit}` : '-';
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const config = statusConfig[status as keyof typeof statusConfig] || {
                label: 'Unknown',
                color: 'bg-gray-100 text-gray-800',
                variant: 'default' as const,
            };
            return (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${config.color} rounded`}>
                    {config.label}
                </span>
            );
        }
    },
    {
        accessorKey: "updated_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Last Updated" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at ?? '');
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    },
    {
        id: 'actions',
        enableHiding: false,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={handleCopyBatchNumber(row.original.batch?.batch_number ?? '')}
                    >
                        Copy Batch Number
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleViewStock(row.original.id)}
                    >
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-emerald-800'>
                        Create Operation
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    }
]
