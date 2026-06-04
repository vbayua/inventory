import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SelectCommand from '@/components/ui/select-command';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Batch, Location, Product, Stock, Unit, Warehouse } from '@/types/resources';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    BoxesIcon,
    CalendarIcon,
    Check,
    ChevronsUpDown,
    FilterIcon,
    HashIcon,
    Warehouse as IconWarehouse,
    LocateIcon,
    NotepadTextIcon,
    PackageIcon,
} from 'lucide-react';
import { SubmitEventHandler, useEffect, useMemo, useRef, useState } from 'react';

import { ButtonGroup } from '@/components/ui/button-group';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import OperationTypeSelect from './page-components/Create/OperationTypeSelect';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Operations',
        href: '/operations',
    },
    {
        title: 'Create New Operation',
        href: '/operations/create',
    },
];

type OperationForm = {
    product: string;
    batch: string;
    quantity: string | number;
    location: string;
    date?: string; // Optional date field,
    unit: string;
    operationType: string;
    adjustmentType: string;
    remarks: string;
    // transfer operation might need more fields like destination location
    source_location?: string;
    destination_location?: string;
};

type OperationType = 'outbound' | 'inbound' | 'adjustment' | 'transfer' | 'return';

interface ProductsWithLinks extends Product {
    links?: {
        active: boolean;
        label: string;
        page: number;
        url: string;
    }[];
    data?: Product[];
    total: number;
}

