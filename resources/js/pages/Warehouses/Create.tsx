import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'List Gudang',
        href: '/warehouse',
    },
    {
        title: 'Register Gudang Baru',
        href: '/warehouse/create',
    },
];
type CreateWarehouseForm = {
    name?: string;
};
export default function Create() {
    const warehouseName = useRef<HTMLInputElement>(null);
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateWarehouseForm>>({
        name: '',
    });

    const createWarehouse: FormEventHandler = (e) => {
        e.preventDefault();
        // console.log('Creating warehouse with data:', data);
        post(route('warehouse.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
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
            <Head title="Create New Warehouse" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Register Gudang Baru</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Tambahkan data gudang</p>
                    </div>
                    <div>
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/warehouse`}>
                            Kembali ke daftar gudang
                        </Link>
                    </div>
                </div>
                <form onSubmit={createWarehouse} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Gudang</Label>

                        <Input
                            id="name"
                            ref={warehouseName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Nama Gudang"
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
