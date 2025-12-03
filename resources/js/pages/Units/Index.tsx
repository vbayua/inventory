import ContainerLayout from '@/components/container-layout';
import { buttonVariants } from '@/components/ui/button';
import { columns } from '@/components/units/columns';
import { DataTable } from '@/components/units/data-table';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/unit',
    },
];

type SearchUnitForm = {
    name?: string;
};

export default function Index({ units }: { units: any }) {
    const { permissions } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Lists" />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Units</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Manage units of measurement. You can create, edit, and delete units.</p>
                    </div>
                    {permissions.create && (
                        <Link className={buttonVariants({ variant: 'default' })} href={`/units/create`}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Unit
                        </Link>
                    )}
                </div>
                <DataTable columns={columns} data={units} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
