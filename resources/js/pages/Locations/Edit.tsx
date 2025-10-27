import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import ContainerFormLayout from '@/components/container-form-layout';

type Warehouse = {
    id?: number;
    name?: string;
}
type Location = {
    id?: number;
    name?: string;
    warehouse?: Warehouse;
}
type EditLocationForm = {
    name?: string
    warehouse_id?: number,
}
export default function Edit({ location, warehouses }: { location: Location, warehouses: Warehouse[] }) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Locations',
            href: '/location',
        },
        {
            title: `${location.name}`,
            href: `/location/${location.id}`,
        },
        {
            title: 'Edit',
            href: `/location/${location.id}/edit`,
        },
    ];
    const locationName = useRef<HTMLInputElement>(null)
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditLocationForm>>({
        name: location.name ?? '',
        warehouse_id: location.warehouse?.id ?? 0,
    })

    const editLocation: FormEventHandler = (e) => {
        e.preventDefault()

        put(route('location.update', { id: location.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name', 'warehouse_id')
                    locationName.current?.focus()
                }
            }
        })
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Location" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text-2xl font-bold mb-4">Edit Location</h1>
                        <p className="text-sm text-muted-foreground mb-6">Edit the details of the location.</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/location/${location.id}`}>
                            Back to Location
                        </Link>
                    </div>
                </div>
                <form onSubmit={editLocation} className='space-y-6'>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Location Name</Label>

                        <Input
                            id='name'
                            ref={locationName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            name='name'
                            type='text'
                            className='mt-1 block w-full'
                            placeholder='Location Name'
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor='warehouse'>Warehouse</Label>
                        <Select
                            onValueChange={(value) => setData('warehouse_id', Number(value))}
                            value={String(data.warehouse_id)}
                            defaultValue={String(data.warehouse_id)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select a warehouse</SelectItem>
                                {warehouses.map((warehouse) => (
                                    <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                        {warehouse.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <InputError message={errors.warehouse_id} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} type='submit'>Edit Location</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
