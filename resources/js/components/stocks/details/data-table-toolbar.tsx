import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Table } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';
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
        table.getColumn('operation_date')?.setFilterValue(dateRange);
    }, [dateRange, table]);
    const productColumn = table.getColumn('product_name')
        ? Array.from(table.getColumn('product_name')!.getFacetedUniqueValues().keys()).map((value: string) => ({
              label: value,
              value: value,
          }))
        : [];

    const batchColumn = table.getColumn('batch_number')
        ? Array.from(table.getColumn('batch_number')!.getFacetedUniqueValues().keys()).map((value: string) => ({
              label: value,
              value: value,
          }))
        : [];

    const operationType = [
        { label: 'Initial', value: 'initial' },
        { label: 'Inbound', value: 'inbound' },
        { label: 'Oubound', value: 'outbound' },
        { label: 'Transfer', value: 'transfer' },
        { label: 'Adjustment', value: 'adjustment' },
    ];

    const operationDateTemplate = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'this_week' },
        { label: 'This Month', value: 'this_month' },
        { label: 'This Year', value: 'this_year' },
    ];

    const productFacetedFilter: Options[] = [{ label: 'All', value: '' }, ...productColumn];

    const batchFacetedFilter: Options[] = [{ label: 'All', value: '' }, ...batchColumn];

    const operationTypeFacetedFilter: Options[] = [{ label: 'All', value: '' }, ...operationType];

    const handleReset = () => {
        table.resetColumnFilters();
        setDateRange(undefined);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {table.getColumn('batch_number') && (
                    <DataTableFacetedFilter column={table.getColumn('batch_number')} title="Batch" options={batchFacetedFilter} />
                )}
                {table.getColumn('operation_type') && (
                    <DataTableFacetedFilter column={table.getColumn('operation_type')} title="Operation Type" options={operationTypeFacetedFilter} />
                )}
                {table.getColumn('operation_date') && (
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
                                    <span>Operation Date Range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar initialFocus mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                        </PopoverContent>
                    </Popover>
                )}
                {table.getColumn('operation_date') && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 px-2 lg:px-3">
                                Quick Date
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto p-0" align="start">
                            {operationDateTemplate.map((item) => (
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
                        Reset
                        <X />
                    </Button>
                )}
            </div>
        </div>
    );
}
