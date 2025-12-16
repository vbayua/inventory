import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/partners/columns';
import { Head, Link } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/suppliers/data-table';
import { PlusIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Partners & Companies',
        href: route('partners.index'),
    },
];

export default function Index({ partners }: { partners: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partner & Companies Lists" />
            <ContainerLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text-2xl font-bold mb-4">Partners</h1>
                        <p className='text-sm text-muted-foreground mb-6'>Manage partners or companies. You can create, edit and view company information</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('partners.create')}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        Create Partner
                    </Link>
                </div>
                <DataTable data={partners} columns={columns} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
