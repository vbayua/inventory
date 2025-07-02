import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/products/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { PaginationIndex } from '@/components/ui/pagination-index';
import { DataTable } from '@/components/products/data-table';
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

export default function Index() {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Lists" />
            <h1>TODO INDEX OPERATIONS</h1>
            {/* <div className={'mt-8 p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/products/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Product
                </Link>
            </div>
            <div className={'p-4'}>
                <DataTable columns={columns} data={products} clientSide={true} />
            </div> */}
        </AppLayout>
    );
}
