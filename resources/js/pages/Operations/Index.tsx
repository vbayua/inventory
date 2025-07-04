import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/operations/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { PaginationIndex } from '@/components/ui/pagination-index';
import { DataTable } from '@/components/operations/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon, PlusIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Operations',
        href: '/operations',
    },
];

type SearchProductForm = {
    name?: string
}

export default function Index({ operations }: { operations: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operation List" />
            {/* <h1>TODO INDEX OPERATIONS</h1> */}
            <div className={'mt-8 p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/operations/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Operation
                </Link>
            </div>
            <div className={'p-4'}>
                <DataTable columns={columns} data={operations} clientSide={true} />
            </div>
        </AppLayout>
    );
}
