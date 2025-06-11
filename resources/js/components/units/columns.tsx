import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'

type UnitIndex = {
    name: string;
    conversion_to_base: number;
    base_unit: string;
    unit_type: string;
}

export const columns: ColumnDef<UnitIndex>[] = [
    {
        accessorKey: "name",
        header: "Unit Name",
    },
    {
        accessorKey: "conversion_to_base",
        header: "Conversion to Base",
    },
    {
        accessorKey: "base_unit",
        header: "Base Unit",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const unit = row.original
            const viewUnit = route('units.show', { name: unit.name })
            const editUnit = route('units.edit', { name: unit.name })

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Link href={viewUnit} className={'w-full'}>
                                View Unit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editUnit} className={'w-full'}>
                                Edit Unit
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
