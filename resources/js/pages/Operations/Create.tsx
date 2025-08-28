import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { BreadcrumbItem } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { FormEventHandler } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

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
    remarks: string;
}

type Batch = {
    id: number;
    batch_number: string;
}

type Location = {
    id: number;
    name: string;
}


export default function Create({ stocks, products, locations, batches, units }: { stocks: any[], products: any[], locations: any[], batches: any[], units: any[] }) {
    const { data, setData, post, reset, processing, errors } = useForm<OperationForm>({
        product: '',
        batch: '',
        quantity: 0,
        location: '',
        date: '',
        unit: '',
        operationType: 'outbound',
        remarks: '',
    });

    // Ensure products are unique by ID only
    const uniqueProductIds = new Set();
    const productList = products.reduce((acc, item) => {
        if (!uniqueProductIds.has(item.id)) {
            uniqueProductIds.add(item.id);
            acc.push(item);
        }
        return acc;
    }, []);
    // const products = stocks.reduce((acc, stock) => {
    //     if (!uniqueProductIds.has(stock.product.id)) {
    //         uniqueProductIds.add(stock.product.id);
    //         acc.push(stock.product);
    //     }
    //     return acc;
    // }, []);

    // Product selection
    const selectedProduct = productList.find((product: any) => product.id.toString() === data.product);
    const selectedBatch = batches.find(batch => batch.id.toString() === data.batch);

    // Batch filtering based on selected product
    const filteredBatches = data.product
        ? batches.filter(
            (batch) =>
                batch.product_id === selectedProduct.id
        )
        : [];

    const currentStock = stocks.find(stock =>
        stock.batch_id === selectedBatch?.id &&
        (
            !data.location ||
            stock.location_id === parseInt(data.location)
        )
    );


    const stockQuantity = currentStock ? currentStock.quantity : 0;
    const stockUnit = currentStock ? currentStock.unit : 'units';

    // Filter unit have the same base_unit as the selected product
    const productUnit = selectedProduct?.unit;
    const filteredUnits = productUnit ?
        units.filter((unit) => unit.base_unit === productUnit?.base_unit) :
        units;

    const filteredLocations = selectedProduct ?
        locations.filter((location) => location.id === currentStock?.location_id) :
        [];


    const createOperation: FormEventHandler = (e) => {
        e.preventDefault();
        console.log("Creating operation with data:", data);
        post('/operations', {
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                console.error(errors);
            },
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Operation" />

            <div className="rounded-lg mt-12 shadow-md p-6 w-full max-w-4xl mx-auto">
                <form onSubmit={createOperation} className="space-y-6">
                    <h1 className="text-xl font-semibold mb-12">{data.operationType === 'outbound' ? 'Usage' : 'Receive'} Operation</h1>
                    <div className="mb-6">
                        <Label className="block mb-4">
                            Operation Type
                        </Label>
                        <Select onValueChange={(value) => {
                            setData('operationType', value);
                            setData('product', '');
                            setData('batch', '');
                            setData('location', '');
                            setData('quantity', 0);
                            setData('date', '');
                            setData('remarks', '');
                        }} value={data.operationType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select operation type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="outbound">
                                        Usage Operation
                                    </SelectItem>
                                    <SelectItem value="inbound" >
                                        Receive Operation
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={"col-span-1"}>
                            <Label className="block mb-2">
                                Product Name
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn("justify-between w-full", errors.product && "border-red-500 text-muted-foreground")}>
                                        {selectedProduct?.name ?? "Select a product"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Command>
                                        <CommandInput placeholder="Search product..." />
                                        <CommandList>
                                            <CommandEmpty>No products found</CommandEmpty>
                                            <CommandGroup>
                                                {productList.map((product: any) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.id.toString()}
                                                        onSelect={(value) => {
                                                            setData('product', value);
                                                            setData('batch', ''); // Reset batch when product changes
                                                            setData('unit', product.unit.toString()); // Set default unit from product
                                                            setData('location', ''); // Reset location when product changes
                                                            setData('quantity', 0); // Reset quantity when product changes
                                                            setData('date', ''); // Reset date when product changes
                                                            setData('remarks', ''); // Reset remarks when product changes

                                                        }}
                                                        className="cursor-pointer select-none relative flex items-center px-2 py-1.5 hover:bg-gray-100"
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", data.product === product.id.toString() ? "opacity-100" : "opacity-0")} />
                                                        {product.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label className="block mb-2">
                                Batch
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn("justify-between w-full", errors.batch && "border-red-500 text-muted-foreground")}>
                                        {selectedBatch?.batch_number ?? "Select a batch"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Command>
                                        <CommandInput placeholder="Search batch..." />
                                        <CommandList>
                                            <CommandEmpty>No batch found</CommandEmpty>
                                            <CommandGroup>
                                                {filteredBatches.map((batch: any) => (
                                                    <CommandItem
                                                        key={batch.id}
                                                        value={batch.id.toString()}
                                                        onSelect={(value) => {
                                                            setData('batch', value);
                                                            setData('location', '');
                                                        }}
                                                        className="cursor-pointer select-none relative flex items-center px-2 py-1.5 hover:bg-gray-100"
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", data.batch === batch.id.toString() ? "opacity-100" : "opacity-0")} />
                                                        {batch.batch_number}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {data.operationType === 'outbound' && (
                            <>
                                <div>
                                    <Label className="block mb-2">
                                        Location
                                    </Label>
                                    <Select onValueChange={(value) => setData('location', value)} value={data.location}
                                        disabled={filteredLocations.length === 0}>
                                        <SelectTrigger className={cn("w-full", errors.location && "border-red-500 text-muted-foreground")}>
                                            <SelectValue placeholder="Select a location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {filteredLocations.length > 0 ? (
                                                    filteredLocations.map((location: Location) => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="px-2 py-2 text-muted-foreground">No locations available</div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="block mb-2">
                                        Quantity
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                            className={cn("w-full", errors.quantity && "border-red-500 text-muted-foreground")}
                                            placeholder="Enter quantity"
                                            max={productUnit?.base_unit === stockUnit ? stockQuantity : undefined}
                                            min={1}
                                            step={0.01}
                                            disabled={!selectedBatch || stockQuantity <= 0}
                                        />
                                        <Select
                                            onValueChange={(value) => setData('unit', value)}
                                            value={data.unit}
                                            disabled={!selectedBatch || stockQuantity <= 0}
                                        >
                                            <SelectTrigger className={cn("w-full", errors.unit && "border-red-500 text-muted-foreground")}>
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
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Available stock: {stockQuantity} {stockUnit}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {data.operationType === 'inbound' && (
                            <>
                                <div>
                                    <Label className="block mb-2">
                                        Location
                                    </Label>
                                    <Select onValueChange={(value) => setData('location', value)} value={data.location}>
                                        <SelectTrigger className={cn("w-full", errors.location && "border-red-500 text-muted-foreground")}>
                                            <SelectValue placeholder="Select a location" />
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
                                                    <div className="px-2 py-2 text-muted-foreground">No locations available</div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="block mb-2">
                                        Quantity
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                            className={cn("w-full", errors.quantity && "border-red-500 text-muted-foreground")}
                                            placeholder="Enter quantity"

                                            min={1}
                                            step={0.01}

                                        />
                                        <Select
                                            onValueChange={(value) => setData('unit', value)}
                                            value={data.unit}

                                        >
                                            <SelectTrigger className={cn("w-full", errors.unit && "border-red-500 text-muted-foreground")}>
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
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Stock: {stockQuantity} {productUnit?.name || 'units'}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <Label className="block mb-2">
                                {data.operationType === 'outbound' ? 'Usage' : 'Receive'} Date
                            </Label>

                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("pl-3 text-left font-normal w-full", errors.date && "border-red-500 text-muted-foreground")}
                                        >
                                            {data.date ? format(new Date(data.date), 'yyyy-MM-dd') : <span className="text-muted-foreground">Select date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" captionLayout="dropdown" endMonth={new Date()} selected={data.date ? new Date(data.date) : undefined} onSelect={(date) => {
                                            if (date) {
                                                setData('date', format(date, 'yyyy-MM-dd'));
                                            } else {
                                                setData('date', '');
                                            }
                                        }}
                                            autoFocus />
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
                            {errors.date && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.date}
                                </p>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <Label className="block mb-2">
                                Remarks
                            </Label>
                            <Textarea
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className={cn("w-full", errors.remarks && "border-red-500 text-muted-foreground")}
                                placeholder="Enter any remarks"
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
                            {data.operationType === 'outbound' ? 'Create Usage Operation' : 'Create Receive Operation'}
                        </Button>
                    )}
                    {data.operationType === 'inbound' && (
                        <Button
                            variant="default"
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={processing || !data.product || !data.location || !data.quantity || Number(data.quantity) <= 0}
                        >
                            {data.operationType === 'inbound' ? 'Create Usage Operation' : 'Create Receive Operation'}
                        </Button>
                    )}
                </form>

            </div>
        </AppLayout>
    )
}

