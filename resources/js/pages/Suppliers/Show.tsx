import ContainerLayout from '@/components/container-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, MoreHorizontal, Package, Phone, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';

type Product = {
    id: number;
    name?: string;
    sku?: string;
    unit?: string;
    categories?: {
        name?: string;
        slug?: string;
    };
    status?: string;
    pivot?: {
        price?: number;
    };
};

type ProductMin = {
    id: number;
    name?: string;
    sku?: string;
};

type Partner = {
    id: number;
    name?: string;
    phone_number?: string;
    email?: string;
    contact_person?: string;
    address?: string;
};
type Supplier = {
    id: number;
    partner?: Partner;
    notes?: string;
};

type ProductForm = {
    product_ids?: number[];
};

export default function Show({ supplier, products, totalProducts }: { supplier: Supplier; products: Product[]; totalProducts: number }) {
    const { allProducts } = usePage().props as { allProducts?: Array<ProductMin> };
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isPopoverOpen, setPopoverOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<ProductMin[]>([]);

    useEffect(() => {
        if (isDialogOpen && !allProducts) {
            router.reload({ only: ['allProducts'] });
        }
    }, [isDialogOpen, allProducts]);

    // useEffect(() => {
    //     router.reload()
    // })

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Suppliers',
            href: '/suppliers',
        },
        {
            title: `${supplier.partner?.name}`,
            href: `/supplier/${supplier.id}`,
        },
    ];

    const handleOpenForm = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const openState = isDialogOpen;
        setDialogOpen(!openState);
    };

    const { data, setData, put, reset, processing, errors } = useForm<ProductForm>({
        product_ids: [],
    });

    const availableProducts = useMemo(() => {
        const selectedIds = new Set(selectedProducts.map((p) => p.id));
        return allProducts?.filter((p) => !selectedIds.has(p.id));
    }, [selectedProducts, allProducts]);

    const handleSelectProduct = (product: ProductMin) => {
        const newSelected = [...selectedProducts, product];
        setSelectedProducts(newSelected);
        setData(
            'product_ids',
            newSelected.map((product) => product.id),
        );
    };

    const handleRemoveProduct = (productId: number) => {
        const newSelected = selectedProducts.filter((p) => p.id !== productId);
        setSelectedProducts(newSelected);
        setData(
            'product_ids',
            newSelected.map((product) => product.id),
        );
    };

    const clearSelectedProducts = () => {
        setSelectedProducts([]);
        setData('product_ids', []);
    };

    const handleSubmitProducts = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        put(route('supplier.assign-products', supplier.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                clearSelectedProducts();
            },
            onError: (errors) => console.log(errors),
        });
    };

    const getStockBadge = (status: string) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            out_of_stock: 'bg-red-100 text-red-800',
        };

        return colors[status as keyof typeof colors] || colors['available'];
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const stockStatus = totalProducts > 0 ? 'available' : 'out_of_stock';
    console.log(totalProducts);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${supplier?.partner?.name}`} />
            <ContainerLayout>
                <div>
                    {/* <h2 className="text-3xl font-semibold mb-2.5">{supplier.name}</h2>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                    <div className="grid grid-cols-2 gap-4 mt-4"></div> */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle>
                                    <h2 className="mb-2.5 text-3xl font-semibold">{supplier.partner?.name}</h2>
                                </CardTitle>
                                <Badge variant={'secondary'} className="px-4 py-2 text-base">
                                    <Package className="mr-2 h-4 w-4" />
                                    {totalProducts.toString()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="flex items-start gap-3">
                                    <Mail className="text-primary mt-0.5 h-5 w-5" />
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-sm">Email</p>
                                        <a
                                            href={supplier.partner?.email ? `mailto:${supplier.partner?.email}` : '#'}
                                            className="text-foreground hover:text-primary transition-colors"
                                        >
                                            {supplier.partner?.email ?? '-'}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="text-primary mt-0.5 h-5 w-5" />
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-sm">Phone</p>
                                        <a
                                            href={supplier.partner?.phone_number ? `tel:${supplier.partner?.phone_number}` : '#'}
                                            className="text-foreground hover:text-primary transition-colors"
                                        >
                                            {supplier.partner?.phone_number ?? '-'}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-primary mt-0.5 h-5 w-5" />
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-sm">Address</p>
                                        <p className="text-foreground">{supplier.partner?.address ?? '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    {/* Products Table */}
                    <Card>
                        <CardHeader className="mt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-6">
                                <CardTitle>Products Assigned</CardTitle>
                                <CardDescription>View and manage all products supplied by this vendor</CardDescription>
                            </div>
                            <div data-slot="card-action" className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                                {/* PRODUCT FORM DIALOG */}
                                <Dialog onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant={'default'} size={'sm'} className="hover:cursor-pointer">
                                            Assign Product
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-fitpy-12">
                                        <DialogHeader>
                                            <DialogTitle>Add Products</DialogTitle>
                                            <DialogDescription>{supplier.partner?.name}.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4">
                                            <div className="flex w-full flex-col gap-4 [--radius:1rem]">
                                                <div className="max-h-64 overflow-y-auto">
                                                    {selectedProducts?.map((product) => (
                                                        <Item key={product.id} variant="muted" size={'sm'} className="p-1">
                                                            <ItemContent>
                                                                <ItemTitle>
                                                                    {product.sku} - {product.name}
                                                                </ItemTitle>
                                                            </ItemContent>
                                                            <ItemActions>
                                                                <Button
                                                                    onClick={() => handleRemoveProduct(product.id)}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 hover:bg-red-500"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </ItemActions>
                                                        </Item>
                                                    ))}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Item variant={'default'} size={'default'} className="p-0">
                                                        <ItemContent>
                                                            <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant={'secondary'}
                                                                        role="combobox"
                                                                        aria-expanded={isPopoverOpen}
                                                                        className="text-start"
                                                                    >
                                                                        Add Product
                                                                        <Plus className="h-4 w-4" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent align="start" className="p-0" side="bottom">
                                                                    <Command>
                                                                        <CommandInput placeholder="Search product" />
                                                                        <CommandList>
                                                                            <CommandEmpty>No product found.</CommandEmpty>
                                                                            <CommandGroup>
                                                                                {availableProducts?.map((product) => (
                                                                                    <CommandItem
                                                                                        key={product.id}
                                                                                        onSelect={() => {
                                                                                            handleSelectProduct(product);
                                                                                            setPopoverOpen(false);
                                                                                        }}
                                                                                        className="hover:bg-primary"
                                                                                    >
                                                                                        {product.name}
                                                                                        <span className="ml-2 text-xs text-gray-500">
                                                                                            ({product.sku})
                                                                                        </span>
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </CommandList>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </ItemContent>
                                                    </Item>
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="sm:justify-between">
                                            <div>
                                                {selectedProducts.length !== 0 && (
                                                    <Button variant={'destructive'} onClick={clearSelectedProducts}>
                                                        Clear All
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <DialogClose asChild>
                                                    <Button variant="outline" onClick={clearSelectedProducts}>
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button onClick={handleSubmitProducts} disabled={processing}>
                                                    Save changes
                                                </Button>
                                            </div>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="h-14">
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Price per unit</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products ? (
                                            products?.map((product) => (
                                                <TableRow key={product.id} className="h-16">
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell className="">{product.sku}</TableCell>
                                                    <TableCell>
                                                        {product.categories?.name ? (
                                                            <Badge variant="secondary" className="px-3 py-1">
                                                                {product.categories?.name}
                                                            </Badge>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {product.pivot?.price ? formatPrice(product.pivot.price) : 0} / {product.unit}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="center">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('products.show', product.id)}>View Product</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Link href={route('stocks.index', { sku: product.sku })}>View Stocks</Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    No Results.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
