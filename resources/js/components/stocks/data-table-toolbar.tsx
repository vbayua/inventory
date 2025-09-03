
import * as React from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Table } from "@tanstack/react-table"
import { CalendarIcon, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface Options {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
};

interface DataTableToolbarProps<TData> {
    table: Table<TData>,
    options?: Options[]
}

export function DataTableToolbar<TData>({
    table,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

    React.useEffect(() => {
        table.getColumn("updated_at")?.setFilterValue(dateRange)
    }, [dateRange, table])

    const productColumn = table.getColumn("product_name")
        ? Array.from(table.getColumn("product_name")!.getFacetedUniqueValues().keys()).map((value: string) => ({
            label: value,
            value: value,
        }))
        : [];

    const products: Options[] = [
        { label: "All", value: "" },
        ...productColumn, // Assuming warehouse names are similar to location names
    ];

    const status: Options[] = [
        { label: "All", value: "" },
        { label: "Available", value: "available" },
        { label: "Low Stock", value: "low_stock" },
        { label: "Out of Stock", value: "out_of_stock" },
        { label: "Reserved", value: "reserved" },
    ];

    const handleReset = () => {
        table.resetColumnFilters()
        setDateRange(undefined)
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search batch e.g. BATCH-1234"
                    value={(table.getColumn("batch_number")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("batch_number")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("product_name") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("product_name")}
                        title="Product"
                        options={products}
                    />
                )}
                {table.getColumn("status") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("status")}
                        title="Status"
                        options={status}
                    />
                )}
                {table.getColumn("updated_at") && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "h-8 w-[250px] justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} - {" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Last updated</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>

        </div>
    )
}
