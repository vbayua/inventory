import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Edit2, LogIn, MoreHorizontal, PlusCircle } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

type OperationIndex = {
    id: number;
    operation_type: string;
    product: {
        id: number;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    location: {
        id: number;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    batch: {
        id: number;
        batch_number: string;
        [key: string]: any; // Adjust this type based on your warehouse structure
    };
    user?: {
        id: number;
        name: string;
        [key: string]: any; // Adjust this type based on your user structure
    };
    unit: string;
    quantity: number;
    remarks: string;
    created_at: string;
    operation_date: string;
};

const operationConfig = {
    inbound: {
        id: 'inbound',
        label: 'Inbound',
        color: 'bg-green-100 text-green-800',
        variant: 'default' as const,
        icon: ArrowDown,
    },
    outbound: {
        id: 'outbound',
        label: 'Outbound',
        color: 'bg-blue-100 text-blue-800',
        variant: 'secondary' as const,
        icon: ArrowUp,
    },
    initial: {
        id: 'initial',
        label: 'Initial',
        color: 'bg-purple-100 text-purple-800',
        variant: 'secondary' as const,
        icon: PlusCircle,
    },
    adjustment: {
        id: 'adjustment',
        label: 'Adjustment',
        color: 'bg-yellow-100 text-yellow-800',
        variant: 'outline' as const,
        icon: Edit2,
    },
    transfer: {
        id: 'transfer',
        label: 'Transfer',
        color: 'bg-indigo-100 text-indigo-800',
        variant: 'default' as const,
        icon: LogIn,
    },
};

export const columns: ColumnDef<OperationIndex>[] = [
    {
        id: 'batch_number',
        accessorFn: (row) => row.batch?.batch_number,
        header: 'Batch Number',
        meta: {
            filterVariant: 'select',
        },
    },
    {
        id: 'product_name',
        accessorFn: (row) => row.product?.name,
        header: 'Product Name',
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: 'operation_type',
        header: 'Operation Type',
        cell: ({ row }) => {
            const operationType = row.original.operation_type;
            const config = operationConfig[operationType as keyof typeof operationConfig] || {
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
        },
    },
    {
        id: 'quantity',
        accessorFn: (row) => row.quantity,
        header: 'Quantity',
    },
    {
        id: 'unit',
        accessorFn: (row) => row.unit,
        header: 'Unit',
    },
    {
        id: 'location_name',
        accessorFn: (row) => row.location?.name,
        header: 'Location',
        meta: {
            filterVariant: 'select',
        },
        enableHiding: true,
    },
    {
        id: 'remarks',
        accessorFn: (row) => row.remarks,
        header: 'Remarks',
        enableHiding: true,
    },
    {
        accessorKey: 'operation_date',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Operation Date" />;
        },
        cell: ({ row }) => {
            const date = new Date(row.original.operation_date);
            const localeDateString = date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            return <span className="text-muted-foreground text-sm">{localeDateString}</span>;
        },
    },
    {
        id: 'User',
        accessorFn: (row) => row.user?.name || 'System',
        header: 'Performed By',
        enableHiding: true,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const operation = row.original;
            const viewOperation = route('operations.show', { id: operation.id });
            const editOperation = route('operations.edit', { id: operation.id });
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Link href={viewOperation} className={'w-full'}>
                                View Operation
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editOperation} className={'w-full'}>
                                Edit Operation
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
