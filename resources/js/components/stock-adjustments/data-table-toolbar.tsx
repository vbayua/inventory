
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

    const batchColumn = table.getColumn("batch_number")
        ? Array.from(table.getColumn("batch_number")!.getFacetedUniqueValues().keys()).map((value: string) => ({
            label: value,
            value: value,
        }))
        : [];

    const adjustmentType = [
        { label: "Addition", value: "addition" },
        { label: "Subtraction", value: "subtraction" },
    ]
    const productFacetedFilter: Options[] = [
        { label: "All", value: "" },
        ...productColumn,
    ];

    const batchFacetedFilter: Options[] = [
        { label: "All", value: "" },
        ...batchColumn,
    ];

    const adjustmentTypeFacetedFilter: Options[] = [
        { label: "All", value: "" },
        ...adjustmentType,
    ];

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search batch or product"
                    value={(table.getState().globalFilter as string) ?? ""}
                    onChange={(event) =>
                        table.setGlobalFilter(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("batch_number") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("batch_number")}
                        title="Batch"
                        options={batchFacetedFilter}
                    />
                )}
                {table.getColumn("adjustment_type") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("adjustment_type")}
                        title="Adjustment Type"
                        options={adjustmentTypeFacetedFilter}
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
