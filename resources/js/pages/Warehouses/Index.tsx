import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/warehouses/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/warehouses/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Warehouses',
        href: '/warehouse',
    },
];

export default function Index({ warehouses }: { warehouses: any }) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse Lists" />
            <ContainerLayout>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Warehouses</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage warehouses. You can create, edit, and delete warehouses.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('warehouse.create')}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        Create Warehouse
                    </Link>
                </div>
                <DataTable
                    columns={columns}
                    data={warehouses}
                    clientSide={true}
                />
            </ContainerLayout>
        </AppLayout>
    );
}
