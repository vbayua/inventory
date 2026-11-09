import { Role } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { KeyRound, MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const ROLE_USAGE_IN_USE = 'In use';
export const ROLE_USAGE_UNUSED = 'Unused';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const columns: ColumnDef<Role>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
            <Link href={route('role.show', row.original.id)} className="text-primary font-medium hover:underline" prefetch={false}>
                {capitalize(row.original.name)}
            </Link>
        ),
    },
    {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.description ?? '-'}</span>,
    },
    {
        accessorKey: 'users_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Users" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.users_count ?? 0}</span>,
    },
    {
        accessorKey: 'permissions_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.permissions_count ?? 0}</span>,
    },
    {
        id: 'usage',
        accessorFn: (role) => ((role.users_count ?? 0) > 0 ? ROLE_USAGE_IN_USE : ROLE_USAGE_UNUSED),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
        filterFn: (row, id, value: string[] | undefined) => !value?.length || value.includes(row.getValue<string>(id)),
        cell: ({ row }) => {
            const usage = row.getValue<string>('usage');
            return <Badge variant={usage === ROLE_USAGE_IN_USE ? 'secondary' : 'outline'}>{usage}</Badge>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const role = row.original;
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
                            <Link href={route('role.show', role.id)} className="w-full" prefetch={false}>
                                View Role
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('role.edit', role.id)} className="w-full" prefetch={false}>
                                Edit Role
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('role.edit.permissions', role.id)} className="w-full" prefetch={false}>
                                <KeyRound className="h-4 w-4" />
                                Manage Permissions
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
