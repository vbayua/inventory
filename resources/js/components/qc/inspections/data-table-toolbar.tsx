import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { Table } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { Input } from '../../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
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
        table.getColumn('inspection_date')?.setFilterValue(dateRange);
    }, [dateRange, table]);

    const productColumn = table.getColumn('product')
        ? Array.from(table.getColumn('product')!.getFacetedUniqueValues().keys()).map((value: string) => ({
              label: value,
              value: value,
          }))
        : [];

    const products: Options[] = [
        { label: 'All', value: '' },
        ...productColumn, // Assuming warehouse names are similar to location names
    ];

    // const productTypeColumn = table.getColumn('product_type')
    //     ? Array.from(table.getColumn('product_type')!.getFacetedUniqueValues().keys()).map((value: string) => ({
    //           label: value,
    //           value: value,
    //       }))
    //     : [];

    // const productTypes: Options[] = [{ label: 'All', value: '' }, ...productTypeColumn];

    const status: Options[] = [
        { label: 'All', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Checking', value: 'checking' },
        { label: 'Pass', value: 'pass' },
        { label: 'Reject', value: 'reject' },
        { label: 'Partial Pass', value: 'partial_pass' },
    ];

    const approvalStatus: Options[] = [
        { label: 'All', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Reject', value: 'reject' },
    ];

    const quickDateTemplate = [
        { label: 'Hari Ini', value: 'today' },
        { label: 'Minggu Ini', value: 'this_week' },
        { label: 'Bulan Ini', value: 'this_month' },
        { label: 'Tahun Ini', value: 'this_year' },
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
    }, [url, table]);
    return (
        <div className="flex flex-col">
            <div>
                <p>Filters: {isFiltered ? 'Active' : 'None'}</p>
            </div>
            <div className="flex flex-1 items-center space-x-2">
                <span className="text-sm font-medium">Cari:</span>
                <Input
                    placeholder="Search..."
                    value={(table.getState().globalFilter as string) ?? ''}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className="w-full max-w-sm"
                />
                {/*{table.getColumn('product_type') && (
                    <DataTableFacetedFilter column={table.getColumn('product_type')} title="Product Type" options={productTypes} />
                )}*/}
                {table.getColumn('status') && <DataTableFacetedFilter column={table.getColumn('status')} title="Status" options={status} />}
                {table.getColumn('approval') && (
                    <DataTableFacetedFilter column={table.getColumn('approval')} title="Approval Status" options={approvalStatus} />
                )}
                {table.getColumn('inspection_date') && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn('h-8 w-62.5 justify-start text-left font-normal', !dateRange && 'text-muted-foreground')}
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
                            <Calendar autoFocus mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                        </PopoverContent>
                    </Popover>
                )}
                {table.getColumn('inspection_date') && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 px-2 lg:px-3">
                                Quick Date
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto p-0" align="start">
                            {quickDateTemplate.map((item) => (
                                <Button
                                    key={item.value}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        const now = new Date();
                                        let from: Date;
                                        let to: Date;

                                        switch (item.value) {
                                            case 'today':
                                                from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                to = from;
                                                break;
                                            case 'this_week':
                                                const firstDayOfWeek = now.getDate() - now.getDay();
                                                from = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
                                                to = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek + 6);
                                                break;
                                            case 'this_month':
                                                from = new Date(now.getFullYear(), now.getMonth(), 1);
                                                to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                                break;
                                            case 'this_year':
                                                from = new Date(now.getFullYear(), 0, 1);
                                                to = new Date(now.getFullYear(), 11, 31);
                                                break;
                                            default:
                                                from = now;
                                                to = now;
                                        }

                                        setDateRange({ from, to });
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
