import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { CommandItem } from "cmdk";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { FormEventHandler, useState } from "react";
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
    date?: string; // Optional date field
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


export default function Create({ stocks, locations, batches }: { stocks: any[], locations: any[], batches: any[] }) {
    const { data, setData, post, reset, processing, errors } = useForm<OperationForm>({
        product: '',
        batch: '',
        quantity: 0,
        location: '',
        date: '',
        operationType: 'outbound',
        remarks: '',
    });

    const products = stocks.map(stock => stock.product);

    const selectedProduct = products.find(product => product.id.toString() === data.product);
    const selectedBatch = batches.find(batch => batch.id.toString() === data.batch);
    const selectedLocation = locations.find(location => location.id.toString() === data.location);
    const filteredBatches = selectedProduct
        ? batches.filter(
            (batch) =>
                batch.product_id === selectedProduct.id
        )
        : [];

    const stock = stocks.find((stock: {
        batch_id?: { id: number };
        quantity?: number
    }) =>
        stock.batch_id === selectedBatch?.id
    );
    const stockQuantity = stock ? stock.quantity : 0;
    const filteredLocations = selectedProduct ?
        locations.filter((location) => location.id === stock?.location_id) :
        [];


    const createOperation: FormEventHandler = (e) => {
        e.preventDefault();
        // console.log("Submitting form with data:", data);
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

            <div className="rounded-lg mt-12 shadow-md p-6 w-full">
                <form onSubmit={createOperation} className="space-y-6">
                    <h1 className="text-xl font-semibold mb-12">Usage Operation</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={"col-span-1"}>
                            <Label className="block mb-2">
                                Product
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
                                                {products.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.id.toString()}
                                                        onSelect={(value) => {
                                                            setData('product', value);
                                                            setData('batch', ''); // Reset batch when product changes

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
                                Batches
                            </Label>
                            <Select onValueChange={(value) => setData('batch', value)} value={data.batch}
                                disabled={!filteredBatches.length}>
                                <SelectTrigger className={cn("w-full", errors.batch && "border-red-500 text-muted-foreground")}>
                                    <SelectValue placeholder="Select a batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {filteredBatches.length > 0 ? (
                                            filteredBatches.map((batch: Batch) => (
                                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                                    {batch.batch_number}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-2 py-2 text-muted-foreground">No batches available</div>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

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
                            <Input
                                type="number"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                className={cn("w-full", errors.quantity && "border-red-500 text-muted-foreground")}
                                placeholder="Enter quantity"
                                max={stockQuantity}
                                min={1}
                            />
                            {selectedBatch && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Available stock: {stockQuantity} units
                                </p>
                            )}
                        </div>

                        <div>
                            <Label className="block mb-2">
                                Date
                            </Label>

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
                                    <Calendar mode="single" selected={data.date ? new Date(data.date) : undefined} onSelect={(date) => {
                                        if (date) {
                                            setData('date', format(date, 'yyyy-MM-dd'));
                                        } else {
                                            setData('date', '');
                                        }
                                    }} autoFocus />
                                </PopoverContent>
                            </Popover>
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
                    <Button
                        type="submit"
                        className="w-full sm:w-auto"
                    >
                        Submit Usage Operation
                    </Button>
                </form>

            </div>
        </AppLayout>
    )
}

