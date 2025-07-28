import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/categories/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/categories/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/category',
    },
];

type SearchCategoryForm = {
    name?: string
}

export default function Index({ categories }: { categories: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Lists" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Categories</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage your categories here. You can create, edit, and delete categories.</p>
                    </div>
                    <div className='flex items-center justify-between mb-4'>
                        <Link className={buttonVariants({ variant: 'default' })} href={`/categories/create`}>
                            <PlusIcon className='w-4 h-4 mr-2' />
                            Create Category
                        </Link>
                    </div>
                    <DataTable columns={columns} data={categories} clientSide={true} />
                </div>
            </div>
        </AppLayout>
    );
}
