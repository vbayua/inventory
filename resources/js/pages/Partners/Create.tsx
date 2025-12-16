import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Partner',
        href: '/partners',
    },
    {
        title: 'Create New Partner',
        href: '/supplier/create',
    },
];
type CreatePartnerForm = {
    name: string;
    phone_number?: string;
    email?: string;
    contact_person?: string;
    address?: string;
};
export default function Create() {
    const pertnerName = useRef<HTMLInputElement>(null);
    const phoneNumber = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const contactPerson = useRef<HTMLInputElement>(null);
    const address = useRef<HTMLTextAreaElement>(null);
    const notes = useRef<HTMLTextAreaElement>(null);
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreatePartnerForm>>({
        name: '',
        phone_number: '',
        email: '',
        contact_person: '',
        address: '',
    });

    const createPartner: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('partners.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name');
                    pertnerName.current?.focus();
                }

                if (errors.phone_number) {
                    reset('phone_number');
                    phoneNumber.current?.focus();
                }

                if (errors.email) {
                    reset('email');
                    email.current?.focus();
                }

                if (errors.contact_person) {
                    reset('contact_person');
                    contactPerson.current?.focus();
                }
                console.log(errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Supplier" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="text2xl mb-4 font-bold">Create New Partner</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Create a new partner</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={route('partners.index')}>
                            Back to index
                        </Link>
                    </div>
                </div>
                <form onSubmit={createPartner} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Partner / Company Name</Label>

                        <Input
                            id="name"
                            ref={pertnerName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="ex: Acme .Inc"
                        />

                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone_number">Phone Number</Label>

                        <Input
                            id="phone_number"
                            ref={phoneNumber}
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="+62"
                            type="tel"
                        />

                        <InputError message={errors.phone_number} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Contact Person</Label>

                        <Input
                            id="contact_person"
                            ref={contactPerson}
                            value={data.contact_person}
                            type="contact_person"
                            onChange={(e) => setData('contact_person', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="ex: John"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>

                        <Input
                            id="email"
                            ref={email}
                            value={data.email}
                            type="email"
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="ex: acme@example.com"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>

                        <Textarea
                            id="address"
                            ref={address}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="resize-none p-4"
                            placeholder="Enter Company Address"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Partner</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
