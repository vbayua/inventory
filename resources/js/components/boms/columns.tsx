import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { BomStatusBadge } from "./bom-status-badge";
import { Bom } from "@/types/resources";

export const columns: ColumnDef<Bom>[] = [
    {
        id: 'id',
        accessorFn: (row) => `${row.product?.sku ?? ''} ${row.product?.name ?? ''}`.trim(),
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="BoM" />
        },
        cell: ({ cell }) => {
            return <Item>
                    <ItemContent>
                        <ItemTitle className="md:text-xl">{cell.row.original.product?.sku} {cell.row.original.product?.name}</ItemTitle>
                    <ItemDescription>Date: {cell.row.original.created_at ? new Date(cell.row.original.created_at).toLocaleDateString('id-ID') : ''}</ItemDescription>
                </ItemContent>
                <ItemActions className="flex flex-col gap-4 items-end">
                    <span className="text-sm">v.{cell.row.original.version}</span>
                </ItemActions>
                </Item>
        }
    },
    {
        id: 'status',
        accessorKey: 'status',
        accessorFn: (row) => row.status,
        filterFn: 'arrIncludesSome',
        header: ({ column }) => {
            return <DataTableColumnHeader className="justify-center" column={column} title="Status" />
        },
        cell: ({ cell }) => {
            return <div className="text-center">
                <BomStatusBadge size="default" status={cell.row.original.status} />
            </div>
        }
    }
]
