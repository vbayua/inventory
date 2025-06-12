
import * as React from "react"
import { Input } from "../input"
import { DataTableViewOptions } from "../../data-table-view-options"
import { Button } from "../button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

interface Option {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
};

interface DataTableToolbarProps<TData> {
    table: Table<TData>,
    options?: Option[],
    filterColumn: string
}

export function DataTableToolbar<TData>({
    table,
    filterColumn
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    let columns: Option[] = [];
    let filter = null;

    filter = table.getColumn(filterColumn) ?? table.getAllColumns()[0]

    if (filter) {
        columns = table.getColumn(filterColumn) ? Array.from(table.getColumn(filterColumn)!.getFacetedUniqueValues().keys()).map((value: string) => ({
            label: value,
            value: value,
        })) : [];
    }

    const facetedFilter: Option[] = [
        { label: "All", value: "" },
        ...columns,
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
                    placeholder="Filter locaton name..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                // className="max-w-sm"
                />
                {table.getColumn(filterColumn) && (
                    <DataTableFacetedFilter
                        column={table.getColumn(filterColumn)}
                        title={filter.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} options={facetedFilter}
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
