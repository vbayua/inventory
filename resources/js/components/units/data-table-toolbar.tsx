
import * as React from "react"
import { Input } from "../ui/input"
import { DataTableViewOptions } from "../data-table-view-options"
import { Button } from "../ui/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

interface UnitOption {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
};

interface DataTableToolbarProps<TData> {
    table: Table<TData>,
    options?: UnitOption[]
}

export function DataTableToolbar<TData>({
    table,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const unitColumn =
        table.getColumn("base_unit")
            ? Array.from(table.getColumn("base_unit")!.getFacetedUniqueValues().keys()).map((value: string) => ({
                label: value,
                value: value,
            }))
            : [];
    // console.log("Warehouse Column:", unitColumn)

    const facetedFilter: UnitOption[] = [
        { label: "All", value: "" },
        ...unitColumn,
    ];

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {/* <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
                    }
                /> */}
                <Input
                    placeholder="Filter unit..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                // className="max-w-sm"
                />
                {table.getColumn("base_unit") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("base_unit")}
                        title="Base Unit"
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
            <DataTableViewOptions table={table} />
        </div>
    )
}
