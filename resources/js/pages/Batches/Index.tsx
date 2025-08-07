import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/batches/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/batches/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';


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

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <h1 className="text-2xl font-bold mb-4">Batches</h1>
                            <p className="text-sm text-muted-foreground mb-6">Manage your batches here. You can create, edit, and delete batches.</p>
                        </div>
                        <Link className={buttonVariants({ variant: 'default' })} href={`/batches/create`}>
                            <PlusIcon className='w-4 h-4 mr-2' />
                            Create Batch
                        </Link>
                    </div>
                    <DataTable columns={columns} data={batches} clientSide={true} />
                </div>
            </div>
        </AppLayout>
    );
}
