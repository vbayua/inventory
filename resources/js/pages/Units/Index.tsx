import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/units/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/units/data-table';
import { FormEventHandler, useRef } from 'react';
import { PlusIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/unit',
    },
];

type SearchUnitForm = {
    name?: string
}

export default function Index({ units }: { units: any }) {
    const unitName = useRef<HTMLInputElement>(null)

    const { data, setData, get, reset, processing, errors } = useForm<Required<SearchUnitForm>>({
        name: '',
    })


    const deleteProduct = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('units.destroy', { id }))
            toast.success('Unit deleted successfuly')
        }
    }

    const filterUnit: FormEventHandler = (e) => {
        e.preventDefault()
        get(route('units.index', { 'name': data.name }), {
            preserveScroll: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Lists" />
            <div className={'p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/units/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Unit
                </Link>
            </div>
            <div className={'p-4'}>
                <DataTable columns={columns} data={units} clientSide={true} />
            </div>
        </AppLayout>
    );
}
