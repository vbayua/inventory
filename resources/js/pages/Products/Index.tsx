import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/products/columns';
import { DataTable } from '@/components/products/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Master',
        href: '/products',
    },
];

export default function Index({ products }: { products: any }) {
    const { permissions } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Master" />
            <ContainerLayout>
                <div className="bg-warning mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Data Product Master</h1>
                        <p className="text-muted-foreground mb-6 text-sm">List data product master.</p>
                    </div>
                    {permissions.create && (
                        <Button variant={'default'} size={'lg'} asChild>
                            <Link href={`/products/create`} className="text-primary text-lg font-medium">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Register Product
                            </Link>
                        </Button>
                    )}
                </div>
                <DataTable columns={columns} data={products} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
