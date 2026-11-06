import ContainerLayout from '@/components/container-layout';
import { buttonVariants } from '@/components/ui/button';
import { columns } from '@/components/users/columns';
import { DataTable } from '@/components/users/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: route('admin.users.index'),
    },
];

export default function Index({ users, roleNames }: { users: User[]; roleNames: string[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Users</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Manage user accounts and the roles assigned to them</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('admin.users.create')}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create User
                    </Link>
                </div>
                <DataTable data={users} columns={columns} roleNames={roleNames} />
            </ContainerLayout>
        </AppLayout>
    );
}
