import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/units/columns';
import { Head, Link } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/units/data-table';
import { PlusIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


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
            <ContainerLayout>
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Units</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage units of measurement. You can create, edit, and delete units.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={`/units/create`}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        Create Unit
                    </Link>
                </div>
                <DataTable columns={columns} data={units} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
