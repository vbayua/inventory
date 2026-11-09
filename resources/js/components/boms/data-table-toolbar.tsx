import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import * as React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    options?: Option[];
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const statusOptions = [
        {
            label: 'Draft',
            value: 'draft',
            className: 'bg-amber-800 text-amber-100',
        },
        {
            label: 'Active',
            value: 'active',
            className: 'bg-blue-800 text-blue-100',
        },
        {
            label: 'Retired',
            value: 'retired',
            className: 'bg-red-800 text-red-100',
        },
    ]
    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {table.getColumn('status') && <DataTableFacetedFilter title="Status" column={table.getColumn('status')} options={statusOptions} />}
            </div>
            <div className="flex flex-1 items-center space-x-2">
               {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters();
                            table.resetGlobalFilter();
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
        </div>
    );
}
