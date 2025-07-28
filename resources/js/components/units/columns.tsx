import { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button, buttonVariants } from '../ui/button'
import { MoreHorizontal, ArrowUpDown, BadgeInfo } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../data-table-column-header'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"


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
        cell: ({ cell }) => {
            const unit = cell.row.original;
            const isBase = unit.base_unit === unit.name; // Assuming base unit is the one with the same name
            return isBase ? (
                <div className="flex">
                    <Link
                        href={route('units.show', { name: unit.name })}
                        className='font-semibold hover:underline'
                    >
                        {cell.getValue() as string}
                    </Link>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <BadgeInfo className='ml-1.5' size={12} />
                        </TooltipTrigger>
                        <TooltipContent side='right'>
                            <span className="text-sm text-muted-foreground">
                                This is a base unit
                            </span>
                        </TooltipContent>
                    </Tooltip>
                </div>
            ) : (
                <Link
                    href={route('units.show', { name: unit.name })}
                    className='hover:underline'
                >
                    {cell.getValue() as string}
                </Link>
            )
        }
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
                            <Link href={viewUnit} className={buttonVariants({ variant: 'ghost' })}>
                                View Unit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editUnit} className={buttonVariants({ variant: 'ghost' })}>
                                Edit Unit
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
