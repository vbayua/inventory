import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Warehouses',
        href: '/warehouse',
    },
    {
        title: 'Create New Warehouse',
        href: '/warehouse/create',
    },
];
type CreateWarehouseForm = {
    name?: string
}
export default function Create() {

    const warehouseName = useRef<HTMLInputElement>(null)
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateWarehouseForm>>({
        name: '',
    })

    const createWarehouse: FormEventHandler = (e) => {
        e.preventDefault()

        post(route('warehouse.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    warehouseName.current?.focus()
                }
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Warehouse" />
            <form onSubmit={createWarehouse} className='space-y-6 mt-8 p-4'>
                <div className="grid gap-2">
                    <Label htmlFor='name'>Warehouse Name</Label>

                    <Input
                        id='name'
                        ref={warehouseName}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className='mt-1 block w-full'
                        placeholder='Warehouse Name'
                    />

                    <InputError message={errors.name} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Create Warehouse</Button>
                </div>
            </form>
        </AppLayout >
    );
}
