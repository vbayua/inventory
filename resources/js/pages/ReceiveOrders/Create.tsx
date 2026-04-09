import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Product, Supplier } from '@/types/resources';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { SubmitEventHandler, useEffect, useState } from 'react';

export default function Create({ suppliers }: { suppliers: Supplier[] }) {
    const { data, setData, post, reset, processing, errors } = useForm({
        po_number: '',
        supplier_id: '',
        order_date: '',
        expected_date: '',
        items: [] as { product_id: number; price: string | number; quantity: number }[],
        notes: '',
        total_price: 0,
    });

    const [supplierOpen, setSupplierOpen] = useState(false);
    const [orderDateOpen, setOrderDateOpen] = useState(false);
    const [expectedDateOpen, setExpectedDateOpen] = useState(false);
    const [itemsOpen, setItemsOpen] = useState(false);
    const selectedSupplier = suppliers.find((supplier) => supplier.id === Number(data.supplier_id));
    const productList = selectedSupplier?.products || [];
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const filteredProducts = productList.filter((product) => !selectedProducts.find((p) => p.id === product.id));

    const totalPrice = data.items.reduce((total, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return total + price * item.quantity;
    }, 0);

    useEffect(() => {
        setData('total_price', totalPrice);
    }, [totalPrice, setData]);

    const addItems = (product: Product) => {
        if (!selectedProducts.find((p) => p.id === product.id)) {
            setSelectedProducts([...selectedProducts, product]);
            setData('items', [...data.items, { product_id: product.id, price: product.pivot?.price || 0, quantity: 1 }]);
        }
    };
    const removeItem = (product: Product) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
        setData(
            'items',
            data.items.filter((item) => item.product_id !== product.id),
        );
    };

    const clearItems = () => {
        setSelectedProducts([]);
        setData('items', []);
    };

    const createPOHandler: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.info('Form submitted with data:', data);

        post(route('purchase-orders.store'), {
            onSuccess: () => {
                reset();
            },
            onError: (error) => {
                // console.error('Failed to create purchase order:', error);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Purchase Order" />
            <ContainerFormLayout>
                <form className="space-y-6" onSubmit={createPOHandler}>
                    <div className="mb-4">
                        <h1 className="mb-4 text-2xl font-bold">Create Purchase Order</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Create a new purchase order.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="po_number">Nomor PO</Label>
                            <Input
                                id="po_number"
                                name="po_number"
                                type="text"
                                placeholder="No. PO"
                                onChange={(e) => setData('po_number', String(e.target.value))}
                            />
                            <InputError message={errors.po_number} className="mt-1" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Popover open={supplierOpen} onOpenChange={setSupplierOpen} defaultOpen={false}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-between',
                                            data.supplier_id ? 'text-primary' : 'text-muted-foreground',
                                            errors.supplier_id && 'text-muted-foreground border-red-500',
                                        )}
                                    >
                                        {data.supplier_id ? selectedSupplier?.partner?.name : 'Select Supplier'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-2" sideOffset={2}>
                                    <Command>
                                        <CommandInput placeholder="Search suppliers..." />
                                        <CommandEmpty>No suppliers found.</CommandEmpty>
                                        <CommandList>
                                            {suppliers.map((supplier) => (
                                                <CommandItem
                                                    key={supplier.id}
                                                    onSelect={() => {
                                                        setData('supplier_id', String(supplier.id));
                                                        clearItems();
                                                        setSupplierOpen(false);
                                                    }}
                                                >
                                                    {supplier.partner?.name}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.supplier_id} className="mt-1" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order_date">Order Date</Label>
                            <Popover open={orderDateOpen} onOpenChange={setOrderDateOpen} defaultOpen={false}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            errors.order_date && 'text-muted-foreground border-red-500',
                                        )}
                                    >
                                        {data.order_date ? (
                                            format(new Date(data.order_date), 'yyyy-MM-dd')
                                        ) : (
                                            <span className="text-muted-foreground">Select date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        endMonth={new Date()}
                                        selected={data.order_date ? new Date(data.order_date) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                setData('order_date', format(date, 'yyyy-MM-dd'));
                                            } else {
                                                setData('order_date', '');
                                            }
                                            setOrderDateOpen(false);
                                        }}
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.order_date} className="mt-1" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expected_date">Expected Delivery Date</Label>
                            <Popover open={expectedDateOpen} onOpenChange={setExpectedDateOpen} defaultOpen={false}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            errors.expected_date && 'text-muted-foreground border-red-500',
                                        )}
                                    >
                                        {data.expected_date ? (
                                            format(new Date(data.expected_date), 'yyyy-MM-dd')
                                        ) : (
                                            <span className="text-muted-foreground">Select date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        endMonth={new Date()}
                                        selected={data.expected_date ? new Date(data.expected_date) : undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                setData('expected_date', format(date, 'yyyy-MM-dd'));
                                            } else {
                                                setData('expected_date', '');
                                            }
                                            setExpectedDateOpen(false);
                                        }}
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={errors.expected_date} className="mt-1" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="items">Product Items</Label>
                        <div className="overflow-y-auto rounded-md">
                            {selectedProducts.length === 0 ? (
                                <div className="border-muted bg-muted flex h-32 items-center justify-center rounded-md border p-4">
                                    <p className="text-muted-foreground text-center">No items added. Please add items to the purchase order.</p>
                                </div>
                            ) : (
                                <div className="mt-6 max-h-96 space-y-2 overflow-y-auto rounded-md border md:mt-4">
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Price (IDR)</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Sub Total</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedProducts.map((product: Product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="text"
                                                            value={data.items.find((item) => item.product_id === product.id)?.price || 0}
                                                            onChange={(e) => {
                                                                const price = Number(e.target.value);
                                                                setData(
                                                                    'items',
                                                                    data.items.map((item) =>
                                                                        item.product_id === product.id ? { ...item, price } : item,
                                                                    ),
                                                                );
                                                            }}
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={data.items.find((item) => item.product_id === product.id)?.quantity || 1}
                                                            onChange={(e) => {
                                                                const quantity = Number(e.target.value);
                                                                setData(
                                                                    'items',
                                                                    data.items.map((item) =>
                                                                        item.product_id === product.id ? { ...item, quantity } : item,
                                                                    ),
                                                                );
                                                            }}
                                                            className="w-full"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {(
                                                            Number(data.items.find((item) => item.product_id === product.id)?.price || 0) *
                                                            Number(data.items.find((item) => item.product_id === product.id)?.quantity || 1)
                                                        ).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="destructive" size="icon" onClick={() => removeItem(product)}>
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                        {selectedProducts.length < productList.length && (
                            <Popover open={itemsOpen} onOpenChange={setItemsOpen} defaultOpen={false}>
                                <div className="mt-6 flex w-full items-center justify-end md:mt-8">
                                    <PopoverTrigger asChild>
                                        <Button size={'sm'} className="">
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </PopoverTrigger>
                                </div>
                                <PopoverContent className="w-full p-0" align="end">
                                    <Command>
                                        <CommandInput placeholder="Search products..." />
                                        <CommandEmpty>No products found.</CommandEmpty>
                                        <CommandList>
                                            {filteredProducts.map((product: Product) => (
                                                <CommandItem
                                                    key={product.id}
                                                    onSelect={() => {
                                                        addItems(product);
                                                        setItemsOpen(false);
                                                    }}
                                                >
                                                    {product.name} ({product.sku})
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="total_price" className="w-full">
                            Total Price: IDR
                        </Label>
                        <Input
                            id="total_price"
                            name="total_price"
                            type="text"
                            placeholder="Total Price"
                            value={`Rp. ${totalPrice.toLocaleString('id-ID')}`}
                            readOnly
                            className="bg-accent w-full cursor-not-allowed text-right align-middle text-4xl font-semibold tracking-wide"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className={cn('w-full', errors.notes && 'border-red-500')}
                            placeholder="Enter any additional notes"
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" variant="default" disabled={processing}>
                            Create Purchase Order
                        </Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
