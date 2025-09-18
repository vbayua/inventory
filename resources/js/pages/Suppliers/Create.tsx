import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import ContainerFormLayout from '@/components/container-form-layout';
import { Textarea } from '@/components/ui/textarea';


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
    name: string;
    phone_number?: string;
    email?: string;
    contact_person?: string;
    address?: string;
    notes?: string;
}
export default function Create() {

    const supplierName = useRef<HTMLInputElement>(null)
    const phoneNumber = useRef<HTMLInputElement>(null)
    const email = useRef<HTMLInputElement>(null)
    const contactPerson = useRef<HTMLInputElement>(null)
    const address = useRef<HTMLTextAreaElement>(null);
    const notes = useRef<HTMLTextAreaElement>(null);
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateSupplierForm>>({
        name: '',
        phone_number: '',
        email: '',
        contact_person: '',
        address: '',
        notes: '',
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

                if (errors.phone_number) {
                    reset('phone_number')
                    phoneNumber.current?.focus()
                }

                if (errors.email) {
                    reset('email')
                    email.current?.focus()
                }

                if (errors.contact_person) {
                    reset('contact_person')
                    contactPerson.current?.focus()
                }
                console.log(errors)
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Supplier" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text2xl font-bold mb-4">Create New Supplier</h1>
                        <p className="text-sm text-muted-foreground mb-6">Create a new supplier to add list of available suppliers</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={route('supplier.index')}>Back to suppliers</Link>
                    </div>
                </div>
                <form onSubmit={createSupplier} className='space-y-6'>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Supplier Name</Label>

                        <Input
                            id='name'
                            ref={supplierName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className='mt-1 block w-full'
                            placeholder='ex: Acme .Inc'
                        />

                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor='phone_number'>Phone Number</Label>

                        <Input
                            id='phone_number'
                            ref={phoneNumber}
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            className='mt-1 block w-full'
                            placeholder='+62'
                            type='tel'
                        />

                        <InputError message={errors.phone_number} />

                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor='email'>Contact Person</Label>

                        <Input
                            id='contact_person'
                            ref={contactPerson}
                            value={data.contact_person}
                            type='contact_person'
                            onChange={(e) => setData('contact_person', e.target.value)}
                            className='mt-1 block w-full'
                            placeholder='ex: John'
                        />

                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor='email'>Email Address</Label>

                        <Input
                            id='email'
                            ref={email}
                            value={data.email}
                            type='email'
                            onChange={(e) => setData('email', e.target.value)}
                            className='mt-1 block w-full'
                            placeholder='ex: acme@example.com'
                        />

                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor='address'>Address</Label>

                        <Textarea
                            id='address'
                            ref={address}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className='resize-none p-4'
                            placeholder='Enter Company Address'
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor='notes'>Notes</Label>

                        <Textarea
                            id='notes'
                            ref={notes}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className='resize-none p-4'
                            placeholder='Enter Notes'
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Supplier</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
