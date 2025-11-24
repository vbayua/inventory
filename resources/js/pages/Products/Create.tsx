import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import SelectCommand from '@/components/products/select-command';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

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
    name?: string;
    brand_name?: string;
    manufacturer_name?: string;
    scientific_name?: string;
    sku?: string;
    unit?: number | string;
    price?: number;
    category_id?: string | null;
    supplier_id?: string | null;
    with_begin_stock?: boolean;
    quantity?: number;
    minimum_quantity?: number;
    container_capacity?: number;
    container_unit?: string;
    warehouse_id?: string | null;
    location_id?: string | null;
    status?: string;
    product_type_id?: string | null;
    is_active?: boolean;
};

type Category = {
    id?: number;
    name?: string;
};

type Partner = {
    id?: number;
    name?: string;
};

type Supplier = {
    id?: number;
    name?: string;
    partner?: Partner;
};

type Unit = {
    name?: string;
};

type ProductType = {
    id?: number;
    name?: string;
    type_code?: string;
};

type Location = {
    id?: number;
    warehouse_id?: number;
    name?: string;
};

type Warehouse = {
    id?: number;
    name?: string;
};

export default function Create({
    categories,
    suppliers,
    units,
    product_types,
    warehouses,
    locations,
    partners,
}: {
    categories: Category[];
    suppliers: Supplier[];
    units: Unit[];
    product_types: ProductType[];
    warehouses: Warehouse[];
    locations: Location[];
    partners: Partner[];
}) {
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
        container_capacity: 0,
        container_unit: '',
        warehouse_id: '',
        location_id: '',
        status: 'available',
        product_type_id: '',
        brand_name: '',
        scientific_name: '',
        manufacturer_name: '',
        is_active: true,
    });

    const isBeginStockChecked = data.with_begin_stock;
    const selectedSupplier = suppliers?.find((supplier) => supplier.id?.toString() === data.supplier_id);
    console.log(selectedSupplier);

    useEffect(() => {
        if (isBeginStockChecked && !suppliers && !partners) {
            router.reload({ only: ['suppliers', 'partners'] });
        }
    }, [isBeginStockChecked, suppliers, partners]);
    const createProductHandler: FormEventHandler = (e) => {
        e.preventDefault();
        if (data.category_id === 'none') setData('category_id', null);
        if (data.supplier_id === 'none') setData('supplier_id', null);
        console.log('Creating product with data:', data);
        post(route('products.store'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('create post with data:', data);
                reset();
            },
            onError: (errors) => {
                // reset()
                setData('with_begin_stock', false);
                Object.entries(errors).forEach(([field, message]) => {
                    toast.error(`${field}: ${message}`, { id: `error-${field}` });
                });
            },
        });
    };

    const productTypeById = new Map(product_types.map((type) => [type.id?.toString(), type]));
    const generateSku = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!data.name || !data.product_type_id) return;
        const randomNumber = Math.floor(Math.random() * 10000) + 1000;
        const productType = productTypeById.get(String(data.product_type_id));
        const sku = `${productType?.type_code || ''}${randomNumber}`;
        setData('sku', sku);
    };

    const brandNameIsChecked = !!data.brand_name;
    const productIsRawMaterial = data.product_type_id && productTypeById.get(String(data.product_type_id))?.type_code === 'RMP';
    const filteredLocations = locations.filter((location) => location.warehouse_id === (data.warehouse_id ? Number(data.warehouse_id) : undefined));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Product" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Create New Product</h1>
                    <Link href={route('products.index')} className={buttonVariants({ variant: 'secondary' })}>
                        Back to Products
                    </Link>
                </div>

                <form onSubmit={createProductHandler} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="product_type">
                            Product Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                setData('product_type_id', String(value));
                                setData('scientific_name', '');
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
                                        {type.name}
                                        <span className="text-muted-foreground">({type.type_code})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <InputError message={errors.unit} />
                    </div>
                    <div className={`grid gap-2 ${productIsRawMaterial ? 'md:grid-cols-2' : ''}`}>
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="">
                                Product Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                }}
                                className="mt-1 block w-full"
                                placeholder="Product Name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        {productIsRawMaterial && (
                            <div className="grid gap-2">
                                <Label htmlFor="name">Scientific Name (INCI name)</Label>
                                <Input
                                    id="name"
                                    value={data.scientific_name}
                                    onChange={(e) => setData('scientific_name', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Product Scientific Name"
                                />
                                <InputError message={errors.scientific_name} />
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <div>
                            <Label htmlFor="sku">
                                SKU <span className="text-red-500">*</span>
                            </Label>
                            <div className="max-md flex w-full items-center gap-2">
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    placeholder="SKU"
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.sku} />
                                {data.name && (
                                    <Button className="md:self-end" variant={'secondary'} onClick={generateSku}>
                                        Generate SKU
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="unit">
                                Unit <span className="text-red-500">*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="text-muted-foreground w-full justify-between">
                                        {data.unit ? data.unit : 'Select a unit'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <SelectCommand
                                        lists={units}
                                        getId={(item) => String(item.name)}
                                        getLabel={(item) => String(item.name)}
                                        onSelect={(item) => {
                                            setData('unit', item.name ?? '');
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>

                            <InputError message={errors.unit} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="text-muted-foreground w-full justify-between">
                                        {data.category_id
                                            ? categories.find((category) => category.id?.toString() === data.category_id)?.name
                                            : 'Select a category'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <SelectCommand
                                        lists={categories}
                                        getId={(item) => String(item.id)}
                                        getLabel={(item) => String(item.name)}
                                        onSelect={(item) => {
                                            setData('category_id', item.id ? String(item.id) : '');
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.category_id} />
                        </div>
                    </div>

                    <Separator className="my-4" />
                    <div className="flex items-center gap-4">
                        <Label htmlFor="">Options :</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="with_begin_stock"
                                name="with_begin_stock"
                                checked={data.with_begin_stock}
                                onCheckedChange={(checked) => setData('with_begin_stock', !!checked)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="with_begin_stock">With Initial Stock</Label>
                            <InputError message={errors.with_begin_stock} />
                        </div>

                        {data.supplier_id && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="add_brand_name"
                                    name="add_brand_name"
                                    checked={!!data.brand_name}
                                    disabled={!data.name}
                                    onCheckedChange={(checked) => {
                                        setData('brand_name', checked ? data.name : '');
                                    }}
                                />
                                <Label htmlFor="add_brand_name">With Brand Name</Label>
                            </div>
                        )}
                    </div>
                    {brandNameIsChecked && data.supplier_id && (
                        <div className="grid gap-2">
                            <Label htmlFor="name">Brand Name</Label>

                            <Input
                                id="brand_name"
                                value={data.brand_name}
                                onChange={(e) => setData('brand_name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Product Brand Name"
                            />

                            <InputError message={errors.brand_name} />
                        </div>
                    )}

                    {/* WITH BEGIN STOCK */}
                    {data.with_begin_stock && (
                        <>
                            <div className={`grid gap-2 space-y-4`}>
                                <div className="grid gap-2">
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="text-muted-foreground w-full justify-between">
                                                {data.supplier_id ? selectedSupplier?.partner?.name : 'Select a supplier'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" align="start">
                                            <SelectCommand
                                                lists={suppliers}
                                                getId={(item) => String(item.id)}
                                                renderItem={(item) => item.partner?.name}
                                                getLabel={(item) => String(item.partner?.name)}
                                                onSelect={(item) => {
                                                    setData('supplier_id', String(item.id));
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.supplier_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="manufacturer_name">Manufacturer Name</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="text-muted-foreground w-full justify-between">
                                                {data.manufacturer_name ? data.manufacturer_name : 'Select a manufacturer'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" align="start">
                                            <SelectCommand
                                                lists={partners}
                                                getLabel={(p) => String(p.name)}
                                                onSelect={(p) => setData('manufacturer_name', p.name ?? '')}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.manufacturer_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="warehouse_id">Warehouse</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="text-muted-foreground w-full justify-between">
                                                {data.warehouse_id
                                                    ? warehouses.find((warehouse) => warehouse.id?.toString() === data.warehouse_id)?.name
                                                    : 'Select a warehouse'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" align="start">
                                            <SelectCommand
                                                lists={warehouses}
                                                getId={(item) => String(item.id)}
                                                getLabel={(item) => String(item.name)}
                                                onSelect={(item) => {
                                                    setData('warehouse_id', item.id ? String(item.id) : '');
                                                    setData('location_id', '');
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.warehouse_id} />
                                </div>
                                {filteredLocations.length > 0 && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="location_id">Location</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="text-muted-foreground w-full justify-between">
                                                    {data.location_id
                                                        ? filteredLocations.find((location) => location.id?.toString() === data.location_id)?.name
                                                        : 'Select a location'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <SelectCommand
                                                    lists={filteredLocations}
                                                    getId={(item) => String(item.id)}
                                                    getLabel={(item) => String(item.name)}
                                                    onSelect={(item) => {
                                                        setData('location_id', item.id ? String(item.id) : '');
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <InputError message={errors.location_id} />
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price Per Unit</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min={0}
                                    value={data.price}
                                    onChange={(e) => setData('price', Number(e.target.value))}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.price} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity">Set Initial Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min={0}
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', Number(e.target.value))}
                                        className="mt-1 block w-full"
                                    />

                                    <InputError message={errors.quantity} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="minimum_quantity">Minimum Stock Quantity</Label>
                                    <Input
                                        id="minimum_quantity"
                                        type="number"
                                        min={0}
                                        value={data.minimum_quantity}
                                        onChange={(e) => setData('minimum_quantity', Number(e.target.value))}
                                        className="mt-1 block w-full"
                                    />

                                    <InputError message={errors.minimum_quantity} />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 md:gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="container_capacity">Container Capacity</Label>
                                    <Input
                                        id="container_capacity"
                                        type="number"
                                        min={0}
                                        value={data.container_capacity}
                                        onChange={(e) => {
                                            setData('container_capacity', Number(e.target.value));
                                        }}
                                        className="mt-1 block w-full"
                                    />

                                    <InputError message={errors.container_capacity} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="container_unit">Container Unit</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                {data.container_unit ? data.container_unit : 'Select Unit'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" align="start">
                                            <SelectCommand
                                                lists={units}
                                                getId={(item) => String(item.name)}
                                                getLabel={(item) => String(item.name)}
                                                onSelect={(item) => {
                                                    setData('container_unit', item.name ?? '');
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Product</Button>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="enable_product"
                                name="enable_product"
                                checked={data.is_active}
                                onCheckedChange={(checked) => {
                                    setData('is_active', !!checked);
                                }}
                            />
                            <Label htmlFor="enable_product">Enable Product</Label>
                        </div>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
