import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/products/columns';
import { DataTable } from '@/components/products/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

export default function Index({ products }: { products: any }) {
    const { permissions } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Lists" />
            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Products</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Manage your products here. You can create, edit, and delete products.</p>
                    </div>
                    {permissions.create && (
                        <Link className={buttonVariants({ variant: 'default' })} href={`/products/create`}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Product
                        </Link>
                    )}
                </div>
                <DataTable columns={columns} data={products} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
