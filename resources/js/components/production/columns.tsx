import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Production } from "@/types/resources";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Badge } from "../ui/badge";

const badgeVariant = {
    draft: {
        label: 'Draft',
        variant: 'outline',
        style: 'bg-yellow-800 text-yellow-100 border border-yellow-100'
    },
    released: {
        label: 'Released',
        variant: 'default',
        style: 'bg-blue-800/20 text-blue-100 border border-blue-100'
    },
    in_progress: {
        label: 'In Progress',
        variant: 'default',
        style: 'bg-blue-800 text-blue-100 border border-blue-100'
    },
    completed: {
        label: 'Completed',
        variant: 'default',
        style: 'bg-green-800 text-green-100 border border-green-100'
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'outline',
        style: 'bg-red-800 text-red-100 border border-red-100'
    },
} as const;

const badge = (status: keyof typeof badgeVariant) => {
    return <Badge variant={badgeVariant[status].variant} className={`capitalize ${badgeVariant[status].style}`}>
        <span className="capitalize">{badgeVariant[status].label}</span>
    </Badge>
}

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
                <ItemActions className="flex flex-col gap-2 items-end">
                    {badge(cell.row.original.status as keyof typeof badgeVariant)}
                    <span className="text-sm">Created: {cell.row.original.created_at}</span>
                </ItemActions>
                </Item>
        }
    },
]
