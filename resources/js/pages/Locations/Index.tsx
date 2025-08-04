import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/locations/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/locations/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import ContainerLayout from '@/components/container-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Locations',
        href: '/location',
    },
];

type SearchLocationForm = {
    name?: string
}

export default function Index({ locations }: { locations: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Location Lists" />
            <ContainerLayout>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Locations</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage locations. You can create, edit, and delete locations.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'default' })} href={route('location.create')}>
                        <PlusIcon className='w-4 h-4 mr-2' />
                        Create Location
                    </Link>
                </div>
                <DataTable columns={columns} data={locations} clientSide={true} />
            </ContainerLayout>

        </AppLayout>
    );
}
