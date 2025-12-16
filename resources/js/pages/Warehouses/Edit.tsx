import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

type Warehouse = {
    id?: number;
    name?: string;
};
type EditWarehouseForm = {
    name?: string;
};
export default function Edit({ warehouse }: { warehouse: Warehouse }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'List Gudang',
            href: '/warehouse',
        },
        {
            title: `${warehouse.name}`,
            href: `/warehouse/${warehouse.id}`,
        },
        {
            title: 'Edit',
            href: `/warehouse/${warehouse.id}/edit`,
        },
    ];
    const warehouseName = useRef<HTMLInputElement>(null);
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditWarehouseForm>>({
        name: `${warehouse.name}`,
    });

    const editWarehouse: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('warehouse.update', { id: warehouse.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name');
                    warehouseName.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Gudang" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Edit Gudang</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Edit detail gudang.</p>
                    </div>
                    <div>
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/warehouse`}>
                            Kembali ke daftar gudang
                        </Link>
                    </div>
                </div>
                <form onSubmit={editWarehouse} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Gudang</Label>

                        <Input
                            id="name"
                            ref={warehouseName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            name="name"
                            type="text"
                            className="mt-1 block w-full"
                            placeholder="Nama gudang"
                        />

                        <InputError message={errors.name} />
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
