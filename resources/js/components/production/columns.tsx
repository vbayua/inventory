import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Production } from "@/types/resources";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<Production>[] = [
    {
        accessorKey: 'plan_number',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Plan Number" />
        },
        cell: ({ cell }) => {
            return <Item>
                    <ItemContent>
                    <ItemTitle>{cell.getValue() as string}</ItemTitle>
                    <ItemDescription>{cell.row.original.product?.name}</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Badge variant={'outline'} className="capitalize">
                        {cell.row.original.status as string}
                    </Badge>
                </ItemActions>
                </Item>
        }
    },
]
