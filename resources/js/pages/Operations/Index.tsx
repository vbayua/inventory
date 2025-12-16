import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/operations/columns';
import { DataTable } from '@/components/operations/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Operations',
        href: '/operations',
    },
];

export default function Index({ operations }: { operations: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operation List" />

            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Operasi Stok</h1>
                        <p className="text-muted-foreground mb-6 text-sm">List operasi stok</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={`/operations/create`}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Buat Operasi Stok
                    </Link>
                </div>
                <DataTable columns={columns} data={operations} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
