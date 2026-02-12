import ContainerLayout from '@/components/container-layout';
import { buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

export default function Index({ users }: { users: Array<any> }) {
    return (
        <AppLayout>
            <Head title="User Management" />
            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Users</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Manage users.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('admin.users.create')}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create User
                    </Link>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-primary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">Name</TableHead>
                            <TableHead className="text-primary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">Email</TableHead>
                            <TableHead className="text-primary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">Role</TableHead>
                            <TableHead className="text-primary px-6 py-3 text-right text-xs font-medium tracking-wider uppercase">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="text-primary px-6 py-4 text-sm font-medium whitespace-nowrap">{user.name}</TableCell>
                                <TableCell className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{user.email}</TableCell>
                                <TableCell className="text-primary px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    {user.roles.map((role: string) => role.name).join(', ')}
                                </TableCell>
                                <TableCell className="text-muted-foreground px-6 py-4 text-right text-sm whitespace-nowrap">
                                    <Link href={`/admin/users/${user.id}/edit`} className={buttonVariants({ variant: 'link' })}>
                                        Edit
                                    </Link>
                                    <Link href={`/admin/users/${user.id}`} className={buttonVariants({ variant: 'link' })}>
                                        View
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ContainerLayout>
        </AppLayout>
    );
}
