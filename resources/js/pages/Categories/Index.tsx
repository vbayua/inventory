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
    const categoryName = useRef<HTMLInputElement>(null)

    const { data, setData, get, reset, processing, errors } = useForm<Required<SearchCategoryForm>>({
        name: '',
    })


    const deleteProduct = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('category.destroy', { id }))
            toast.success('Category deleted successfuly')
        }
    }

    const filterCategory: FormEventHandler = (e) => {
        e.preventDefault()
        get(route('category.index', { 'name': data.name }), {
            preserveScroll: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Lists" />
            <div className={'p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/categories/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Category
                </Link>
            </div>
            <div className={'p-4'}>
                {/* <form onSubmit={filterCategory} className='space-y-6 mb-4'>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Filter Category by Name"
                            ref={categoryName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />

                        <Button type="submit" className='cursor-pointer w-[200px]' disabled={processing}>
                            <SearchIcon className='w-4 h-4 mr-2' /> Search
                        </Button>
                    </div>
                </form> */}
                <DataTable columns={columns} data={categories} clientSide={true} />
            </div>
        </AppLayout>
    );
}
