import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useRef } from 'react';

import ContainerFormLayout from '@/components/container-form-layout';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ChevronsUpDown } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'List Batch',
        href: '/batches',
    },
    {
        title: 'Create New Batch',
        href: '/batches/create',
    },
];
interface CreateBatchForm {
    batch_number?: string;
    product_id?: number | string;
    supplier_id?: number | string;
    manufacture_date?: Date | null;
    expiry_date?: Date | null;
    operation_date?: Date | null;
    minimum_quantity?: string | number;
}

interface Supplier {
    id?: number;
    partner?: {
        name?: string;
    };
}

type Product = { id: number; name: string; sku: string; suppliers: Supplier[] };
export default function Create({ products, suppliers }: { products: Product[]; suppliers: Supplier[] }) {
    const batchNumber = useRef<HTMLInputElement>(null);
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateBatchForm>>({
        batch_number: '',
        product_id: '',
        supplier_id: '',
        manufacture_date: null,
        expiry_date: null,
        operation_date: null,
        minimum_quantity: 0,
    });

    const [productPopoverOpen, setProductPopoverOpen] = React.useState(false);
    const [supplierPopoverOpen, setSupplierPopoverOpen] = React.useState(false);
    const [manufactureDatePopover, setManufactureDatePopoverOpen] = React.useState(false);
    const [expiryDatePopover, setExpiryDatePopoverOpen] = React.useState(false);
    const [operationDatePopover, setOperationDatePopoverOpen] = React.useState(false);
    const createBatch: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Creating batch with data:', data);
        post(route('batch.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.batch_number) {
                    reset('batch_number');
                    batchNumber.current?.focus();
                }
            },
        });
    };

    // If manufacture_date is set, set expiry_date to 1 year later
    if (data.manufacture_date && !data.expiry_date) {
        const manufactureDate = new Date(data.manufacture_date);
        const expiryDate = new Date(manufactureDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        setData('expiry_date', expiryDate);
    }
    const selectedProduct = products.find((p) => p.id === data.product_id);
    const selectedSupplier = suppliers.find((s) => s.id === data.supplier_id);

    const filteredSupplier = data.product_id ? selectedProduct?.suppliers.map((s: Supplier) => s) : [];

    const generateBatchNumber = (e: React.MouseEvent<HTMLButtonElement>, product?: Product) => {
        e.preventDefault();
        if (product?.sku) {
            const date = new Date();
            const formattedDate = format(date, 'yy');
            setData('batch_number', `${formattedDate}${selectedProduct?.sku}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Batch" />
            <ContainerFormLayout>
                <div className="my-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Register Batch Baru</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Tambahkan data batch</p>
                    </div>
                </div>
                <form onSubmit={createBatch} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="product_id">
                            Product <span className="text-red-500">*</span>
                        </Label>

                        <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen} defaultOpen={false}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn('w-full justify-between', errors.product_id && 'text-muted-foreground border-red-500')}
                                >
                                    {data.product_id ? (
                                        `${selectedProduct?.sku} ${selectedProduct?.name}`
                                    ) : (
                                        <span className="text-muted-foreground">Pilih Product</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="center" className="p-1.5 sm:min-w-[425px]">
                                <Command>
                                    <CommandInput placeholder="Cari product..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            No products found.{' '}
                                            <Link href={route('products.create')} className="text-sky-800">
                                                Create Product
                                            </Link>{' '}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {products.map((product) => (
                                                <CommandItem
                                                    key={product.id}
                                                    onSelect={() => {
                                                        setData('product_id', product.id);
                                                        setData('batch_number', ''); // Reset batch number when product changes
                                                        setProductPopoverOpen(false);
                                                        batchNumber.current?.focus();
                                                    }}
                                                    className="relative cursor-pointer px-2 py-1.5 select-none hover:bg-gray-100"
                                                >
                                                    {product.name}
                                                    {product.sku && <span className="ml-2 text-xs text-gray-500">({product.sku})</span>}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                            <InputError message={errors.product_id} />
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="supplier_id">
                            Supplier <span className="text-red-500">*</span>
                        </Label>

                        <Popover open={supplierPopoverOpen} onOpenChange={setSupplierPopoverOpen} defaultOpen={false}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn('w-full justify-between', errors.supplier_id && 'text-muted-foreground border-red-500')}
                                >
                                    {data.supplier_id ? (
                                        `${selectedSupplier?.partner?.name}`
                                    ) : (
                                        <span className="text-muted-foreground">Pilih supplier</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                                <Command>
                                    <CommandInput placeholder="Search suppliers..." />
                                    <CommandList>
                                        <CommandEmpty>No suppliers found. </CommandEmpty>
                                        <CommandGroup>
                                            {filteredSupplier?.map((supplier: any) => (
                                                <CommandItem
                                                    key={supplier.id}
                                                    onSelect={() => {
                                                        setData('supplier_id', supplier.id);
                                                        setData('batch_number', ''); // Reset batch number when supplier changes
                                                        setSupplierPopoverOpen(false);
                                                        batchNumber.current?.focus();
                                                    }}
                                                    className="relative cursor-pointer px-2 py-1.5 select-none hover:bg-gray-100"
                                                >
                                                    {supplier.partner?.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                            <InputError message={errors.supplier_id} />
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label className="mb-2 block">Tanggal Manufacture</Label>

                        <Popover open={manufactureDatePopover} onOpenChange={setManufactureDatePopoverOpen} defaultOpen={false}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        errors.manufacture_date && 'text-muted-foreground border-red-500',
                                    )}
                                >
                                    {data.manufacture_date ? (
                                        format(new Date(data.manufacture_date), 'yyyy-MM-dd')
                                    ) : (
                                        <span className="text-muted-foreground">Pilih tanggal manufacture</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="">
                                <Calendar
                                    mode="single"
                                    selected={data.manufacture_date ? new Date(data.manufacture_date) : undefined}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setData('manufacture_date', date ?? null);
                                        setManufactureDatePopoverOpen(false);
                                    }}
                                    endMonth={new Date(2099, 11, 31)} // Prevents selecting dates beyond 2099
                                    startMonth={new Date(1970, 0, 1)} // Prevents
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label className="mb-2 block">Expiry Date</Label>

                        <Popover open={expiryDatePopover} onOpenChange={setExpiryDatePopoverOpen} defaultOpen={false}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn('w-full pl-3 text-left font-normal', errors.expiry_date && 'text-muted-foreground border-red-500')}
                                >
                                    {data.expiry_date ? (
                                        format(new Date(data.expiry_date), 'yyyy-MM-dd')
                                    ) : (
                                        <span className="text-muted-foreground">Pilih tanggal expire</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar
                                    mode="single"
                                    selected={data.expiry_date ? new Date(data.expiry_date) : undefined}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setData('expiry_date', date ?? null);
                                        setExpiryDatePopoverOpen(false);
                                    }}
                                    endMonth={new Date(2099, 11, 31)} // Prevents selecting dates beyond 2099
                                    startMonth={new Date(1970, 0, 1)} // Prevents
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="operation_date">Tanggal Kedatangan</Label>
                        <Popover open={operationDatePopover} onOpenChange={setOperationDatePopoverOpen} defaultOpen={false}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        errors.operation_date && 'text-muted-foreground border-red-500',
                                    )}
                                >
                                    {data.operation_date ? (
                                        format(new Date(data.operation_date), 'yyyy-MM-dd')
                                    ) : (
                                        <span className="text-muted-foreground">Pilih tanggal kedatangan</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar
                                    mode="single"
                                    selected={data.operation_date ? new Date(data.operation_date) : undefined}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setData('operation_date', date ?? null);
                                        setOperationDatePopoverOpen(false);
                                    }}
                                    endMonth={new Date(2099, 11, 31)} // Prevents selecting dates beyond 2099
                                    startMonth={new Date(1970, 0, 1)} // Prevents
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="minimum_quantity">
                            Minimum Quantity Stock <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                id="minimum_quantity"
                                value={data.minimum_quantity}
                                onChange={(e) => setData('minimum_quantity', Number(e.target.value))}
                                className={cn('w-full', errors.minimum_quantity && 'text-muted-foreground border-red-500')}
                                min={0}
                                required
                            />
                        </div>
                        <InputError message={errors.minimum_quantity} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Batch</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
