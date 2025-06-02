import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Product } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {
    Select,
    SelectLabel,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup
} from '@/components/ui/select';



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
    name?: string,
    sku?: string,
    unit?: number | string,
    price?: number,
    category_id?: number | null,
    location_id?: number | null,
    supplier_id?: number | null,
}
export default function Edit({ product, categories, locations, suppliers, units }: {
    product: Product,
    categories: { id: number, name: string }[],
    locations: { id: number, name: string }[],
    suppliers: { id: number, name: string }[],
    units: { name: string }[]
}) {
    const productName = useRef<HTMLInputElement>(null)
    const productSku = useRef<HTMLInputElement>(null)
    const productPrice = useRef<HTMLInputElement>(null)

    const { data, setData, put, reset, processing, errors } = useForm<Required<EditProductForm>>({
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        price: product.price,
        category_id: product.category_id,
        location_id: product.location_id,
        supplier_id: product.supplier_id
    })

    const editProduct: FormEventHandler = (e) => {
        e.preventDefault()

        put(route('products.update', product.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    productName.current?.focus()
                }
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />
            <form onSubmit={editProduct} className='space-y-6 mt-8 p-4'>
                <div className="grid gap-2">
                    <Label htmlFor='name'>Product Name</Label>

                    <Input
                        id='name'
                        ref={productName}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className='mt-1 block w-full'
                    />

                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor='sku'>SKU</Label>

                    <Input
                        id='sku'
                        ref={productSku}
                        value={data.sku}
                        onChange={(e) => setData('sku', e.target.value)}
                        placeholder='SKU'
                        className='mt-1 block w-full'
                    />

                    <InputError message={errors.sku} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor='unit'>unit</Label>
                    <Select
                        onValueChange={(value) => setData('unit', Number(value))}
                        value={String(data.unit)}
                        defaultValue={String(data.unit)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((unit) => (
                                <SelectItem key={unit.name} value={String(unit.name)}>
                                    {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <InputError message={errors.unit} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor='price'>Price</Label>

                    <Input
                        id='price'
                        ref={productPrice}
                        type='number'
                        min={0}
                        value={data.price}
                        onChange={(e) => setData('price', Number(e.target.value))}
                        className='mt-1 block w-full'
                    />

                    <InputError message={errors.price} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor='category'>Category</Label>
                    <Select
                        onValueChange={(value) => setData('category_id', Number(value))}
                        value={String(data.category_id)}
                        defaultValue={String(data.category_id)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <InputError message={errors.category_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor='location'>location</Label>
                    <Select
                        onValueChange={(value) => setData('location_id', Number(value))}
                        value={String(data.location_id)}
                        defaultValue={String(data.location_id)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {locations.map((location) => (
                                <SelectItem key={location.id} value={String(location.id)}>
                                    {location.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <InputError message={errors.location_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor='supplier'>Supplier</Label>
                    <Select
                        onValueChange={(value) => setData('supplier_id', Number(value))}
                        value={String(data.supplier_id)}
                        defaultValue={String(data.supplier_id)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Select a supplier</SelectLabel>
                                <SelectItem value="none">None</SelectItem>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <InputError message={errors.supplier_id} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Edit Product</Button>
                </div>
            </form>
        </AppLayout>
    );
}
