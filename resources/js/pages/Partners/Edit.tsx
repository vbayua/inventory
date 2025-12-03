import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import ContainerFormLayout from '@/components/container-form-layout';

type Partner = {
    id?: number;
    name?: string;
    email?: string;
    phone_number?: string;
    contact_person?: string;
    address?: string;
}
type EditPartnerForm = {
    name?: string;
    email?: string;
    phone_number?: string;
    contact_person?: string;
    address?: string;
}
export default function Edit({ partner }: { partner: Partner }) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Partner',
            href: '/partners',
        },
        {
            title: `${partner.name}`,
            href: `/partners/${partner.id}`,
        },
        {
            title: 'Edit',
            href: `/partners/${partner.id}/edit`,
        },
    ];
    const partnerName = useRef<HTMLInputElement>(null)
    const phoneNumber = useRef<HTMLInputElement>(null)
    const email = useRef<HTMLInputElement>(null)
    const contactPerson = useRef<HTMLInputElement>(null)
    const address = useRef<HTMLTextAreaElement>(null);
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditPartnerForm>>({
        name: `${partner.name}`,
        phone_number: partner.phone_number || '',
        email: partner.email || '',
        contact_person: partner.contact_person || '',
        address: partner.address || '',
    })

    const editPartner: FormEventHandler = (e) => {
        e.preventDefault()

        put(route('partners.update', { id: partner.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    partnerName.current?.focus()
                }
                console.log(errors)
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Partner" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text-2xl font-bold">Edit Partner</h1>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={route('partners.index')}>Back to index</Link>
                    </div>
                </div>
                <form onSubmit={editPartner} className='space-y-6 mt-8 p-4'>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Partner Name</Label>

                        <Input
                            id='name'
                            ref={partnerName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            type='text'
                            name='name'
                            className='mt-1 block w-full'
                            placeholder='Partner Name'
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

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} type='submit'>Save Partner</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
