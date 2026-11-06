import { DataTableFacetedFilter } from '@/components/ui/datatable/data-table-faceted-filter';
import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { DataTableViewOptions } from '../data-table-view-options';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function DataTableToolbar<TData>({ table, roleNames }: { table: Table<TData>; roleNames: string[] }) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const roleOptions = roleNames.map((roleName) => ({ label: capitalize(roleName), value: roleName }));

    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter by name or email..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn('roles') && <DataTableFacetedFilter column={table.getColumn('roles')} title="Role" options={roleOptions} />}
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
