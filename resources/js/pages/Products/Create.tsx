import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { SelectLabel } from '@radix-ui/react-select';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
    {
        title: 'Create New Product',
        href: '/products/create',
    },
];
type CreateProductForm = {
    name?: string,
    sku?: string,
    unit?: number | string,
    price?: number,
    category_id?: number | null,
    location_id?: number | null,
    supplier_id?: number | null,
}
export default function Create({ categories, locations, suppliers, units }: {
    categories: { id: number, name: string }[],
    locations: { id: number, name: string }[],
    suppliers: { id: number, name: string }[],
    units: { name: string }[]
}) {

    const productSku = useRef<HTMLInputElement>(null)
    const productName = useRef<HTMLInputElement>(null)
    const productPrice = useRef<HTMLInputElement>(null)
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateProductForm>>({
        name: '',
        sku: '',
        unit: '',
        price: 0,
        category_id: null,
        location_id: null,
        supplier_id: null
    })

    const createProduct: FormEventHandler = (e) => {
        e.preventDefault()

        post(route('products.store'), {
            forceFormData: true,
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
            <Head title="Create New Product" />
            <form onSubmit={createProduct} className='space-y-6 mt-8 p-4'>
                <div className="grid gap-2">
                    <Label htmlFor='name'>Product Name</Label>

                    <Input
                        id='name'
                        ref={productName}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className='mt-1 block w-full'
                        placeholder='Product Name'
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
                    <Button disabled={processing}>Create Product</Button>
                </div>
            </form>
        </AppLayout >
    );
}
