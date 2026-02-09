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
    const supplierColumn = table.getColumn('supplier');

    const supplierFilterOptions = supplierColumn
        ? Array.from(supplierColumn.getFacetedUniqueValues().entries()).map(([value]) => ({
              label: String(value),
              value: String(value),
          }))
        : null;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <span className="text-muted-foreground text-sm">Cari: </span>
                <Input
                    placeholder="Nama Produk atau Kode Item"
                    value={(table.getState().globalFilter as string) ?? ''}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className="focus:border-primary h-12 w-full max-w-sm focus:ring-0"
                />
                <span className="text-muted-foreground text-sm">Filter: </span>
                {supplierColumn && supplierFilterOptions && (
                    <DataTableFacetedFilter column={supplierColumn} title="Supplier" options={supplierFilterOptions} />
                )}
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
