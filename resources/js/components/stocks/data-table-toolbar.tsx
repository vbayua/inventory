
import * as React from "react"
import { Input } from "../ui/input"
import { DataTableViewOptions } from "../data-table-view-options"
import { Button } from "../ui/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { title } from "process"
import { stat } from "fs"
import { DataTable } from "./data-table"

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
