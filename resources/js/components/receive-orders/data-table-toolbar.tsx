import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
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

interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    options?: Option[];
}

const quickDateTemplates = [
    { label: 'Hari Ini', value: 'today' },
    { label: 'Minggu Ini', value: 'this_week' },
    { label: 'Bulan Ini', value: 'this_month' },
    { label: 'Tahun Ini', value: 'this_year' },
];

function resolveQuickDate(value: string): { from: Date; to: Date } {
    const now = new Date();
    switch (value) {
        case 'today': {
            const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return { from, to: from };
        }
        case 'this_week': {
            const firstDayOfWeek = now.getDate() - now.getDay();
            const from = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
            const to = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek + 6);
            return { from, to };
        }
        case 'this_month': {
            const from = new Date(now.getFullYear(), now.getMonth(), 1);
            const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { from, to };
        }
        case 'this_year': {
            const from = new Date(now.getFullYear(), 0, 1);
            const to = new Date(now.getFullYear(), 11, 31);
            return { from, to };
        }
        default:
            return { from: now, to: now };
    }
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

    const supplierColumn = table.getColumn('supplier');
    const receiveDateColumn = table.getColumn('receive_date');

    const supplierFilterOptions = supplierColumn
        ? Array.from(supplierColumn.getFacetedUniqueValues().entries()).map(([value]) => ({
              label: String(value),
              value: String(value),
          }))
        : null;

    React.useEffect(() => {
        receiveDateColumn?.setFilterValue(dateRange);
    }, [dateRange, receiveDateColumn]);

    const handleReset = () => {
        table.resetColumnFilters();
        table.resetGlobalFilter();
        setDateRange(undefined);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <span className="text-muted-foreground text-sm">Cari: </span>
                <Input
                    placeholder="Search PO or RO number"
                    value={(table.getState().globalFilter as string) ?? ''}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className="focus:border-primary h-12 w-full max-w-sm focus:ring-0"
                />
                <span className="text-muted-foreground text-sm">Filter: </span>
                {supplierColumn && supplierFilterOptions && (
                    <DataTableFacetedFilter column={supplierColumn} title="Supplier" options={supplierFilterOptions} />
                )}
                {receiveDateColumn && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
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
                                    <span>Receive Date Range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar autoFocus mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                        </PopoverContent>
                    </Popover>
                )}
                {receiveDateColumn && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 px-2 lg:px-3">
                                Quick Date
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto p-0" align="start">
                            {quickDateTemplates.map((item) => (
                                <Button
                                    key={item.value}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => setDateRange(resolveQuickDate(item.value))}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {(isFiltered || dateRange) && (
                    <Button variant="ghost" onClick={handleReset} className="h-8 px-2 lg:px-3">
                        Reset
                        <X />
                    </Button>
                )}
            </div>
        </div>
    );
}
