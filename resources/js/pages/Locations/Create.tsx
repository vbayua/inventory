import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'List Lokasi',
        href: '/location',
    },
    {
        title: 'Register Lokasi Baru',
        href: '/location/create',
    },
];
type CreateLocationForm = {
    name?: string;
    warehouse_id?: string;
};
export default function Create({ warehouses }: { warehouses: any[] }) {
    const locationName = useRef<HTMLInputElement>(null);
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateLocationForm>>({
        name: '',
        warehouse_id: '',
    });

    const createLocation: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('location.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name');
                    locationName.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Location" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="mb-4 text-2xl font-bold">Register Lokasi Baru</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Tambahkan data lokasi</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/location`}>
                            Kembali ke daftar lokasi
                        </Link>
                    </div>
                </div>
                <form onSubmit={createLocation} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="warehouse">Gudang</Label>
                        <Select onValueChange={(value) => setData('warehouse_id', value)} value={data.warehouse_id}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih gudang" />
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
                        <Label htmlFor="name">Nama Lokasi</Label>

                        <Input
                            id="name"
                            ref={locationName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Nama Lokasi"
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} variant={'default'} className="hover:cursor-pointer" type="submit">
                            Save
                        </Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