export default function Create({
    stocks,
    products,
    warehouses,
    locations,
    batches,
    units,
    stockQuery,
    operationType,
}: {
    stocks: Stock[];
    products: ProductsWithLinks[];
    warehouses: Warehouse[];
    locations: Location[];
    batches: Batch[];
    units: Unit[];
    stockQuery?: Stock;
    operationType?: OperationType;
    requests?: any;
}) {
    const quantityRef = useRef<HTMLInputElement>(null);
    const stock = {
        data: stockQuery ?? undefined,
    };
    const locationId = stock.data?.location_id ? String(stock.data.location_id) : '';
    const { data, setData, post, reset, processing, errors } = useForm<OperationForm>({
        product: stock.data?.product_id ? String(stock.data.product_id) : '',
        batch: stock.data?.batch_id ? String(stock.data.batch_id) : '',
        quantity: 0,
        location: locationId,
        date: '',
        unit: '',
        operationType: operationType || 'outbound',
        adjustmentType: 'addition',
        remarks: '',
        source_location: locationId,
        destination_location: '',
    });

    // Product selection
    // const selectedProduct = productList.find((product: any) => product.id.toString() === data.product);
    const [selectedProduct, setSelectedProduct] = useState<Product | null | undefined>(stock.data?.product_id ? stock.data?.product : null);
    const selectedBatch = batches.find((batch) => batch.id.toString() === data.batch);
    const selectedLocation = locations.find((location) => location.id.toString() === data.location);
    const selectedLocationDestination = locations.find((location) => location.id.toString() === data.destination_location);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null | undefined>(stock?.data?.location?.warehouse);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null | undefined>(
        stock.data?.unit ? units.find((unit) => unit.name === stock?.data?.unit) : null,
    );

    console.log(selectedWarehouse);

    // Batch filtering based on selected product

    // const filteredBatches = data.product ? batches.filter((batch) => batch.product_id === selectedProduct.id) : [];
    const filteredBatches = selectedProduct ? batches.filter((batch) => batch.product_id === selectedProduct.id) : [];
    const filteredLocations = useMemo(() => {
        if (!selectedProduct || !selectedBatch || !selectedWarehouse) return [];
        if (data.operationType === 'outbound') {
            return (
                selectedWarehouse.locations?.filter((location) =>
                    stocks.some(
                        (item: Stock) =>
                            item.batch_id === selectedBatch.id &&
                            item.product_id === selectedProduct.id &&
                            item.location_id === location.id &&
                            Number(item.quantity) > 0,
                    ),
                ) ?? []
            );
        }
        return selectedWarehouse.locations ?? [];
    }, [data.operationType, selectedProduct, selectedBatch, selectedWarehouse, stocks]);

    const currentStock = useMemo(() => {
        const currentStock =
            selectedProduct && selectedBatch && (data.location || selectedLocation)
                ? stocks.find(
                      (item) =>
                          item.batch_id === selectedBatch?.id &&
                          item.product_id === selectedProduct?.id &&
                          item.location_id === (parseInt(data.location) || selectedLocation?.id) &&
                          Number(item.quantity) > 0,
                  )
                : null;
        if (currentStock) {
            setSelectedUnit(units.find((unit) => unit.name === currentStock.unit));
            setSelectedWarehouse(warehouses.find((warehouse) => warehouse.id === currentStock.location?.warehouse_id));
            setData('unit', currentStock.unit);
        }
        return currentStock;
    }, [selectedProduct, selectedBatch, data.location, selectedLocation, stocks, units, setData, warehouses]);

    const stockQuantity = Number(currentStock?.quantity);
    const stockUnit = currentStock?.unit;
    // Filter unit have the same base_unit as the selected product
    const productUnit = selectedProduct?.unit;
    const filteredUnits = productUnit ? units.filter((unit) => unit.base_unit === productUnit?.base_unit) : units;

    useEffect(() => {
        if (stock.data?.unit) {
            setData('unit', stock.data?.unit);
        }
    }, [stock.data, setData]);

    const operationTypes = [
        { value: 'outbound', label: 'Stock Out (Keluar/Pengeluaran)' },
        { value: 'inbound', label: 'Stock In (Masuk/Penerimaan)' },
        { value: 'transfer', label: 'Transfer Stock (Pindah)' },
        { value: 'return', label: 'Pengembalian Stock' },
    ];

    const createOperation: SubmitEventHandler = (e) => {
        e.preventDefault();
        console.log('Creating operation with data:', data);
        post('/operations', {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.error(errors);
                for (const field in errors) {
                    toast.error(errors[field]);
                }
            },
            preserveScroll: true,
        });
    };

    const searchProduct = (params: { search_term: string; has_stock: boolean }) => {
        router.visit(route('operations.create', params), {
            only: ['products'],
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleOperationType = (value: string) => {
        setData('operationType', value);
        setData('batch', '');
        setData('location', '');
        setData('quantity', 0);
        setData('date', '');
        setData('remarks', '');
        setSelectedWarehouse(null);
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setData('product', String(product.id));
        setData('batch', '');
        setData('location', '');
        setData('quantity', 0);
        setData('date', '');
        setData('remarks', '');
        setSelectedWarehouse(null);
    };

    const handleSelectedWarehouse = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setData('location', '');
    };

    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [warehousePopoverOpen, setWarehousePopoverOpen] = useState(false);
    const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
    const [batchPopoverOpen, setBatchPopoverOpen] = useState(false);
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState({
        search_term: '',
        has_stock: false,
    });
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSearch = (value: { search_term: string; has_stock: boolean }) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            searchProduct(value);
        }, 300);
    };

    // useEffect(() => {
    //     router.visit(route('operations.create'), {
    //         only: ['products'],
    //         preserveScroll: true,
    //         preserveState: true,
    //     });
    // }, [hasStock]);

    useEffect(() => {
        if (!productDialogOpen) {
            setSearchTerm({ search_term: '', has_stock: false });
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            // Reset products filter when dialog closes
            router.visit(route('operations.create'), {
                only: ['products'],
                preserveScroll: true,
                preserveState: true,
            });
        }
    }, [productDialogOpen]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // console.log(products);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Operation" />
            <ContainerLayout>
                <form onSubmit={createOperation} className="mb-6 space-y-6">
                    <h1 className="mb-12 text-2xl font-semibold">Operasi Stok</h1>
                    <OperationTypeSelect
                        operationTypes={operationTypes}
                        selectedValue={data.operationType}
                        toggleOperationType={toggleOperationType}
                    />

                    {/*ADJUSTMENT SECTION*/}
                    {data.operationType === 'adjustment' && (
                        <div className="mb-6">
                            <Label className="mb-4 block">Jenis Adjustment</Label>
                            <Select
                                onValueChange={(value) => {
                                    setData('adjustmentType', value);
                                    setData('product', '');
                                    setData('batch', '');
                                    setData('location', '');
                                    setData('quantity', 0);
                                    setData('date', '');
                                    setData('remarks', '');
                                }}
                                value={data.adjustmentType}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Adjustment Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="addition">Addition</SelectItem>
                                        <SelectItem value="subtraction">Subtraction</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {/*END OF ADJUSTMENT SECTION*/}

                    <div className="space-y-4">
                        <div
                            className={cn(
                                'grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2',
                                (errors.product || errors.batch) && 'border-red-500',
                            )}
                        >
                            <Field>
                                <FieldLabel className="flex items-center gap-2">
                                    <PackageIcon className="text-primary w-4" />
                                    Product
                                </FieldLabel>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        className={cn('w-full', errors.product && 'text-muted-foreground border-red-500')}
                                        onClick={() => setProductDialogOpen(true)}
                                        type="button"
                                    >
                                        {selectedProduct ? `${selectedProduct?.sku} ${selectedProduct?.name}` : 'No Product Selected'}
                                    </Button>
                                </div>
                                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                                    <DialogContent className="w-full">
                                        <DialogHeader>
                                            <DialogTitle>Product List</DialogTitle>
                                        </DialogHeader>
                                        <ButtonGroup className="w-full">
                                            <Input
                                                type="text"
                                                placeholder="Search products..."
                                                value={searchTerm.search_term}
                                                onChange={(e) => {
                                                    const value = e.target.value;   
                                                    setSearchTerm({ ...searchTerm, search_term: value });
                                                }}
                                            />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button type="button" aria-label="Search" size="sm">
                                                        <FilterIcon />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuLabel>Filters</DropdownMenuLabel>
                                                        <DropdownMenuCheckboxItem
                                                            checked={searchTerm.has_stock}
                                                            onCheckedChange={(checked) => {
                                                                setSearchTerm({ ...searchTerm, has_stock: checked });
                                                            }}
                                                            className={cn('flex items-center gap-2', { 'bg-muted': searchTerm.has_stock })}
                                                        >
                                                            <span>Has Stock</span>
                                                        </DropdownMenuCheckboxItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            {/*<Button
                                                onClick={() => {
                                                    debouncedSearch(searchTerm);
                                                }}
                                                type="button"
                                                aria-label="Search"
                                                size="sm"
                                            >
                                                Filters
                                                <FilterIcon />
                                            </Button>*/}
                                        </ButtonGroup>
                                        <div className="mb-2 flex w-full items-center gap-2">
                                            <Button
                                                onClick={() => {
                                                    debouncedSearch(searchTerm);
                                                }}
                                                type="button"
                                                className="w-full"
                                                aria-label="Search"
                                                size="sm"
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                        <div className="relative max-h-96 w-full overflow-y-auto rounded-md border">
                                            <table className="w-full caption-bottom text-sm">
                                                <TableHeader className="bg-muted sticky top-0 z-10 font-medium *:font-bold">
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        {/*<TableHead>Quantity</TableHead>*/}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {products.data.map((product: Product) => (
                                                        <TableRow
                                                            key={product.id}
                                                            onClick={() => {
                                                                handleProductSelect(product);
                                                                setProductDialogOpen(false);
                                                            }}
                                                            className={selectedProduct?.id === product.id ? 'bg-muted/40' : ''}
                                                        >
                                                            <TableCell>
                                                                <div className="grid grid-cols-1">
                                                                    <span>{product.name}</span>
                                                                    <span>{product.sku}</span>
                                                                </div>
                                                            </TableCell>
                                                            {/*<TableCell>{product.quantity}</TableCell>*/}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </table>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <div>
                                                <span className="text-sm">
                                                    {products.from} to {products.to} out of {products.total} items
                                                </span>
                                            </div>
                                        </div>
                                        <div className="max-w-md overflow-x-auto">
                                            <Pagination>
                                                <PaginationContent>
                                                    {products.links &&
                                                        products.links.map((link) => (
                                                            <>
                                                                {link.label.includes('Previous') && (
                                                                    <PaginationItem>
                                                                        <PaginationPrevious preserveState href={link.url || '#'} />
                                                                    </PaginationItem>
                                                                )}
                                                                {link.label.includes('Next') && (
                                                                    <PaginationItem>
                                                                        <PaginationNext preserveState href={link.url || '#'} />
                                                                    </PaginationItem>
                                                                )}
                                                            </>
                                                        ))}
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </Field>

                            <Field>
                                <FieldLabel className="flex items-center gap-2">
                                    <BoxesIcon className="text-primary w-4" />
                                    Batch
                                </FieldLabel>
                                <div>
                                    <Popover open={batchPopoverOpen} onOpenChange={setBatchPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-full justify-between', errors.batch && 'text-muted-foreground border-red-500')}
                                            >
                                                {selectedBatch?.batch_number ?? 'Pilih batch'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="start">
                                            <SelectCommand
                                                lists={filteredBatches}
                                                getKey={(item) => item.id}
                                                getId={(item) => item.id}
                                                getLabel={(item) => item.batch_number}
                                                onSelect={(item) => {
                                                    setData('batch', String(item.id));
                                                    setData('location', '');
                                                    setBatchPopoverOpen(false);
                                                }}
                                                placeholder="Cari batch..."
                                                emptyText={
                                                    <>
                                                        <span>Tidak ada batch untuk product yang dipilih</span>
                                                        <br />
                                                        <Button
                                                            variant={'link'}
                                                            onClick={() => {
                                                                window.open(route('batch.create', { product: selectedProduct?.id }), '_blank');
                                                            }}
                                                        >
                                                            Register Batch Baru?
                                                        </Button>
                                                    </>
                                                }
                                                renderItem={(item) => <span>{item.batch_number}</span>}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </Field>
                        </div>

                        {/*TRANSFER SECTION*/}
                        {data.operationType === 'transfer' && (
                            <>
                                <div className={cn('grid grid-cols-2 gap-4 rounded-md border p-4', errors.location && 'border-red-500')}>
                                    <div>
                                        <Label className="mb-2 flex items-center gap-2">
                                            <IconWarehouse className="text-primary w-4" />
                                            From
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        errors.location && 'text-muted-foreground border-red-500',
                                                    )}
                                                >
                                                    {selectedLocation?.name ?? 'Pilih sumber lokasi'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search location..." />
                                                    <CommandList>
                                                        <CommandEmpty>No location found</CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredLocations.map((location) => (
                                                                <CommandItem
                                                                    key={location.id}
                                                                    value={location.id.toString()}
                                                                    onSelect={(value) => {
                                                                        setData('location', value);
                                                                        setData('source_location', value);
                                                                        setData('destination_location', '');
                                                                    }}
                                                                    className="relative flex cursor-pointer items-center px-2 py-1.5 select-none hover:bg-gray-100"
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            data.location === location.id.toString() ? 'opacity-100' : 'opacity-0',
                                                                        )}
                                                                    />
                                                                    {location.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="mb-2 flex items-center gap-2">
                                            <IconWarehouse className="text-primary w-4" />
                                            To
                                        </Label>
                                        <ButtonGroup>
                                            <Popover open={warehousePopoverOpen} onOpenChange={setWarehousePopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            'w-full justify-between',
                                                            errors.location && 'text-muted-foreground border-red-500',
                                                        )}
                                                    >
                                                        {selectedWarehouse?.name || 'Select Warehouse'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="start">
                                                    <SelectCommand
                                                        lists={warehouses}
                                                        getKey={(item) => item.id}
                                                        getId={(item) => item.id}
                                                        getLabel={(item) => item.name}
                                                        onSelect={(item) => {
                                                            handleSelectedWarehouse(item);
                                                            setWarehousePopoverOpen(false);
                                                        }}
                                                        placeholder="Search warehouse..."
                                                        emptyText="No warehouse found"
                                                        renderItem={(item) => <span>{item.name}</span>}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            'w-full justify-between',
                                                            errors.location && 'text-muted-foreground border-red-500',
                                                        )}
                                                    >
                                                        {selectedLocationDestination?.name ?? 'Pilih lokasi tujuan'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search location..." />
                                                        <CommandList>
                                                            <CommandEmpty>No location found</CommandEmpty>
                                                            <CommandGroup>
                                                                {locations.map(
                                                                    (location: any) =>
                                                                        location.id.toString() !== data.location && (
                                                                            <CommandItem
                                                                                key={location.id}
                                                                                value={location.id.toString()}
                                                                                onSelect={(value) => {
                                                                                    setData('destination_location', value);
                                                                                }}
                                                                                className="relative flex cursor-pointer items-center px-2 py-1.5 select-none hover:bg-gray-100"
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        'mr-2 h-4 w-4',
                                                                                        data.destination_location === location.id.toString()
                                                                                            ? 'opacity-100'
                                                                                            : 'opacity-0',
                                                                                    )}
                                                                                />
                                                                                {location.name}
                                                                            </CommandItem>
                                                                        ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </ButtonGroup>
                                    </div>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Quantity pada Lokasi Sumber</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={currentStock ? `${stockQuantity} ${stockUnit}` : 0}
                                            onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                            className={cn('w-full', errors.quantity && 'text-muted-foreground border-red-500')}
                                            disabled={true}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Quantity yang akan dipindah</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                            className={cn('w-full', errors.quantity && 'text-muted-foreground border-red-500')}
                                            placeholder="Enter quantity"
                                            max={productUnit?.base_unit === stockUnit ? stockQuantity : undefined}
                                            min={1}
                                            step={0.01}
                                            disabled={!selectedBatch || stockQuantity <= 0}
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn('w-full justify-between', errors.unit && 'text-muted-foreground border-red-500')}
                                                    disabled={!selectedBatch || stockQuantity <= 0}
                                                >
                                                    {data.unit ? data.unit : 'Pilih unit'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <SelectCommand
                                                    lists={filteredUnits}
                                                    getKey={(item) => item.name}
                                                    getId={(item) => item.name}
                                                    getLabel={(item) => item.name}
                                                    onSelect={(item) => {
                                                        setData('unit', item.name);
                                                    }}
                                                    placeholder="Pilih unit"
                                                    renderItem={(item) => <span>{item.name}</span>}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {selectedBatch && (
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {currentStock && `In stock: ${Number(stockQuantity)} ${stockUnit}`}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                        {/*END OF TRANSFER SECTION*/}

                        {/*OUTBOUND SECTION*/}
                        {data.operationType === 'outbound' && (
                            <>
                                <div className={cn('grid grid-cols-2 gap-4 rounded-md border p-4', errors.location && 'border-red-500')}>
                                    <div>
                                        <Label className="mb-2 flex items-center gap-2">
                                            <IconWarehouse className="text-primary w-4" /> Gudang
                                        </Label>
                                        <Popover open={warehousePopoverOpen} onOpenChange={setWarehousePopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        errors.location && 'text-muted-foreground border-red-500',
                                                    )}
                                                >
                                                    {selectedWarehouse?.name || 'Select Warehouse'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <SelectCommand
                                                    lists={warehouses}
                                                    getKey={(item) => item.id}
                                                    getId={(item) => item.id}
                                                    getLabel={(item) => item.name}
                                                    onSelect={(item) => {
                                                        handleSelectedWarehouse(item);
                                                        setWarehousePopoverOpen(false);
                                                    }}
                                                    placeholder="Search warehouse..."
                                                    emptyText="No warehouse found"
                                                    renderItem={(item) => <span>{item.name}</span>}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="mb-2 flex items-center gap-2">
                                            <LocateIcon className="text-primary w-4" />
                                            <span>Lokasi</span>
                                        </Label>
                                        <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        errors.location && 'text-muted-foreground border-red-500',
                                                    )}
                                                    disabled={!selectedWarehouse || !selectedBatch}
                                                >
                                                    {selectedLocation?.name ?? 'Select Location'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <SelectCommand
                                                    lists={filteredLocations}
                                                    getKey={(item) => item.id}
                                                    getId={(item) => item.id}
                                                    getLabel={(item) => item.name}
                                                    onSelect={(item) => {
                                                        setData('location', String(item.id));
                                                        setLocationPopoverOpen(false);
                                                    }}
                                                    placeholder="Search location..."
                                                    emptyText="No location found"
                                                    renderItem={(item) => <span>{item.name}</span>}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        'grid grid-cols-2 gap-4 rounded-md border p-4',
                                        (errors.quantity || errors.unit) && 'border-red-500',
                                    )}
                                >
                                    <Label className="flex items-center gap-2">
                                        <HashIcon className="text-primary w-4" />
                                        Quantity
                                    </Label>
                                    <div className="justify-self-end">
                                        <ButtonGroup>
                                            <Input
                                                type="number"
                                                ref={quantityRef}
                                                value={data.quantity}
                                                onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                                className={cn(errors.quantity && 'text-muted-foreground border-red-500')}
                                                placeholder="Enter quantity"
                                                max={productUnit?.unit_type === stockUnit ? stockQuantity : undefined}
                                                min={1}
                                                step={0.01}
                                                disabled={!selectedBatch || stockQuantity <= 0}
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn('justify-between', errors.unit && 'text-muted-foreground border-red-500')}
                                                        disabled={!selectedBatch || stockQuantity <= 0}
                                                        size={'sm'}
                                                    >
                                                        {data.unit ? data.unit : stockUnit ? stockUnit : 'Pilih unit'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="start">
                                                    <SelectCommand
                                                        lists={filteredUnits}
                                                        defaultValue={selectedUnit ? selectedUnit : undefined}
                                                        getKey={(item) => item.name}
                                                        getId={(item) => item.name}
                                                        getLabel={(item) => item.name}
                                                        onSelect={(item) => {
                                                            setData('unit', item.name);
                                                        }}
                                                        placeholder="Pilih unit"
                                                        renderItem={(item) => <span>{item.name}</span>}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </ButtonGroup>
                                    </div>
                                    {selectedBatch && (
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {currentStock && `In stock: ${Number(stockQuantity)} ${stockUnit}`}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                        {/*END OF OUTBOUND SECTION*/}

                        {/*INBOUND SECTION*/}
                        {data.operationType === 'inbound' && (
                            <>
                                <div className={cn('grid grid-cols-2 gap-4 rounded-md border p-4', errors.location && 'border-red-500')}>
                                    <div>
                                        <Label className="mb-2 flex items-center gap-2">
                                            <IconWarehouse className="text-primary w-4" /> Gudang
                                        </Label>
                                        <Popover open={warehousePopoverOpen} onOpenChange={setWarehousePopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        errors.location && 'text-muted-foreground border-red-500',
                                                    )}
                                                >
                                                    {selectedWarehouse?.name || 'Select Warehouse'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <SelectCommand
                                                    lists={warehouses}
                                                    defaultValue={selectedWarehouse ? selectedWarehouse : undefined}
                                                    getKey={(item) => item.id}
                                                    getId={(item) => item.id}
                                                    getLabel={(item) => item.name}
                                                    onSelect={(item) => {
                                                        handleSelectedWarehouse(item);
                                                        setWarehousePopoverOpen(false);
                                                    }}
                                                    placeholder="Search warehouse..."
                                                    emptyText="No warehouse found"
                                                    renderItem={(item) => <span>{item.name}</span>}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <Label className="mb-2 flex items-center gap-2">
                                            <LocateIcon className="text-primary w-4" />
                                            <span>Lokasi</span>
                                        </Label>
                                        <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        errors.location && 'text-muted-foreground border-red-500',
                                                    )}
                                                    disabled={!selectedWarehouse}
                                                >
                                                    {selectedLocation?.name ?? 'Select Location'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <SelectCommand
                                                    lists={filteredLocations}
                                                    getKey={(item) => item.id}
                                                    getId={(item) => item.id}
                                                    getLabel={(item) => item.name}
                                                    onSelect={(item) => {
                                                        setData('location', String(item.id));
                                                        setLocationPopoverOpen(false);
                                                    }}
                                                    placeholder="Search location..."
                                                    emptyText="No location found"
                                                    renderItem={(item) => <span>{item.name}</span>}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'grid grid-cols-2 gap-4 rounded-md border p-4',
                                        (errors.quantity || errors.unit) && 'border-red-500',
                                    )}
                                >
                                    <Label className="flex items-center gap-2">
                                        <HashIcon className="text-primary w-4" />
                                        Quantity
                                    </Label>
                                    <div className="justify-self-end">
                                        <ButtonGroup>
                                            <Input
                                                type="number"
                                                value={data.quantity}
                                                onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                                className={cn('w-full', errors.quantity && 'text-muted-foreground border-red-500')}
                                                placeholder="Enter quantity"
                                                min={1}
                                                step={0.01}
                                                disabled={!data.location}
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn('justify-between', errors.unit && 'text-muted-foreground border-red-500')}
                                                        size={'sm'}
                                                        disabled={!data.location}
                                                    >
                                                        {data.unit ? data.unit : stockUnit ? stockUnit : 'unit'}

                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="start">
                                                    <SelectCommand
                                                        lists={filteredUnits}
                                                        getKey={(item) => item.name}
                                                        getId={(item) => item.name}
                                                        getLabel={(item) => item.name}
                                                        onSelect={(item) => {
                                                            setData('unit', item.name);
                                                        }}
                                                        placeholder="Pilih unit"
                                                        renderItem={(item) => <span>{item.name}</span>}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </ButtonGroup>
                                    </div>
                                    {selectedBatch && (
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {currentStock && `Already in stock: ${Number(stockQuantity)} ${stockUnit || 'unit'}`}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {data.operationType === 'return' && (
                            <>
                                <div>
                                    <Label className="mb-2 block">Lokasi</Label>
                                    <Select onValueChange={(value) => setData('location', value)} value={data.location}>
                                        <SelectTrigger className={cn('w-full', errors.location && 'text-muted-foreground border-red-500')}>
                                            <SelectValue placeholder="Pilih lokasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {locations.length > 0 ? (
                                                    locations.map((location: Location) => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-muted-foreground px-2 py-2">No locations available</div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Quantity</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                            className={cn('w-full', errors.quantity && 'text-muted-foreground border-red-500')}
                                            placeholder="Enter quantity"
                                            min={1}
                                            step={0.01}
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn('w-full justify-between', errors.unit && 'text-muted-foreground border-red-500')}
                                                >
                                                    {data.unit ? data.unit : 'Select unit'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0" align="start">
                                                <SelectCommand
                                                    lists={filteredUnits}
                                                    getKey={(item) => item.name}
                                                    getId={(item) => item.name}
                                                    getLabel={(item) => item.name}
                                                    onSelect={(item) => {
                                                        setData('unit', item.name);
                                                    }}
                                                    placeholder="Pilih unit"
                                                    renderItem={(item) => <span>{item.name}</span>}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {selectedBatch && (
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {currentStock && `In Stock: ${Number(stockQuantity)} ${productUnit?.name || 'units'}`}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {data.operationType === 'adjustment' && (
                            <>
                                <div>
                                    <Label className="mb-2 block">Location</Label>
                                    <Select onValueChange={(value) => setData('location', value)} value={data.location}>
                                        <SelectTrigger className={cn('w-full', errors.location && 'text-muted-foreground border-red-500')}>
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {locations.length > 0 ? (
                                                    locations.map((location: Location) => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-muted-foreground px-2 py-2">No locations available</div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Quantity</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                            className={cn('w-full', errors.quantity && 'text-muted-foreground border-red-500')}
                                            placeholder="Enter quantity"
                                            min={1}
                                            step={0.01}
                                        />
                                        <Select onValueChange={(value) => setData('unit', value)} value={data.unit}>
                                            <SelectTrigger className={cn('w-full', errors.unit && 'text-muted-foreground border-red-500')}>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {filteredUnits.map((unit) => (
                                                        <SelectItem key={unit.name} value={unit.name.toString()}>
                                                            {unit.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedBatch && (
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Stock: {stockQuantity} {productUnit?.name || 'units'}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className={cn('grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2', errors.date && 'border-red-500')}>
                            <Label className="flex items-center gap-2">
                                <CalendarIcon className="text-primary w-4" />
                                Tanggal
                            </Label>

                            <div className="flex items-center gap-2 place-self-end">
                                <ButtonGroup>
                                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    errors.date && 'text-muted-foreground border-red-500',
                                                )}
                                                size="sm"
                                            >
                                                {data.date ? (
                                                    format(new Date(data.date), 'yyyy-MM-dd')
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
                                                selected={data.date ? new Date(data.date) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setData('date', format(date, 'yyyy-MM-dd'));
                                                        setDatePopoverOpen(false);
                                                    } else {
                                                        setData('date', '');
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setData('date', format(new Date(), 'yyyy-MM-dd'))}
                                        disabled={processing}
                                        className="bg-accent/75 text-accent-foreground"
                                        size="sm"
                                    >
                                        Set Today
                                    </Button>
                                </ButtonGroup>
                            </div>
                            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                        </div>

                        <div className="col-span-1 rounded-md border p-4 md:col-span-2">
                            <Label className="mb-4 flex items-center gap-1">
                                <NotepadTextIcon className="text-primary w-4" />
                                Notes / Remarks
                            </Label>
                            <Textarea
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className={cn('w-full', errors.remarks && 'text-muted-foreground border-red-500')}
                            />
                        </div>
                    </div>
                    {data.operationType === 'outbound' && (
                        <Button
                            variant="default"
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={processing || !data.product || !data.batch || !data.location || !data.quantity || Number(data.quantity) <= 0}
                        >
                            Buat Operasi Pengeluaran
                        </Button>
                    )}
                    {data.operationType === 'inbound' && (
                        <Button
                            variant="default"
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={processing || !data.product || !data.location || !data.quantity || Number(data.quantity) <= 0}
                        >
                            Buat Operasi Penerimaan
                        </Button>
                    )}
                    {data.operationType === 'adjustment' && (
                        <Button
                            variant="default"
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={processing || !data.product || !data.location || !data.quantity || Number(data.quantity) <= 0}
                        >
                            Create Adjust Operation
                        </Button>
                    )}
                    {data.operationType === 'transfer' && (
                        <Button
                            variant="default"
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={
                                processing ||
                                !data.product ||
                                !data.batch ||
                                !data.location ||
                                !data.destination_location ||
                                !data.quantity ||
                                Number(data.quantity) <= 0
                            }
                        >
                            Buat Operasi Transfer
                        </Button>
                    )}
                    {data.operationType === 'return' && (
                        <Button
                            variant="default"
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={processing || !data.product || !data.location || !data.quantity || Number(data.quantity) <= 0}
                        >
                            Buat Operasi Pengembalian
                        </Button>
                    )}
                </form>
            </ContainerLayout>
        </AppLayout>
    );
}
