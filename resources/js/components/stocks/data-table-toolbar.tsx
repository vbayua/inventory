import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { Table } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface Options {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    options?: Options[];
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

    React.useEffect(() => {
        table.getColumn('updated_at')?.setFilterValue(dateRange);
    }, [dateRange, table]);

    const productColumn = table.getColumn('product_name')
        ? Array.from(table.getColumn('product_name')!.getFacetedUniqueValues().keys()).map((value: string) => ({
              label: value,
              value: value,
          }))
        : [];

    const products: Options[] = [
        { label: 'All', value: '' },
        ...productColumn, // Assuming warehouse names are similar to location names
    ];

    const productTypeColumn = table.getColumn('product_type')
        ? Array.from(table.getColumn('product_type')!.getFacetedUniqueValues().keys()).map((value: string) => ({
              label: value,
              value: value,
          }))
        : [];

    const productTypes: Options[] = [{ label: 'All', value: '' }, ...productTypeColumn];

    const status: Options[] = [
        { label: 'All', value: '' },
        { label: 'Available', value: 'available' },
        { label: 'Low Stock', value: 'low_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' },
        { label: 'Reserved', value: 'reserved' },
    ];

    const handleReset = () => {
        table.resetColumnFilters();
        setDateRange(undefined);
    };
    const url = usePage().url;
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const productSku = params.get('product_sku');
        // set global filter value
        table.setGlobalFilter(productSku ?? '');
    }, [url]);
    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <span className="text-sm font-medium">Cari:</span>
                <Input
                    placeholder="Search batch or product"
                    value={(table.getState().globalFilter as string) ?? ''}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className="h-12 w-full max-w-sm"
                />
                <span className="text-sm font-medium">Filter:</span>
                {table.getColumn('product_type') && (
                    <DataTableFacetedFilter column={table.getColumn('product_type')} title="Product Type" options={productTypes} />
                )}
                {table.getColumn('status') && <DataTableFacetedFilter column={table.getColumn('status')} title="Status" options={status} />}
                {table.getColumn('updated_at') && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn('h-8 w-[250px] justify-start text-left font-normal', !dateRange && 'text-muted-foreground')}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'LLL dd, y')
                                    )
                                ) : (
                                    <span>Last Update Range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar initialFocus mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                        </PopoverContent>
                    </Popover>
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            handleReset();
                            table.resetGlobalFilter();
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset Filters
                        <X />
                    </Button>
                )}
            </div>
        </div>
    );
}
