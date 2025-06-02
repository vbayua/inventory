import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/components/products/columns';
import { type Product } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { PaginationIndex } from '@/components/ui/pagination-index';
import { DataTable } from '@/components/products/data-table';
import { FormEventHandler, useRef } from 'react';
import { Input } from '@/components/ui/input';


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
    // console.log(products);
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

    // console.log(products.data)
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Lists" />
            <div className={'mt-8 p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/products/create`}>
                    Create Product
                </Link>
            </div>
            <div className={'mt-8 p-4'}>
                <form onSubmit={filterProduct} className='space-y-6 mt-8 p-4'>
                    <div className="grid gap-2">
                        <Input
                            placeholder="Filter Product"
                            ref={productName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>
                </form>
                <DataTable columns={columns} data={products.data} />
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <PaginationIndex links={products.links} />
            </div>
        </AppLayout>
    );
}
