import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/units/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/units/data-table';
import { FormEventHandler, useRef } from 'react';
import { PlusIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/unit',
    },
];

type SearchUnitForm = {
    name?: string
}

export default function Index({ units }: { units: any }) {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Lists" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Units</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage units of measurement. You can create, edit, and delete units.</p>
                    </div>
                    <div>
                        <Link className={buttonVariants({ variant: 'default' })} href={`/units/create`}>
                            <PlusIcon className='w-4 h-4 mr-2' />
                            Create Unit
                        </Link>
                    </div>
                    <DataTable columns={columns} data={units} clientSide={true} />
                </div>
            </div>
        </AppLayout>
    );
}
