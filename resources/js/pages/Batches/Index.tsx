import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/batches/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/batches/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Batches',
        href: '/batches',
    },
];

type SearchBatchForm = {
    name?: string
}

export default function Index({ batches }: { batches: any }) {
    const batchName = useRef<HTMLInputElement>(null)

    const { data, setData, get, reset, processing, errors } = useForm<Required<SearchBatchForm>>({
        name: '',
    })


    const deleteProduct = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('batch.destroy', { id }))
            toast.success('Batch deleted successfuly')
        }
    }

    const filterBatch: FormEventHandler = (e) => {
        e.preventDefault()
        get(route('batch.index', { 'name': data.name }), {
            preserveScroll: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch Lists" />
            <div className={'p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/batches/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Batch
                </Link>
            </div>
            <div className={'p-4'}>
                <DataTable columns={columns} data={batches} clientSide={true} />
            </div>
        </AppLayout>
    );
}
