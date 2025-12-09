import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SelectCommand from '@/components/ui/select-command';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { FormEventHandler, useEffect, useRef } from 'react';

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

type Batch = {
    id: number;
    batch_number: string;
};

type Location = {
    id: number;
    name: string;
};

type OperationType = 'outbound' | 'inbound' | 'adjustment' | 'transfer';
export default function Create({
    stocks,
    products,
    locations,
    batches,
    units,
    stockQuery,
    operationType,
}: {
    stocks: any[];
    products: any[];
    locations: Location[];
    batches: any[];
    units: any[];
    stockQuery?: any;
    operationType?: OperationType;
}) {
    // Ensure products are unique by ID only
    const uniqueProductIds = new Set();
    const productList = products.reduce((acc, item) => {
        if (!uniqueProductIds.has(item.id)) {
            uniqueProductIds.add(item.id);
            acc.push(item);
        }
        return acc;
    }, []);
    const quantityRef = useRef<HTMLInputElement>(null);
    const stockData = stockQuery;
    const locationId = operationType === 'inbound' ? '' : stockData?.location_id ? String(stockData.location_id) : '';
    const { data, setData, post, reset, processing, errors } = useForm<OperationForm>({
        product: stockData?.product_id ? String(stockData.product_id) : '',
        batch: stockData?.batch_id ? String(stockData.batch_id) : '',
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
    const selectedProduct = productList.find((product: any) => product.id.toString() === data.product);
    const selectedBatch = batches.find((batch) => batch.id.toString() === data.batch);
    const selectedLocation = locations.find((location) => location.id.toString() === data.location);
    const selectedLocationDestination = locations.find((location) => location.id.toString() === data.destination_location);

    // Batch filtering based on selected product
    const filteredBatches = data.product ? batches.filter((batch) => batch.product_id === selectedProduct.id) : [];

    const currentStock = stocks.find(
        (stock) => stock.product_id && selectedProduct?.id && stock.batch_id === selectedBatch?.id && stock.location_id === parseInt(data.location),
    );

    const stockQuantity = currentStock?.quantity ?? 0;
    const stockUnit = currentStock?.unit ?? 'units';

    // Filter unit have the same base_unit as the selected product
    const productUnit = selectedProduct?.unit;
    const filteredUnits = productUnit ? units.filter((unit) => unit.base_unit === productUnit?.base_unit) : units;

    useEffect(() => {
        if (stockData?.unit) {
            setData('unit', stockData?.unit);
        }
    }, [stockData]);
    const filteredLocations: Location[] =
        selectedProduct && selectedBatch
            ? locations.filter((location: Location) =>
                  stocks.some(
                      // for some stocks that are...
                      (stock: any) =>
                          stock.batch_id === selectedBatch.id &&
                          stock.product_id === selectedProduct.id &&
                          stock.location_id === location.id &&
                          stock.quantity > 0,
                  ),
              )
            : [];

    const createOperation: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Creating operation with data:', data);
        post('/operations', {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.error(errors);
            },
            preserveScroll: true,
        });
    };

    const operationTypes = [
        { value: 'outbound', label: 'Stock Out (Keluar/Pengeluaran)' },
        { value: 'inbound', label: 'Stock In (Masuk/Penerimaan)' },
        { value: 'transfer', label: 'Transfer Stock (Pindah)' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Operation" />
            <ContainerFormLayout>
                <form onSubmit={createOperation} className="space-y-6">
                    <h1 className="mb-12 text-2xl font-semibold">Operasi Stok</h1>
                    <div className="mb-6">
                        <Label className="mb-4 block">Jenis Operasi</Label>
                        <Select
                            onValueChange={(value) => {
                                setData('operationType', value);
                                // setData('product', '');
                                setData('batch', '');
                                setData('location', '');
                                setData('quantity', 0);
                                setData('date', '');
                                setData('remarks', '');
                            }}
                            value={data.operationType}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih jenis operasi (In, Out, Transfer)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {operationTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <InputError message={errors.operationType} />
                    </div>

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

                    <div className="space-y-6">
                        <div>
                            <Label className="mb-2 block">Nama Product</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn('w-full justify-between', errors.product && 'text-muted-foreground border-red-500')}
                                    >
                                        {selectedProduct?.name ?? 'Pilih product'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <SelectCommand
                                        lists={productList}
                                        getKey={(item) => item.id}
                                        getId={(item) => item.id}
                                        getLabel={(item) => item.name}
                                        onSelect={(item) => {
                                            setData('product', String(item.id));
                                            setData('batch', '');
                                            setData('location', '');
                                        }}
                                        placeholder="Cari product..."
                                        emptyText="No product found"
                                        getSearchValue={(item) => `${item.name} ${item.sku}`}
                                        renderItem={(item) => (
                                            <span>
                                                {item.name}
                                                <span className="text-muted-foreground ml-2 text-sm">({item.sku})</span>
                                            </span>
                                        )}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label className="mb-2 block">Batch</Label>
                            <Popover>
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
                                <PopoverContent className="p-0">
                                    <SelectCommand
                                        lists={filteredBatches}
                                        getKey={(item) => item.id}
                                        getId={(item) => item.id}
                                        getLabel={(item) => item.batch_number}
                                        onSelect={(item) => {
                                            setData('batch', String(item.id));
                                            setData('location', '');
                                        }}
                                        placeholder="Cari batch..."
                                        emptyText={
                                            <>
                                                <span>Tidak ada batch untuk product yang dipilih</span>
                                                <br />
                                                <Button variant={'link'} onClick={() => {}}>
                                                    Register Batch Baru?
                                                </Button>
                                            </>
                                        }
                                        renderItem={(item) => <span>{item.batch_number}</span>}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/*TRANSFER SECTION*/}
                        {data.operationType === 'transfer' && (
                            <>
                                <div>
                                    <Label className="mb-2 block">Lokasi Sumber</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-full justify-between', errors.location && 'text-muted-foreground border-red-500')}
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
                                                        {filteredLocations.map((location: any) => (
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
                                    <Label className="mb-2 block">Lokasi Tujuan</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-full justify-between', errors.location && 'text-muted-foreground border-red-500')}
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
                                            {currentStock && `In stock: ${stockQuantity} ${stockUnit}`}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                        {/*END OF TRANSFER SECTION*/}

                        {/*OUTBOUND SECTION*/}
                        {data.operationType === 'outbound' && (
                            <>
                                <div>
                                    <Label className="mb-2 block">Lokasi</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-full justify-between', errors.location && 'text-muted-foreground border-red-500')}
                                            >
                                                {selectedLocation?.name ?? 'Pilih lokasi'}
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
                                                }}
                                                placeholder="Search location..."
                                                emptyText="No location found"
                                                renderItem={(item) => <span>{item.name}</span>}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label className="mb-2 block">Quantity</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            ref={quantityRef}
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
                                            {currentStock && `In stock: ${stockQuantity} ${stockUnit}`}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                        {/*END OF OUTBOUND SECTION*/}

                        {/*INBOUND SECTION*/}
                        {data.operationType === 'inbound' && (
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
                                            {currentStock && `In Stock: ${stockQuantity} ${productUnit?.name || 'units'}`}
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

                        <div>
                            <Label className="mb-2 block">Tanggal Operasi Stok</Label>

                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-full pl-3 text-left font-normal', errors.date && 'text-muted-foreground border-red-500')}
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
                                                } else {
                                                    setData('date', '');
                                                }
                                            }}
                                            autoFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setData('date', format(new Date(), 'yyyy-MM-dd'))}
                                    disabled={processing}
                                    className="w-32"
                                >
                                    Set Today
                                </Button>
                            </div>
                            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <Label className="mb-2 block">Keterangan</Label>
                            <Textarea
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className={cn('w-full', errors.remarks && 'text-muted-foreground border-red-500')}
                                placeholder="Keterangan stok"
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
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
