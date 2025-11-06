import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/operations/columns';
import { Head, Link } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/operations/data-table';
import { PlusIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


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
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Stock Operations</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage your stock operations here. You can create, edit, and delete operations.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={`/operations/create`}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        New Stock Operation
                    </Link>
                </div>
                <DataTable columns={columns} data={operations} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
