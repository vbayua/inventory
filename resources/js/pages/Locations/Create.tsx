import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContainerFormLayout from '@/components/container-form-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Locations',
        href: '/location',
    },
    {
        title: 'Create New Location',
        href: '/location/create',
    },
];
type CreateLocationForm = {
    name?: string,
    warehouse_id?: string,
}
export default function Create({ warehouses }: { warehouses: any[] }) {

    const locationName = useRef<HTMLInputElement>(null)
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateLocationForm>>({
        name: '',
        warehouse_id: '',
    })

    const createLocation: FormEventHandler = (e) => {
        e.preventDefault()

        post(route('location.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    locationName.current?.focus()
                }
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Location" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text-2xl font-bold mb-4">Create New Location</h1>
                        <p className="text-sm text-muted-foreground mb-6">Create a new location to manage your inventory.</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/location`}>
                            Back to Locations
                        </Link>
                    </div>
                </div>
                <form onSubmit={createLocation} className='space-y-6'>
                    <div className='grid gap-2'>
                        <Label htmlFor='warehouse'>Warehouse</Label>
                        <Select onValueChange={(value) => setData('warehouse_id', value)} value={data.warehouse_id}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a warehouse' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Location Name</Label>

                        <Input
                            id='name'
                            ref={locationName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className='mt-1 block w-full'
                            placeholder='Location Name'
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Location</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
