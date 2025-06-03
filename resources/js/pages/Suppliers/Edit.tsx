import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';

type Supplier = {
    id?: number;
    name?: string;
}
type EditSupplierForm = {
    name?: string
}
export default function Edit({ supplier }: { supplier: Supplier }) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Supplier',
            href: '/supplier',
        },
        {
            title: `${supplier.name}`,
            href: `/supplier/${supplier.id}`,
        },
        {
            title: 'Edit',
            href: `/supplier/${supplier.id}/edit`,
        },
    ];
    const supplierName = useRef<HTMLInputElement>(null)
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditSupplierForm>>({
        name: supplier.name || '',
    })

    const createSupplier: FormEventHandler = (e) => {
        e.preventDefault()

        put(route('supplier.update'), {
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
                    <Button disabled={processing}>Edit Supplier</Button>
                </div>
            </form>
        </AppLayout >
    );
}
