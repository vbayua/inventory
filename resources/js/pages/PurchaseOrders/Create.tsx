import ContainerFormLayout from '@/components/container-form-layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Product, SupplierProducts } from '@/types/resources';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

export default function Create({ suppliers }: { suppliers: SupplierProducts[] }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        order_date: '',
        expected_date: '',
        notes: '',
    });

    const [supplierOpen, setSupplierOpen] = useState(false);
    const [orderDateOpen, setOrderDateOpen] = useState(false);
    const [expectedDateOpen, setExpectedDateOpen] = useState(false);
    const selectedSupplier = suppliers.find((supplier) => supplier.id === Number(data.supplier_id));
    const productList = selectedSupplier?.products || [];
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const filteredProducts = productList.filter((product) => !selectedProducts.find((p) => p.id === product.id));

    const addItems = (product: Product) => {
        if (!selectedProducts.find((p) => p.id === product.id)) {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const removeItem = (product: Product) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    };

    const clearItems = () => {
        setSelectedProducts([]);
    };

    const totalPrice = selectedProducts.reduce((total, product) => total + (Number(product.pivot?.price) || 0), 0);

    console.log(filteredProducts[0]);
    return (
        <AppLayout>
            <Head title="Create Purchase Order" />
            <ContainerFormLayout>
                <form className="space-y-6">
                    <div className="mb-4">
                        <h1 className="mb-4 text-2xl font-bold">Create Purchase Order</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Create a new purchase order.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="no_po">No. PO</Label>
                            <Input id="no_po" name="no_po" type="text" placeholder="No. PO" />
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
                                <PopoverContent className="w-full p-0">
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
                                        }}
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
                                        }}
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="items">Items</Label>
                        <div className="max-h-60 overflow-y-auto rounded-md border p-4">
                            {selectedProducts.length === 0 ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="secondary" size={'sm'} className="w-full">
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full">
                                        <Command>
                                            <CommandInput placeholder="Search products..." />
                                            <CommandEmpty>No products found.</CommandEmpty>
                                            <CommandList>
                                                {filteredProducts.map((product: Product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        onSelect={() => {
                                                            addItems(product);
                                                        }}
                                                    >
                                                        {product.name} ({product.sku})
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <div className="space-y-2">
                                    {selectedProducts.map((product: Product) => (
                                        <Item variant={'outline'} key={product.id}>
                                            <ItemContent>
                                                <ItemTitle>{product.name}</ItemTitle>
                                                <ItemDescription>{product.sku}</ItemDescription>
                                            </ItemContent>
                                            <ItemActions>
                                                <div>
                                                    <p className="mr-4">Price:</p>
                                                    <p>{product?.pivot?.price}</p>
                                                </div>
                                                <div>
                                                    <p className="mr-4">Qty:</p>
                                                    <Input type="number" min={1} defaultValue={1} className="mr-4 w-20" placeholder="Quantity" />
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        removeItem(product);
                                                    }}
                                                >
                                                    <TrashIcon className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            </ItemActions>
                                        </Item>
                                    ))}
                                    {selectedProducts.length < productList.length && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="secondary" size={'sm'} className="w-full">
                                                    <PlusIcon className="mr-2 h-4 w-4" />
                                                    Add Item
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search products..." />
                                                    <CommandEmpty>No products found.</CommandEmpty>
                                                    <CommandList>
                                                        {filteredProducts.map((product: Product) => (
                                                            <CommandItem
                                                                key={product.id}
                                                                onSelect={() => {
                                                                    addItems(product);
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
                            )}
                        </div>
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
                            readOnly
                            value={totalPrice}
                            className="bg-muted w-full cursor-not-allowed text-right align-middle font-medium"
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
                        <Button type="submit" variant="default">
                            Create Purchase Order
                        </Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
