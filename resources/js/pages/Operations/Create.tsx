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
import { Head, useForm } from "@inertiajs/react";
import { CommandItem } from "cmdk";
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
    date?: string; // Optional date field
    operationType: string;
    remarks: string;
}

type Batch = {
    id: string;
    name: string;
}

type Location = {
    id: string;
    name: string;
}


export default function Create({ products, batches }: { products: any[], batches: any[] }) {

    const { data, setData, post, reset, processing, errors } = useForm<OperationForm>({
        product: '',
        batch: '',
        quantity: 0,
        operationType: 'outbound',
        remarks: '',
    });

    const selectedProduct = products.find(product => product.name === data.product);
    const filteredBatches = selectedProduct ? batches.filter(batch => batch.product_id === selectedProduct.id) : [];


    const createOperation: FormEventHandler = (e) => {
        e.preventDefault();
        console.log("Submitting form with data:", data);
        // post('/operations', {
        //     onSuccess: () => {
        //         reset()
        //     },
        //     onError: (errors) => {
        //         console.error(errors);
        //     },
        //     preserveScroll: true,
        // });
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Operation" />

            <div className="bg-white rounded-lg mt-12 shadow-md p-6 md:max-w-3xl max-sm:w-full mx-auto">
                <form onSubmit={createOperation} className="space-y-6">
                    <h1 className="text-xl font-semibold mb-12">Usage Operation</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="block mb-2">
                                Product
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn("justify-between w-full", errors.product && "border-red-500 text-muted-foreground")}>
                                        {data.product || "Select a product"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search product..." />
                                        <CommandList>
                                            <CommandEmpty>No products found</CommandEmpty>
                                            <CommandGroup>
                                                {products.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.name}
                                                        onSelect={(value) => {
                                                            setData('product', value);
                                                            setData('batch', ''); // Reset batch when product changes
                                                        }}
                                                        className="cursor-pointer select-none relative flex items-center px-2 py-1.5 hover:bg-gray-100"
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", data.product === product.name ? "opacity-100" : "opacity-0")} />
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
                                                <SelectItem key={batch.id} value={batch.name}>
                                                    {batch.name}
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
                                Quantity
                            </Label>
                            <Input
                                type="number"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                className={cn("w-full", errors.quantity && "border-red-500 text-muted-foreground")}
                                placeholder="Enter quantity"
                            />
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

