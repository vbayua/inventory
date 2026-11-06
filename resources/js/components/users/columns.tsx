import { User } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { DataTableColumnHeader } from '../data-table-column-header';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        filterFn: (row, _id, value: string | undefined) => {
            const search = (value ?? '').toLowerCase();
            return row.original.name.toLowerCase().includes(search) || row.original.email.toLowerCase().includes(search);
        },
        cell: ({ row }) => (
            <Link href={route('admin.users.show', row.original.id)} className="text-primary font-medium hover:underline" prefetch={false}>
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
        id: 'roles',
        accessorFn: (user) => user.roles?.map((role) => role.name) ?? [],
        header: 'Roles',
        enableSorting: false,
        filterFn: (row, id, value: string[] | undefined) => !value?.length || row.getValue<string[]>(id).some((roleName) => value.includes(roleName)),
        cell: ({ row }) => {
            const roleNames = row.getValue<string[]>('roles');
            return roleNames.length ? (
                <div className="flex flex-wrap gap-1">
                    {roleNames.map((roleName) => (
                        <Badge key={roleName} variant="secondary">
                            {capitalize(roleName)}
                        </Badge>
                    ))}
                </div>
            ) : (
                <span className="text-muted-foreground">No role</span>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        cell: ({ row }) => <span className="tabular-nums">{format(parseISO(row.original.created_at), 'd MMM yyyy')}</span>,
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const user = row.original;
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
                            <Link href={route('admin.users.show', user.id)} className="w-full" prefetch={false}>
                                View User
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.users.edit', user.id)} className="w-full" prefetch={false}>
                                Edit User
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
