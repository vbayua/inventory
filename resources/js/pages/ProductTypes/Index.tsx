import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/product-types/columns';
import { DataTable } from '@/components/product-types/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Types',
        href: '/product-types',
    },
];

export default function Index({ productTypes }: { productTypes: any }) {
    const { permissions } = usePage<SharedData>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Type Lists" />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Product Type</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Manage product types. You can create, edit, and delete product types.</p>
                    </div>
                    {permissions.create && (
                        <Link className={buttonVariants({ variant: 'default' })} href={route('product-types.create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Product Type
                        </Link>
                    )}
                </div>
                <DataTable columns={columns} data={productTypes} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
