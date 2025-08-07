import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/product-types/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/product-types/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Types',
        href: '/product-types',
    },
];

export default function Index({ productTypes }: { productTypes: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Type Lists" />
            <ContainerLayout>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Product Type</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage product types. You can create, edit, and delete product types.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('product-types.create')}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        Create Product Type
                    </Link>
                </div>
                <DataTable columns={columns} data={productTypes} clientSide={true} />
            </ContainerLayout>

        </AppLayout>
    );
}
