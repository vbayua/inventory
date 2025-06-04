import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/warehouses/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataTable } from '@/components/warehouses/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Warehoueses',
        href: '/warehouse',
    },
];

type SearchWarehouseForm = {
    name?: string
}

export default function Index({ warehouses }: { warehouses: any }) {
    const warehouseName = useRef<HTMLInputElement>(null)

    const { data, setData, get, reset, processing, errors } = useForm<Required<SearchWarehouseForm>>({
        name: '',
    })


    const deleteProduct = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('warehouse.destroy', { id }))
            toast.success('Warehouse deleted successfuly')
        }
    }

    const filterWarehouse: FormEventHandler = (e) => {
        e.preventDefault()
        get(route('warehouse.index', { 'name': data.name }), {
            preserveScroll: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Warehouse Lists" />
            <div className={'p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/warehouse/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Warehouse
                </Link>
            </div>
            <div className={'p-4'}>
                <form onSubmit={filterWarehouse} className='space-y-6 mb-4'>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Filter Warehouse by Name"
                            ref={warehouseName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />

                        <Button type="submit" className='cursor-pointer w-[200px]' disabled={processing}>
                            <SearchIcon className='w-4 h-4 mr-2' /> Search
                        </Button>
                    </div>
                </form>
                <DataTable columns={columns} data={warehouses.data} links={warehouses.links} />
            </div>
        </AppLayout>
    );
}
