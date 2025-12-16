import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

type Warehouse = {
    id?: number;
    name?: string;
};
type Location = {
    id?: number;
    name?: string;
    warehouse?: Warehouse;
};
type EditLocationForm = {
    name?: string;
    warehouse_id?: number;
};
export default function Edit({ location, warehouses }: { location: Location; warehouses: Warehouse[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'List Lokasi',
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
    const locationName = useRef<HTMLInputElement>(null);
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditLocationForm>>({
        name: location.name ?? '',
        warehouse_id: location.warehouse?.id ?? 0,
    });

    const editLocation: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('location.update', { id: location.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name', 'warehouse_id');
                    locationName.current?.focus();
                }
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Location" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="mb-4 text-2xl font-bold">Edit Lokasi</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Edit detail lokasi.</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/location/${location.id}`}>
                            Kembali ke daftar lokasi
                        </Link>
                    </div>
                </div>
                <form onSubmit={editLocation} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lokasi</Label>

                        <Input
                            id="name"
                            ref={locationName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            name="name"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="Nama lokasi"
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="warehouse">Gudang</Label>
                        <Select
                            onValueChange={(value) => setData('warehouse_id', Number(value))}
                            value={String(data.warehouse_id)}
                            defaultValue={String(data.warehouse_id)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih gudang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Pilih gudang</SelectItem>
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
                        <Button disabled={processing} variant={'default'} className="hover:cursor-pointer" type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
