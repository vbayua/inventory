import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/products/columns';
import { Head, Link } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/products/data-table';
import { PlusIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

type SearchProductForm = {
    name?: string
}
export default function Index({ products }: { products: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Lists" />
            <ContainerLayout>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Products</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage your products here. You can create, edit, and delete products.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={`/products/create`}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        New Product
                    </Link>
                </div>
                <DataTable columns={columns} data={products} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
