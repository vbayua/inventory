import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/roles/columns';
import { DataTable } from '@/components/roles/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Role } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: route('role.index'),
    },
];

export default function Index({ roles }: { roles: Role[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Roles" />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Roles</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Manage user roles and the permissions assigned to them</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('role.create')}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Role
                    </Link>
                </div>
                <DataTable data={roles} columns={columns} />
            </ContainerLayout>
        </AppLayout>
    );
}
