import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { BomStatusBadge } from "./bom-status-badge";
import { Bom } from "@/types/resources";

export const columns: ColumnDef<Bom>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="BoM" />
        },
        cell: ({ cell }) => {
            return <Item>
                    <ItemContent>
                        <ItemTitle className="md:text-xl">{cell.row.original.product?.sku} {cell.row.original.product?.name}</ItemTitle>
                    <ItemDescription>{}</ItemDescription>
                </ItemContent>
                <ItemActions className="flex flex-col gap-4 items-end">
                    <BomStatusBadge status={cell.row.original.status} />
                    <span className="text-sm">Created: {cell.row.original.created_at ? new Date(cell.row.original.created_at).toLocaleDateString('id-ID') : ''}</span>
                </ItemActions>
                </Item>
        }
    },
]
