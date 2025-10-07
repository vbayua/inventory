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
import { Separator } from '@/components/ui/separator';
import { set } from 'date-fns';
import ContainerFormLayout from '@/components/container-form-layout';


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
    brand_name?: string,
    scientific_name?: string,
    sku?: string,
    unit?: number | string,
    price?: number,
    category_id?: string | null,
    supplier_id?: string | null,
    with_begin_stock?: boolean,
    quantity?: number,
    minimum_quantity?: number,
    warehouse_id?: string | null,
    location_id?: string | null,
    status?: string,
    product_type_id?: string | null,
    is_active?: boolean,
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

type ProductType = {
    id?: number,
    name?: string,
    type_code?: string,
}

type Location = {
    id?: number,
    warehouse_id?: number;
    name?: string,
}

type Warehouse = {
    id?: number,
    name?: string,
}

export default function Create({ categories, suppliers, units, product_types, warehouses, locations }: {
    categories: Category[],
    suppliers: Supplier[],
    units: Unit[],
    product_types: ProductType[],
    warehouses: Warehouse[],
    locations: Location[],
}) {

    const productSku = useRef<HTMLInputElement>(null)
    const productName = useRef<HTMLInputElement>(null)
    const productPrice = useRef<HTMLInputElement>(null)
    const productBrandName = useRef<HTMLInputElement>(null)
    const productScientificName = useRef<HTMLInputElement>(null)

    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateProductForm>>({
        name: '',
        sku: '',
        unit: '',
        price: 0,
        category_id: '',
        supplier_id: '',
        with_begin_stock: false,
        quantity: 0,
        minimum_quantity: 0,
        warehouse_id: '',
        location_id: '',
        status: 'available',
        product_type_id: '',
        brand_name: '',
        scientific_name: '',
        is_active: true,
    })
    const createProductHandler: FormEventHandler = (e) => {
        e.preventDefault()
        if (data.category_id === 'none') setData('category_id', null);
        if (data.supplier_id === 'none') setData('supplier_id', null);
        console.log('Creating product with data:', data);
        post(route('products.store'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log("create post with data:", data)
                reset()
            },
            onError: (errors) => {
                console.log(errors);
                // reset()
                setData('with_begin_stock', false);
                toast.error(String(errors));
            }
        })
    }

    const generateSku = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const randomNumber = Math.floor(Math.random() * 10000) + 1000;
        const productType = product_types.find(type => type.id?.toString() === data.product_type_id);
        if (productName.current && productName.current.value) {
            const sku = `${productType?.type_code}${randomNumber}`;
            setData('sku', sku);
            if (productSku.current) {
                productSku.current.value = sku;
            }
        }
    }

    const brandNameIsChecked = !!data.brand_name;
    const productIsRawMaterial = data.product_type_id && product_types.find(type => type.id?.toString() === data.product_type_id)?.name?.toLowerCase() === 'raw material';
    const supplierIdIsNotNone = data.supplier_id && data.supplier_id !== 'none';
    const filteredLocations = locations.filter(location => location.warehouse_id === (data.warehouse_id ? Number(data.warehouse_id) : undefined));


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Product" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Create New Product</h1>
                    <Link href={route('products.index')} className={buttonVariants({ variant: 'secondary' })}>
                        Back to Products
                    </Link>
                </div>

                <form onSubmit={createProductHandler} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor='product_type'>Product Type <span className='text-red-500'>*</span></Label>
                        <Select
                            onValueChange={(value) => {
                                setData('product_type_id', String(value))
                                setData('scientific_name', '')
                            }}
                            value={String(data.product_type_id)}
                            defaultValue={String(data.product_type_id)}
                            required
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a product type" />
                            </SelectTrigger>
                            <SelectContent>
                                {product_types.map((type) => (
                                    <SelectItem key={type.id} value={String(type.id)}>
                                        {type.name} ({type.type_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <InputError message={errors.unit} />
                    </div>
                    <div className={`grid gap-2 ${productIsRawMaterial ? 'md:grid-cols-2' : ''}`}>
                        <div className="grid gap-2">
                            <Label htmlFor='name' className=''>Product Name <span className='text-red-500'>*</span></Label>
                            <Input
                                id='name'
                                ref={productName}
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value)
                                }}
                                className='mt-1 block w-full'
                                placeholder='Product Name'
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        {productIsRawMaterial && (
                            <div className="grid gap-2">
                                <Label htmlFor='name'>Scientific Name (INCI name)</Label>
                                <Input
                                    id='name'
                                    ref={productScientificName}
                                    value={data.scientific_name}
                                    onChange={(e) => setData('scientific_name', e.target.value)}
                                    className='mt-1 block w-full'
                                    placeholder='Product Scientific Name'
                                />
                                <InputError message={errors.scientific_name} />
                            </div>
                        )}

                    </div>

                    <div className="grid gap-2">

                        <div>
                            <Label htmlFor='sku'>SKU <span className='text-red-500'>*</span></Label>
                            <div className='flex w-full max-md items-center gap-2'>
                                <Input
                                    id='sku'
                                    ref={productSku}
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    placeholder='SKU'
                                    className='mt-1 block w-full'
                                    required
                                />
                                <InputError message={errors.sku} />
                                {productName.current && productName.current.value && (
                                    <Button className="md:self-end" variant={'secondary'} onClick={(e) => generateSku(e)}>Generate SKU</Button>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className='grid md:grid-cols-2 gap-2'>
                        <div className="grid gap-2">
                            <Label htmlFor='unit'>Unit <span className='text-red-500'>*</span></Label>
                            <Select
                                onValueChange={(value) => setData('unit', String(value))}
                                value={String(data.unit)}
                                defaultValue={String(data.unit)}
                                required
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
                    </div>

                    <Separator className='my-4' />
                    <div className='flex items-center gap-4'>
                        <Label htmlFor=''>Options :</Label>
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

                        {supplierIdIsNotNone && (
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='add_brand_name'
                                    name='add_brand_name'
                                    checked={!!data.brand_name}
                                    disabled={!data.name}
                                    onCheckedChange={(checked) => {
                                        setData('brand_name', checked ? data.name : '');
                                    }}
                                />
                                <Label htmlFor='add_brand_name'>With Brand Name</Label>
                            </div>
                        )}
                    </div>
                    {brandNameIsChecked && supplierIdIsNotNone && (
                        <div className="grid gap-2">
                            <Label htmlFor='name'>Brand Name</Label>

                            <Input
                                id='brand_name'
                                ref={productBrandName}
                                value={data.brand_name}
                                onChange={(e) => setData('brand_name', e.target.value)}
                                className='mt-1 block w-full'
                                placeholder='Product Brand Name'
                            />

                            <InputError message={errors.brand_name} />
                        </div>
                    )}
                    {data.with_begin_stock && (
                        <>
                            <div className={`grid gap-2 ${filteredLocations.length > 0 ? 'md:grid-cols-2' : ''}`}>
                                <div className="grid gap-2">
                                    <Label htmlFor='supplier'>Supplier</Label>
                                    <Select
                                        onValueChange={(value) => setData('supplier_id', (String(value) === 'none' ? '' : String(value)))}
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
                                <div className="grid gap-2">
                                    <Label htmlFor='warehouse_id'>Warehouse</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setData('warehouse_id', String(value));
                                        }}
                                        value={String(data.warehouse_id)}
                                        defaultValue={String(data.warehouse_id)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.warehouse_id} />
                                </div>
                                {filteredLocations.length > 0 && (
                                    <div className="grid gap-2">
                                        <Label htmlFor='location_id'>Location</Label>
                                        <Select
                                            onValueChange={(value) => setData('location_id', String(value))}
                                            value={String(data.location_id)}
                                            defaultValue={String(data.location_id)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredLocations.map((location) => (
                                                    <SelectItem key={location.id} value={String(location.id)}>
                                                        {location.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.location_id} />
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor='price'>Price Per Unit</Label>
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
                            <div className='grid md:grid-cols-2 gap-4 md:gap-2'>
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
                                <div className="grid gap-2">
                                    <Label htmlFor='minimum_quantity'>Minimum Stock Quantity</Label>
                                    <Input
                                        id='minimum_quantity'
                                        type='number'
                                        min={0}
                                        value={data.minimum_quantity}
                                        onChange={(e) => setData('minimum_quantity', Number(e.target.value))}
                                        className='mt-1 block w-full'
                                    />

                                    <InputError message={errors.minimum_quantity} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Product</Button>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                id='enable_product'
                                name='enable_product'
                                checked={data.is_active}
                                onCheckedChange={(checked) => {
                                    setData('is_active', !!checked);
                                }}
                            />
                            <Label htmlFor='enable_product'>Enable Product</Label>
                        </div>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
