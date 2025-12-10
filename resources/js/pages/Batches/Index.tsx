import { columns } from '@/components/batches/columns';
import { DataTable } from '@/components/batches/data-table';
import ContainerLayout from '@/components/container-layout';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Batches',
        href: '/batches',
    },
];

export default function Index({ batches }: { batches: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch Lists" />
            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Batches</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Manage your batches here. You can create, edit, and delete batches.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={`/batches/create`}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Batch
                    </Link>
                </div>
                <DataTable columns={columns} data={batches} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
