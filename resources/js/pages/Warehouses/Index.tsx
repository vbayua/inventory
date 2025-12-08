import ContainerLayout from '@/components/container-layout';
import { buttonVariants } from '@/components/ui/button';
import { columns } from '@/components/warehouses/columns';
import { DataTable } from '@/components/warehouses/data-table';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gudang',
        href: '/warehouse',
    },
];

export default function Index({ warehouses }: { warehouses: any }) {
    const { permissions } = usePage<SharedData>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Gudang" />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Warehouses (Gudang)</h1>
                        <p className="text-muted-foreground mb-6 text-sm">List data gudang</p>
                    </div>
                    {permissions.create && (
                        <Link className={buttonVariants({ variant: 'default' })} href={route('warehouse.create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Register Gudang Baru
                        </Link>
                    )}
                </div>
                <DataTable columns={columns} data={warehouses} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
