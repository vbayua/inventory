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
    const categoriesColumn = table.getColumn('categories_name');
    const productTypeColumn = table.getColumn('product_type');

    const categoriesFilterOptions: Option[] | undefined = categoriesColumn
        ? Array.from(categoriesColumn.getFacetedUniqueValues().keys())
              .filter((value: string | null | undefined): value is string => value != null && value !== '')
              .map((value: string) => ({
                  label: value,
                  value: value,
              }))
        : undefined;

    const productTypeFilterOptions: Option[] | undefined = productTypeColumn
        ? Array.from(productTypeColumn.getFacetedUniqueValues().keys())
              .filter((value: string | null | undefined): value is string => value != null && value !== '')
              .map((value: string) => ({
                  label: value,
                  value: value,
              }))
        : undefined;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter product name..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="h-8 w-full max-w-sm"
                />
                {productTypeColumn && productTypeFilterOptions && (
                    <DataTableFacetedFilter column={productTypeColumn} title="Product Type" options={productTypeFilterOptions} />
                )}
                {categoriesColumn?.columns.length !== 0 && categoriesFilterOptions && (
                    <DataTableFacetedFilter column={categoriesColumn} title="Category" options={categoriesFilterOptions} />
                )}
                {isFiltered && (
                    <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
                        Reset
                        <X />
                    </Button>
                )}
            </div>
        </div>
    );
}
