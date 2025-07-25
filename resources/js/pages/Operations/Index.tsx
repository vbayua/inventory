import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/operations/columns';
import { Head, Link } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/operations/data-table';
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

            <div className={'py-12'}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Link className={buttonVariants({ variant: 'default' })} href={`/operations/create`}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        New Stock Operation
                    </Link>
                    <DataTable columns={columns} data={operations} clientSide={true} />
                </div>
            </div>
        </AppLayout>
    );
}
