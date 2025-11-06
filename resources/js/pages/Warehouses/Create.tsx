import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import ContainerFormLayout from '@/components/container-form-layout';



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
        // console.log('Creating warehouse with data:', data);
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
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Create New Warehouse</h1>
                        <p className="text-sm text-muted-foreground mb-6">Create a new warehouse to manage your inventory.</p>
                    </div>
                    <div>
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/warehouse`}>
                            Back to Warehouses
                        </Link>
                    </div>
                </div>
                <form onSubmit={createWarehouse} className='space-y-6'>
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
            </ContainerFormLayout>
        </AppLayout >
    );
}
