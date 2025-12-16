import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import * as React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface WarehouseOption {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    options?: WarehouseOption[];
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const warehouseColumn = table.getColumn('name')
        ? Array.from(table.getColumn('name')!.getFacetedUniqueValues().keys()).map((value: string) => ({
              label: value,
              value: value,
          }))
        : [];
    // console.log("Warehouse Column:", warehouseColumn)

    const facetedFilter: WarehouseOption[] = [{ label: 'All', value: '' }, ...warehouseColumn];

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {/* <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
                    }
                /> */}
                <span className="text-muted-foreground text-sm">Cari: </span>

                <Input
                    placeholder="Filter warehouse name..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="focus:border-primary h-12 w-full max-w-sm focus:ring-0"

                    // className="max-w-sm"
                />
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
