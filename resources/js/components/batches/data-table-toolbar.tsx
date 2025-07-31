
import * as React from "react"
import { Input } from "../ui/input"
import { DataTableViewOptions } from "../data-table-view-options"
import { Button } from "../ui/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

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
    const productColumn =
        table.getColumn("product_name")
            ? Array.from(table.getColumn("product_name")!.getFacetedUniqueValues().keys()).map((value: string) => ({
                label: value,
                value: value,
            }))
            : [];

    const facetedFilter: Options[] = [
        { label: "All", value: "" },
        ...productColumn,
    ];

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter batch number..."
                    value={(table.getColumn("batch_number")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("batch_number")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("product_name") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("product_name")}
                        title="Product Name"
                        options={facetedFilter}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
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
