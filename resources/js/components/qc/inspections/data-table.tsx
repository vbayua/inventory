import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '../../data-table-pagination';
import { DataTableViewOptions } from '../../data-table-view-options';
import { PaginationIndex } from '../../ui/pagination-index';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    links?: any[];
    clientSide?: boolean;
}

export function DataTable<TData, TValue>({ columns, data, links, clientSide = false }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        warehouse_name: false,
        minimum_qty: false,
        updated_at: false,
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });
    return (
        <div>
            <div className="mb-4 flex items-center justify-end overflow-x-auto">
                {/*<DataTableToolbar table={table} />*/}
                <DataTableViewOptions table={table} />
            </div>
            <div className="grid w-full gap-4 overflow-x-auto [&>div]:max-h-120 [&>div]:rounded">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div>
                        <h2 className="sr-only">QC Inspection List</h2>
                        <Field>
                            <Input
                                placeholder="search"
                                value={(table.getState().globalFilter ?? '') as string}
                                onChange={(e) => table.setGlobalFilter(e.target.value)}
                                className="h-8 w-2xl max-w-3xl sm:w-full"
                                id="global-filter"
                                aria-label="global filter"
                                autoComplete="off"
                            />
                        </Field>
                    </div>
                    <div>
                        <DataTableToolbar table={table} />
                    </div>
                </div>
                <Table className="border">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="my-4">
                {data.length > 0 && links && <PaginationIndex links={links} />}
                {clientSide && <DataTablePagination table={table} />}
            </div>
        </div>
    );
}
