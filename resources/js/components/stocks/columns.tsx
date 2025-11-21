import { Link, router } from '@inertiajs/react';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

type ProductType = {
    id: number;
    name?: string;
    type_code?: string;
};

type Supplier = {
    id: number;
    name?: string;
};

type Product = {
    id: number;
    name?: string;
    sku?: string;
    product_type?: ProductType;
};

type Batch = {
    id: number;
    batch_number?: string;
    supplier?: Supplier;
};

type Warehouse = {
    id: number;
    name?: string;
};

type Location = {
    id: number;
    name?: string;
    warehouse?: Warehouse;
};

type Stock = {
    id: number;
    product?: Product;
    location?: Location;
    batch?: Batch;
    status?: string;
    quantity?: number;
    unit?: string;
    minimum_quantity?: number;
    created_at?: string;
    updated_at?: string;
};

const handleCopyBatchNumber = (batchNumber: string) => {
    return function () {
        navigator.clipboard
            .writeText(batchNumber)
            .then(() => {
                toast.success('Batch number copied to clipboard');
            })
            .catch(() => {
                toast.error('Failed to copy batch number');
            });
    };
};

const handleViewStock = (id: number, product_name: any) => {
    return function () {
        router.get(
            'stocks.show',
            { id },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };
};

const handleCreateOperation = (id: number, product_name: any) => {
    return function () {
        router.get(
            `/stocks/${id}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };
};

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
    },
};

export const columns: ColumnDef<Stock>[] = [
    {
        id: 'batch_number',
        accessorKey: 'Batch Number',
        accessorFn: (row) => row.batch?.batch_number ?? '-',
        header: 'Batch Number',
        meta: {
            filterVariant: 'select',
        },
        // Explicit exact match filter
        filterFn: (row, id, value) => {
            if (!value) return true;
            const cell = row.getValue<string | undefined>(id);
            return (cell ?? '').toLowerCase() === String(value).toLowerCase();
        },
        cell: ({ row }) => row.original.batch?.batch_number ?? '-',
    },

    {
        id: 'product_name',
        accessorKey: 'Product Name',
        accessorFn: (row) => row.product?.name,
        header: 'Product Name',
        meta: {
            filterVariant: 'select',
        },
        cell: ({ row }) => row.original.product?.name ?? '-',
    },
    {
        id: 'product_type',
        accessorKey: 'Product Type',
        accessorFn: (row) => row.product?.product_type?.type_code,
        header: 'Product Type',
        meta: {
            filterVariant: 'select',
        },
        cell: ({ row }) => row.original.product?.product_type?.type_code ?? '-',
    },
    {
        id: 'supplier_name',
        accessorKey: 'Supplier',
        accessorFn: (row) => row.batch?.supplier?.name ?? '-',
        header: 'Supplier',
        meta: { filterVariant: 'select' },
        cell: ({ row }) => row.original.batch?.supplier?.name ?? '-',
    },
    {
        id: 'product_sku',
        accessorKey: 'SKU',
        accessorFn: (row) => row.product?.sku,
        header: 'SKU',
        filterFn: (row, id, value) => {
            if (!value) return true;
            const cell = row.getValue<string | undefined>(id);
            return (cell ?? '').toLowerCase() === String(value).toLowerCase();
        },
        cell: ({ row }) => row.original.product?.sku ?? '-',
    },
    {
        id: 'location_name',
        accessorKey: 'Location',
        accessorFn: (row) => row.location?.name,
        header: 'Location',
        meta: {
            filterVariant: 'select',
        },
    },
    {
        id: 'warehouse_name',
        accessorKey: 'Warehouse',
        accessorFn: (row) => row.location?.warehouse?.name, // for filtering and sorting
        header: 'Warehouse',
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: 'Quantity',
        header: 'Quantity',
        cell: ({ row }) => {
            const quantity = row.original.quantity;
            const unit = row.original.unit ?? '';
            return quantity !== undefined ? `${quantity} ${unit}` : '-';
        },
    },
    {
        accessorKey: 'minimum_qty',
        header: 'Min. Qty',
        cell: ({ row }) => {
            return row.original.minimum_quantity;
        },
        enableHiding: true,
    },
    {
        id: 'status',
        accessorKey: 'status',
        accessorFn: (row) => row.status,
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            const config = statusConfig[status as keyof typeof statusConfig] || {
                label: 'Unknown',
                color: 'bg-gray-100 text-gray-800',
                variant: 'default' as const,
            };
            return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${config.color} rounded`}>{config.label}</span>;
        },
    },
    {
        id: 'updated_at',
        accessorKey: 'Last Updated',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at ?? '');
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
        // Enable filtering by a date range passed in the column filter value
        filterFn: (row, id, value) => {
            const date = new Date(row.getValue<string>(id));
            const from = value?.from ? new Date(value.from) : undefined;
            const to = value?.to ? new Date(value.to) : undefined;

            if (from && to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                return date >= from && date <= toDate;
            }
            if (from) {
                return date >= from;
            }
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                return date <= toDate;
            }
            return true;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
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
                    <DropdownMenuItem onClick={handleCopyBatchNumber(row.original.batch?.batch_number ?? '')}>Copy Batch Number</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={route('stocks.show', { stock: row.original.id })}> View Details </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCreateOperation(row.original.id, row.original.product?.name)}>Create Operation</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
