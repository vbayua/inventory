import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/suppliers/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { PaginationIndex } from '@/components/ui/pagination-index';
import { DataTable } from '@/components/suppliers/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suppliers',
        href: '/suppliers',
    },
];

type SearchSupplierForm = {
    name?: string
}

export default function Index({ suppliers }: { suppliers: any }) {
    // console.log(suppliers);
    const supplierName = useRef<HTMLInputElement>(null)

    const { data, setData, get, reset, processing, errors } = useForm<Required<SearchSupplierForm>>({
        name: '',
    })


    const deleteProduct = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('supplier.destroy', { id }))
            toast.success('Product deleted successfuly')
        }
    }

    const filterSupplier: FormEventHandler = (e) => {
        e.preventDefault()
        get(route('supplier.index', { 'name': data.name }), {
            preserveScroll: true,
        })
    }

    // console.log(suppliers.data)
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier Lists" />
            <div className={'p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/supplier/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Supplier
                </Link>
            </div>
            <div className={'p-4'}>
                <form onSubmit={filterSupplier} className='space-y-6 mb-4'>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Filter Supplier"
                            ref={supplierName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />

                        <Button type="submit" className='cursor-pointer w-[200px]' disabled={processing}>
                            <SearchIcon className='w-4 h-4 mr-2' /> Search
                        </Button>
                    </div>
                </form>
                <DataTable columns={columns} data={suppliers.data} />
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <PaginationIndex links={suppliers.links} />
            </div>
        </AppLayout>
    );
}
