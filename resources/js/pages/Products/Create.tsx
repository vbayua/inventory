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
import { Checkbox } from '@/components/ui/checkbox';


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
    category_id?: string | null,
    supplier_id?: string | null,
    with_begin_stock?: boolean,
    quantity?: number,
    location_id?: number,
    status?: string,
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

type Location = [
    id?: number,
    name?: string,
]

export default function Create({ categories, suppliers, units }: {
    categories: Category[],
    suppliers: Supplier[],
    units: Unit[],
}) {

    const productSku = useRef<HTMLInputElement>(null)
    const productName = useRef<HTMLInputElement>(null)
    const productPrice = useRef<HTMLInputElement>(null)

    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateProductForm>>({
        name: '',
        sku: '',
        unit: '',
        price: 0,
        category_id: '',
        supplier_id: '',
        with_begin_stock: false,
        quantity: 0,
        location_id: 1,
        status: 'available',
    })
    const createProduct: FormEventHandler = (e) => {
        e.preventDefault()
        if (data.category_id === 'none') setData('category_id', null);
        if (data.supplier_id === 'none') setData('supplier_id', null);
        console.log('Creating product with data:', data);
        post(route('products.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name', 'sku', 'unit', 'price', 'category_id', 'supplier_id');
                    setData('with_begin_stock', false);;
                    toast.error(errors.name)
                    productName.current?.focus()
                }
            }
        })
    }

    const generateSku = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        // const randomSku = Math.random().toString(36).substring(2, 10).toUpperCase();
        const firstWord = productName.current?.value.trim().split(' ')[0] || '';
        const initials = firstWord.slice(0, 2).toUpperCase();
        const randomSku = initials + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
        if (!randomSku) {
            toast.error('Please enter a product name before generating SKU.');
            return;
        } else {
            setData('sku', randomSku);
            if (productSku.current) {
                productSku.current.value = randomSku;
            }
        }
        // Ensure SKU is unique by appending a random string
        // If you want to ensure uniqueness, you might need to check against existing SKUs in your database.
        // For now, we will just generate a random SKU
        // Example: SKU format "PRODUCT-12345-XYZ"
        // Note: The SKU generation logic can be customized as per your requirements.
        // For example, you can use a combination of product name and a random string.
        // const randomSku = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();

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

                <div className="grid md:grid-cols-2 items-center gap-2">

                    <div>
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
                    {productName.current && productName.current.value && (
                        <Button className="md:self-end" variant={'secondary'} onClick={(e) => generateSku(e)}>Generate SKU</Button>
                    )}

                </div>

                <div className="grid gap-2">
                    <Label htmlFor='unit'>unit</Label>
                    <Select
                        onValueChange={(value) => setData('unit', String(value))}
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
                            <SelectItem value="none">None</SelectItem>
                            {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={String(supplier.id)}>
                                    {supplier.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <InputError message={errors.supplier_id} />
                </div>
                <div className='flex items-center gap-2'>
                    <Checkbox
                        id='with_begin_stock'
                        name='with_begin_stock'
                        checked={data.with_begin_stock}
                        onCheckedChange={(checked) => setData('with_begin_stock', !!checked)}
                        className='h-4 w-4'
                    />
                    <Label htmlFor='with_begin_stock'>With Initial Stock</Label>

                    <InputError message={errors.with_begin_stock} />
                </div>
                {data.with_begin_stock && (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor='quantity'>Set Initial Quantity</Label>
                            <Input
                                id='quantity'
                                type='number'
                                min={0}
                                value={data.quantity}
                                onChange={(e) => setData('quantity', Number(e.target.value))}
                                className='mt-1 block w-full'
                            />

                            <InputError message={errors.quantity} />
                        </div>
                    </>
                )}

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Create Product</Button>
                </div>
            </form>
        </AppLayout >
    );
}
