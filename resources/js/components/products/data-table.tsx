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

import { DataTablePagination } from '../data-table-pagination';
import { DataTableViewOptions } from '../data-table-view-options';
import { PaginationIndex } from '../ui/pagination-index';
import { DataTableToolbar } from './data-table-toolbar';
import { Input } from '../ui/input';
import { Field } from '../ui/field';
// import { DataTablePagination } from "../data-table-pagination"
// import { Input } from "../ui/input"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    links?: any[];
    clientSide?: boolean;
}

export function DataTable<TData, TValue>({ columns, data, links, clientSide = false }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFIlters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        brand_name: false,
        scientific_name: false,
        categories_name: false,
        created_at: false,
        // other columns default to true unless specified
    });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFIlters,
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
                <div className="flex items-center space-x-2">
                    <DataTableViewOptions table={table} />
                </div>
            </div>
            <div className="grid w-full [&>div]:max-h-120 [&>div]:rounded gap-4">
                <div className="flex flex-col gap-4 md:flex-row sm:justify-between">
                    <div>
                    <Field>
                        <Input
                            placeholder="Search"
                            value={(table.getState().globalFilter as string) ?? ''}
                            onChange={(event) => table.setGlobalFilter(event.target.value)}
                            className="w-2xl max-w-4xl sm:w-full"
                            id="global-filter"
                            aria-label="Global Filter"
                            autoComplete="off"
                        />
                    </Field>
                    </div>
                    <div>
                        <DataTableToolbar table={table} />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="sticky top-0 bg-background *:whitespace-nowrap after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-['']">
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
                <div className="mb-4">
                    {data.length > 0 && links && <PaginationIndex links={links} />}
                    {clientSide && <DataTablePagination table={table} />}
                </div>
            </div>
        </div>
    );
}
