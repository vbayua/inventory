import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/products/columns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { PaginationIndex } from '@/components/ui/pagination-index';
import { DataTable } from '@/components/products/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon, PlusIcon } from 'lucide-react';


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
    const productName = useRef<HTMLInputElement>(null)

    const { data, setData, get, reset, processing, errors } = useForm<Required<SearchProductForm>>({
        name: '',
    })

    const deleteProduct = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('products.destroy', { id }))
            toast.success('Product deleted successfuly')
        }
    }

    const filterProduct: FormEventHandler = (e) => {
        e.preventDefault()
        get(route('products.index', { 'name': data.name }), {
            preserveScroll: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Lists" />
            <div className={'mt-8 p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/products/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Product
                </Link>
            </div>
            <div className={'p-4'}>
                <DataTable columns={columns} data={products} clientSide={true} />
            </div>
        </AppLayout>
    );
}
