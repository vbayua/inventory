import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowDownUp, Edit2, LogIn, Minus, MoreHorizontal, Plus } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

type OperationIndex = {
    id: number;
    operation_type: string;
    product: {
        id: number;
    } & Record<string, unknown>;
    location: {
        id: number;
    } & Record<string, unknown>;
    batch: {
        id: number;
        batch_number: string;
    } & Record<string, unknown>;
    user?: {
        id: number;
        name: string;
    } & Record<string, unknown>;
    unit: string;
    quantity: number;
    remarks: string;
    created_at: string;
    operation_date: string;
};

const operationConfig = {
    inbound: {
        id: 'inbound',
        label: 'IN',
        color: 'bg-green-200 text-green-800',
        variant: 'default' as const,
        icon: Plus,
        prefix: '+',
    },
    outbound: {
        id: 'outbound',
        label: 'OUT',
        color: 'bg-red-200 text-red-800',
        variant: 'secondary' as const,
        icon: Minus,
        prefix: '-',
    },
    initial: {
        id: 'initial',
        label: 'INITIAL',
        color: 'bg-purple-200 text-purple-800',
        variant: 'secondary' as const,
        icon: Plus,
        prefix: '+',
    },
    adjustment: {
        id: 'adjustment',
        label: 'ADJ',
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
    transfer_in: {
        id: 'transfer_in',
        label: 'TRANSFER IN',
        color: 'bg-teal-100 text-teal-800',
        variant: 'default' as const,
        icon: ArrowDownUp,
        prefix: '+',
    },
    transfer_out: {
        id: 'transfer_out',
        label: 'TRANSFER OUT',
        color: 'bg-indigo-100 text-indigo-800',
        variant: 'default' as const,
        icon: ArrowDownUp,
        prefix: '-',
    },
    return: {
        id: 'return',
        label: 'RETURN',
        color: 'bg-cyan-100 text-cyan-800',
        variant: 'default' as const,
        icon: ArrowDown,
        prefix: '+',
    },
};

export const columns: ColumnDef<OperationIndex>[] = [
    {
        accessorKey: 'operation_date',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Tanggal Operasi" />;
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
        filterFn: (row, id, value) => {
            // value is expected to be a DateRange from react-day-picker: { from?: Date; to?: Date }
            if (!value || (!value.from && !value.to)) {
                return true;
            }
            const rowDate = new Date(row.original.operation_date);

            const normalizeStartOfDay = (d: Date) => {
                const nd = new Date(d);
                nd.setHours(0, 0, 0, 0);
                return nd;
            };

            const normalizeEndOfDay = (d: Date) => {
                const nd = new Date(d);
                nd.setHours(23, 59, 59, 999);
                return nd;
            };

            const hasFrom = !!value.from;
            const hasTo = !!value.to;

            if (hasFrom && hasTo) {
                const start = normalizeStartOfDay(value.from as Date);
                const end = normalizeEndOfDay(value.to as Date);
                return rowDate >= start && rowDate <= end;
            }
            if (hasFrom) {
                const start = normalizeStartOfDay(value.from as Date);
                return rowDate >= start;
            }
            if (hasTo) {
                const end = normalizeEndOfDay(value.to as Date);
                return rowDate <= end;
            }
            return true;
        },
    },
    {
        id: 'batch_number',
        accessorFn: (row) => row.batch?.batch_number,
        header: 'No. Batch',
        meta: {
            filterVariant: 'select',
        },
    },
    {
        id: 'product_name',
        accessorFn: (row) => row.product?.name,
        header: 'Nama Product',
        meta: {
            filterVariant: 'select',
        },
    },
    {
        accessorKey: 'operation_type',
        header: 'Operasi Stok',
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
        header: 'Lokasi',
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
        cell: ({ row }) => {
            return (
                <div className="max-w-sm truncate" title={row.original.remarks}>
                    {row.original.remarks ?? '-'}
                </div>
            );
        },
    },
    {
        id: 'User',
        accessorFn: (row) => row.user?.name || 'System',
        header: 'By',
        enableHiding: true,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const operation = row.original;
            const viewOperation = route('operations.show', { id: operation.id });
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
                                View Detail
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
