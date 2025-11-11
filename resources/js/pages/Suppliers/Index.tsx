import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/suppliers/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { PaginationIndex } from '@/components/ui/pagination-index';
import { DataTable } from '@/components/suppliers/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suppliers',
        href: route('supplier.index'),
    },
];

type SearchSupplierForm = {
    name?: string;
}

export default function Index({ suppliers }: { suppliers: any }) {
    console.log('Suppliers:', suppliers);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier Lists" />
            <ContainerLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text-2xl font-bold mb-4">Suppliers</h1>
                        <p className='text-sm text-muted-foreground mb-6'>Manage suppliers or vendors. You can create, edit and view suppliers</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('supplier.create')}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        Create Supplier
                    </Link>
                </div>
                <DataTable data={suppliers} columns={columns} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
