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
    category_id?: string | null,
    supplier_id?: string | null,
    brand_name?: string,
    scientific_name?: string,
}

type Category = {
    id?: number,
    name?: string,
}

type Supplier = {
    id?: number,
    name?: string,
}

type Unit = {
    name?: string,
}
export default function Edit({ product, categories, suppliers, units, productHasStock }: {
    product: Product,
    categories: Category[],
    suppliers: Supplier[],
    units: Unit[],
    productHasStock: boolean,
}) {
    const productName = useRef<HTMLInputElement>(null)
    const productSku = useRef<HTMLInputElement>(null)
    const productPrice = useRef<HTMLInputElement>(null)
    const productBrandName = useRef<HTMLInputElement>(null)
    const productScientificName = useRef<HTMLInputElement>(null)

    const { data, setData, put, reset, processing, errors } = useForm<Required<EditProductForm>>({
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        price: product.price,
        category_id: String(product.category_id),
        supplier_id: String(product.supplier_id),
        brand_name: product.brand_name || '',
        scientific_name: product.scientific_name || '',
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
                    reset('name', 'sku', 'unit', 'price', 'category_id', 'supplier_id')
                    productName.current?.focus()
                }
            }
        })
    }
    console.log('unit', data.unit)
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />
            <div className="py-12 max-sm:px-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Edit Product</h2>
                        <Link href={route('products.index')} className={buttonVariants({ variant: 'secondary' })}>
                            Back to Products
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500">You can edit the product details below.</p>
                    <form onSubmit={editProduct} className='space-y-6'>
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

                        <div className="grid gap-4 md:grid-cols-2 md:gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="brand_name">Brand Name</Label>
                                <Input
                                    id='brand_name'
                                    value={data.brand_name}
                                    ref={productBrandName}
                                    onChange={(e) => setData('brand_name', e.target.value)}
                                    placeholder='Brand Name'
                                    className='mt-1 block w-full'
                                />
                                <InputError message={errors.brand_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="scientific_name">Scientific Name</Label>
                                <Input
                                    id='scientific_name'
                                    value={data.scientific_name}
                                    ref={productScientificName}
                                    onChange={(e) => setData('scientific_name', e.target.value)}
                                    placeholder='Scientific Name'
                                    className='mt-1 block w-full'
                                />
                                <InputError message={errors.scientific_name} />
                            </div>

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

                        <div className="grid gap-4 md:grid-cols-2 md:gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor='unit'>Unit</Label>
                                <Select
                                    onValueChange={(value) => setData('unit', String(value))}
                                    disabled={productHasStock}
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
                                <Label className="text-xs text-gray-500">
                                    Note: You cannot change the unit of a product that has stock.
                                </Label>
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
                                    step={0.01}
                                    onChange={(e) => setData('price', Number(e.target.value))}
                                    className='mt-1 block w-full'
                                />

                                <InputError message={errors.price} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 md:gap-2">

                            <div className="grid gap-2">
                                <Label htmlFor='category'>Category</Label>
                                <Select
                                    onValueChange={(value) => setData('category_id', String(value))}
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
                                <Label htmlFor='supplier'>Supplier</Label>
                                <Select
                                    onValueChange={(value) => setData('supplier_id', String(value))}
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
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Edit Product</Button>
                        </div>
                    </form>
                </div>

            </div>

        </AppLayout>
    );
}
