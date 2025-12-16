import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/locations/columns';
import { DataTable } from '@/components/locations/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lokasi',
        href: '/location',
    },
];

export default function Index({ locations }: { locations: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Lokasi" />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Lokasi</h1>
                        <p className="text-muted-foreground mb-6 text-sm">List data lokasi</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('location.create')}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Register Lokasi Baru
                    </Link>
                </div>
                <DataTable columns={columns} data={locations} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
