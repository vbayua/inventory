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
        title: 'Supplier',
        href: '/supplier',
    },
    {
        title: 'Create New Supplier',
        href: '/supplier/create',
    },
];
type CreateSupplierForm = {
    name?: string
}
export default function Create() {

    const supplierName = useRef<HTMLInputElement>(null)
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateSupplierForm>>({
        name: '',
    })

    const createSupplier: FormEventHandler = (e) => {
        e.preventDefault()

        post(route('supplier.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    supplierName.current?.focus()
                }
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Supplier" />
            <form onSubmit={createSupplier} className='space-y-6 mt-8 p-4'>
                <div className="grid gap-2">
                    <Label htmlFor='name'>Supplier Name</Label>

                    <Input
                        id='name'
                        ref={supplierName}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className='mt-1 block w-full'
                        placeholder='Supplier Name'
                    />

                    <InputError message={errors.name} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Create Supplier</Button>
                </div>
            </form>
        </AppLayout >
    );
}
