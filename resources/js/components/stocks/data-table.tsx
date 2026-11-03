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

import { Link } from '@inertiajs/react';
import { ChevronDown, Database, PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { DataTablePagination } from '../data-table-pagination';
import { DataTableViewOptions } from '../data-table-view-options';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
import { PaginationIndex } from '../ui/pagination-index';
import { DataTableToolbar } from './data-table-toolbar';
import { ButtonGroup } from '../ui/button-group';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    links?: any[];
    clientSide?: boolean;
    onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({ columns, data, links, clientSide = false, onRowClick }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [searchInput, setSearchInput] = React.useState<boolean>(false);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        batch_number: false,
        product_type: false,
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
            <div className="mb-4 flex items-center justify-between overflow-x-auto">
                {/*<DataTableToolbar table={table} />*/}
            </div>
            <div className="grid w-full gap-4 overflow-x-auto [&>div]:max-h-200 [&>div]:rounded">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div>
                        <Field>
                            <Button variant="outline" size="sm" type="button" onClick={() => setSearchInput(true)} className={searchInput ? "hidden" : "w-full max-w-sm"}><SearchIcon /></Button>
                            {
                                searchInput && <ButtonGroup className="flex gap-2">
                                    <Input
                                        placeholder="Cari..."
                                        value={(table.getState().globalFilter as string) ?? ''}
                                        onChange={(event) => table.setGlobalFilter(event.target.value)}
                                        className="w-full max-w-sm"
                                    />
                                    <Button onClick={() => setSearchInput(false)} variant="ghost" className="hover:bg-red-500" type="button"><XIcon /></Button>
                                </ButtonGroup>
                            }
                        </Field>
                    </div>
                    <div>
                        <DataTableToolbar table={table} />
                    </div>
                </div>

                <Table className="overflow-x-auto ">
                    <TableHeader className="bg-background after:bg-border sticky top-0 *:whitespace-nowrap after:absolute after:inset-x-0 after:bottom-0 after:h-px after:content-['']">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} style={{ width: header.column.getSize() }}>
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
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : undefined}
                                    tabIndex={onRowClick ? 0 : undefined}
                                    onDoubleClick={() => onRowClick?.(row.original)}
                                    onKeyDown={(event) => {
                                        if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                                            event.preventDefault();
                                            onRowClick(row.original);
                                        }
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
