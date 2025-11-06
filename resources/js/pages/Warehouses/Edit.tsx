import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import ContainerFormLayout from '@/components/container-form-layout';

type Warehouse = {
    id?: number;
    name?: string;
}
type EditWarehouseForm = {
    name?: string
}
export default function Edit({ warehouse }: { warehouse: Warehouse }) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Warehouses',
            href: '/warehouse',
        },
        {
            title: `${warehouse.name}`,
            href: `/warehouse/${warehouse.id}`,
        },
        {
            title: 'Edit',
            href: `/warehouse/${warehouse.id}/edit`,
        },
    ];
    const warehouseName = useRef<HTMLInputElement>(null)
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditWarehouseForm>>({
        name: `${warehouse.name}`,
    })

    const editWarehouse: FormEventHandler = (e) => {
        e.preventDefault()

        put(route('warehouse.update', { id: warehouse.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // reset()
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
            <Head title="Edit Warehouse" />
            <ContainerFormLayout>
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Edit Warehouse</h1>
                        <p className="text-sm text-muted-foreground mb-6">Edit the details of the warehouse.</p>
                    </div>
                    <div>
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/warehouse`}>
                            Back to Warehouses
                        </Link>
                    </div>
                </div>
                <form onSubmit={editWarehouse} className='space-y-6'>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Warehouse Name</Label>

                        <Input
                            id='name'
                            ref={warehouseName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            name='name'
                            type='text'
                            className='mt-1 block w-full'
                            placeholder='Warehouse Name'
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} type='submit'>Edit Warehouse</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
