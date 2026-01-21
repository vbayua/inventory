import { Partner } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const columns: ColumnDef<Partner>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Name" />;
        },
        cell: ({ row }) => {
            const id = row.original.id;
            const name = row.original.name;
            return <Link href={route('partners.show', id)}>{name}</Link>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const partner = row.original;
            const viewPartner = route('partners.show', { id: partner.id });
            const editPartner = route('partners.edit', { id: partner.id });
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
                        <DropdownMenuItem>
                            <Link href={viewPartner} className={'w-full'}>
                                View Partner
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={editPartner} className={'w-full'}>
                                Edit Partner
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
