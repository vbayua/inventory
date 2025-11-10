import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown, LogIn, MinusCircle } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'
import { ArrowDown, ArrowUp, PlusCircle, Edit2 } from 'lucide-react';


type Batch = {
    id: number;
    batch_number: string;
    [key: string]: any; // Adjust this type based on your batch structure
}

type Product = {
    id: number;
    name: string;
    [key: string]: any; // Adjust this type based on your product structure
}

type Location = {
    id: number;
    name: string;
    [key: string]: any; // Adjust this type based on your location structure
}


type Stock = {
    id: number;
    name: string;
    location?: Location;
    product?: Product;
    batch?: Batch;
    [key: string]: any; // Adjust this type based on your stock structure
}

type AdjustmentIndex = {
    id: number;
    stock?: Stock;
    adjustment_type: string;
    unit: string;
    quantity: number;
    remarks: string;
    created_at: string;
    operation_date: string;
}

const adjustmentConfig = {
    addition: {
        id: 'addition',
        label: 'Addition',
        color: 'bg-green-100 text-green-800',
        variant: 'default' as const,
        icon: PlusCircle,
    },
    subtraction: {
        id: 'subtraction',
        label: 'Subtraction',
        color: 'bg-red-100 text-red-800',
        variant: 'destructive' as const,
        icon: MinusCircle,
    },
}

export const columns: ColumnDef<AdjustmentIndex>[] = [
    {
        id: "batch_number",
        accessorFn: row => row.stock?.batch?.batch_number,
        header: "Batch Number",
        meta: {
            filterVariant: 'select',
        },
    },
    {
        id: "product_name",
        accessorFn: row => row.stock?.product?.name,
        header: "Product Name",
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: "adjustment_type",
        header: "Adjustment Type",
        cell: ({ row }) => {
            const adjustmentType = row.original.adjustment_type;
            const config = adjustmentConfig[adjustmentType as keyof typeof adjustmentConfig] || {
                label: 'Unknown',
                color: 'bg-gray-100 text-gray-800',
                variant: 'default' as const,
            };
            return (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${config.color} rounded`}>
                    {config.icon && <config.icon className="mr-1 h-4 w-4" />}
                    {config.label}
                </span>
            );
        }
    },
    {
        id: "quantity",
        accessorFn: row => row.quantity,
        header: "Quantity",
    },
    {
        id: "unit",
        accessorFn: row => row.unit,
        header: "Unit",
    },
    {
        id: "location_name",
        accessorFn: row => row.stock?.location?.name,
        header: "Location",
        meta: {
            filterVariant: 'select',
        },
        enableHiding: true,
    },
    {
        id: "remarks",
        accessorFn: row => row.remarks,
        header: "Remarks",
        enableHiding: true,
    },
    {
        accessorKey: "adjustment_date",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader
                    column={column}
                    title="Operation Date"
                />
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.created_at)
            const localeDateString = date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
            return (
                <span className="text-sm text-muted-foreground" >
                    {localeDateString}
                </span >
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const stockId = row.original.stock?.id
            const viewStock = route('stocks.show', { id: stockId })
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
                            <Link href={viewStock} className={'w-full'}>
                                View Stock Details
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
