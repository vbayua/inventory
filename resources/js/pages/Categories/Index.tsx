import { columns } from '@/components/categories/columns';
import { DataTable } from '@/components/categories/data-table';
import ContainerLayout from '@/components/container-layout';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/category',
    },
];

export default function Index({ categories }: { categories: any }) {
    const { permissions } = usePage<SharedData>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Lists" />
            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Categories</h1>
                        <p className="text-muted-foreground mb-6 text-sm">
                            Manage your categories here. You can create, edit, and delete categories.
                        </p>
                    </div>
                    {permissions.create && (
                        <Link className={buttonVariants({ variant: 'default' })} href={`/categories/create`}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Category
                        </Link>
                    )}
                </div>
                <DataTable columns={columns} data={categories} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
