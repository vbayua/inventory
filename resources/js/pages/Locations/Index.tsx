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
    const locationName = useRef<HTMLInputElement>(null)

    const { data, setData, get, reset, processing, errors } = useForm<Required<SearchLocationForm>>({
        name: '',
    })


    const deleteProduct = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('location.destroy', { id }))
            toast.success('Location deleted successfuly')
        }
    }

    const filterLocation: FormEventHandler = (e) => {
        e.preventDefault()
        get(route('location.index', { 'name': data.name }), {
            preserveScroll: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Location Lists" />
            <div className={'p-4'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={`/warehouse/create`}>
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Location
                </Link>
            </div>
            <div className={'p-4'}>
                {/* <form onSubmit={filterLocation} className='space-y-6 mb-4'>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Filter Location by Name"
                            ref={locationName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />

                        <Button type="submit" className='cursor-pointer w-[200px]' disabled={processing}>
                            <SearchIcon className='w-4 h-4 mr-2' /> Search
                        </Button>
                    </div>
                </form> */}
                <DataTable columns={columns} data={locations} clientSide={true} />
            </div>
        </AppLayout>
    );
}
