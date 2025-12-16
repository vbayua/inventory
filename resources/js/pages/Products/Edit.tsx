import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import SelectCommand from '@/components/products/select-command';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type Product } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
    {
        title: 'Edit Product',
        href: '/products',
    },
];

type EditProductForm = {
    name?: string;
    sku?: string;
    unit?: number | string;
    price?: number;
    category_id?: string | null;
    supplier_id?: string | null;
    brand_name?: string;
    scientific_name?: string;
};

type Category = {
    id?: number;
    name?: string;
};

type Supplier = {
    id?: number;
    name?: string;
};

type Unit = {
    name?: string;
};
export default function Edit({ product, units, productHasStock }: { product: Product; units: Unit[]; productHasStock: boolean }) {
    const productName = useRef<HTMLInputElement>(null);
    const productSku = useRef<HTMLInputElement>(null);
    const productBrandName = useRef<HTMLInputElement>(null);
    const productScientificName = useRef<HTMLInputElement>(null);
    const [unitPopover, setUnitPopover] = useState(false);

    const { data, setData, put, reset, processing, errors } = useForm<Required<EditProductForm>>({
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        price: product.price,
        category_id: String(product.category_id),
        supplier_id: String(product.supplier_id),
        brand_name: product.brand_name || '',
        scientific_name: product.scientific_name || '',
    });

    const editProduct: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('products.update', product.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name', 'sku', 'unit', 'price', 'category_id', 'supplier_id');
                    productName.current?.focus();
                }
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />
            <ContainerFormLayout>
                <div className="mb-4">
                    <Button variant={'link'} asChild>
                        <Link href={route('products.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali Ke Daftar Produk
                        </Link>
                    </Button>
                </div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Edit - {data.name} <span className="text-sm font-normal text-gray-500"> (Kode Item: {product.sku})</span>
                    </h1>
                </div>
                <form onSubmit={editProduct} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            Nama Produk <span className="text-red-500">*</span>
                        </Label>

                        <Input
                            id="name"
                            ref={productName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sku">
                            Kode Item <span className="text-red-500">*</span>
                        </Label>

                        <Input
                            id="sku"
                            ref={productSku}
                            value={data.sku}
                            onChange={(e) => setData('sku', e.target.value)}
                            disabled={productHasStock}
                            placeholder="SKU"
                            className="mt-1 block w-full"
                        />
                        <span className="text-muted-foreground text-sm">
                            {productHasStock ? 'Kode Item tidak dapat diubah karena produk sudah terdaftar dalam stok.' : ''}
                        </span>
                        <InputError message={errors.sku} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="brand_name">Nama Brand</Label>
                        <Input
                            id="brand_name"
                            value={data.brand_name}
                            ref={productBrandName}
                            onChange={(e) => setData('brand_name', e.target.value)}
                            placeholder="Brand Name"
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.brand_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scientific_name">Scientific Name (Inci Name)</Label>
                        <Input
                            id="scientific_name"
                            value={data.scientific_name}
                            ref={productScientificName}
                            onChange={(e) => setData('scientific_name', e.target.value)}
                            placeholder="Scientific Name"
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.scientific_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="unit">
                            Unit <span className="text-red-500">*</span>
                        </Label>
                        <Popover open={unitPopover} onOpenChange={setUnitPopover} defaultOpen={unitPopover}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn('w-full justify-between', !data.unit && 'text-muted-foreground')}
                                    disabled={productHasStock}
                                >
                                    {data.unit ? data.unit : 'Pilih Satuan (pcs, ml, gr, etc)'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <SelectCommand
                                    lists={units}
                                    getId={(item) => String(item.name)}
                                    placeholder="Pilih Satuan"
                                    getLabel={(item) => String(item.name)}
                                    onSelect={(item) => {
                                        setData('unit', item.name ?? '');
                                        setUnitPopover(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>

                        <span className="text-muted-foreground text-sm">
                            {productHasStock ? 'Unit tidak dapat diubah karena produk sudah terdaftar dalam stok.' : ''}
                        </span>
                        <InputError message={errors.unit} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Edit Product</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
