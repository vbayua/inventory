import { DataTableFacetedFilter } from '@/components/ui/datatable/data-table-faceted-filter';
import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { DataTableViewOptions } from '../data-table-view-options';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ROLE_USAGE_IN_USE, ROLE_USAGE_UNUSED } from './columns';

const usageOptions = [
    { label: ROLE_USAGE_IN_USE, value: ROLE_USAGE_IN_USE },
    { label: ROLE_USAGE_UNUSED, value: ROLE_USAGE_UNUSED },
];

export function DataTableToolbar<TData>({ table }: { table: Table<TData> }) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter roles..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn('usage') && <DataTableFacetedFilter column={table.getColumn('usage')} title="Usage" options={usageOptions} />}
                {isFiltered && (
                    <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
