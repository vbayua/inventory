import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Unit } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { BadgeInfo, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const columns: ColumnDef<Unit>[] = [
    {
        accessorKey: 'name',
        header: 'Unit Name',
        cell: ({ cell }) => {
            const unit = cell.row.original;
            const isBase = unit.base_unit === unit.name; // Assuming base unit is the one with the same name
            return isBase ? (
                <div className="flex">
                    <Link href={route('units.show', { name: unit.name })} className="font-semibold hover:underline">
                        {cell.getValue() as string}
                    </Link>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <BadgeInfo className="ml-1.5" size={12} />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <span className="text-muted-foreground text-sm">This is a base unit</span>
                        </TooltipContent>
                    </Tooltip>
                </div>
            ) : (
                <Link href={route('units.show', { name: unit.name })} className="hover:underline">
                    {cell.getValue() as string}
                </Link>
            );
        },
    },
    {
        accessorKey: 'conversion_to_base',
        header: 'Conversion to Base',
    },
    {
        accessorKey: 'base_unit',
        header: 'Base Unit',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const unit = row.original;
            const viewUnit = route('units.show', { name: unit.name });
            const editUnit = route('units.edit', { name: unit.name });

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={viewUnit} className="w-full">
                                View Unit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={editUnit} className="w-full">
                                Edit Unit
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
