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

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DataTablePagination } from '../data-table-pagination';
import { DataTableViewOptions } from '../data-table-view-options';
import { PaginationIndex } from '../ui/pagination-index';
import { DataTableToolbar } from './data-table-toolbar';
import { ta } from 'zod/v4/locales';
import { Link, router } from '@inertiajs/react';
import { Button } from '../ui/button';
import { PlusIcon } from 'lucide-react';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
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
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    

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

    const viewDetails = (row: TData) => {
        router.visit(route('purchase-orders.show', { id: (row as any).id }));
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between overflow-x-auto">
                {/* <DataTableToolbar table={table} /> */}
                <div className="">
                    <Button variant={'default'} size={'sm'} asChild>
                        <Link href={`/purchase-orders/create`}>
                            <PlusIcon />
                            Create PO
                        </Link>
                    </Button>
                </div>
                    <DataTableViewOptions table={table} />
            </div>
           <div className="grid w-full [&>div]:max-h-120 [&>div]:rounded gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="sr-only">Purchase Order List</h2>
                        <Field>
                            <Input
                                placeholder="Search..."
                                value={(table.getState().globalFilter ?? '') as string}
                                onChange={(e) => debouncedSetGlobalFilter(e.target.value)}
                                className="h-8"
                                id="globalSearch"
                                name="globalSearch"
                            />
                        </Field>
                    </div>
                <DataTableToolbar table={table} />
                </div>
                <Table className="border">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="sticky top-0 bg-background *:whitespace-nowrap after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-['']">
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
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="cursor-pointer">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} >{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
