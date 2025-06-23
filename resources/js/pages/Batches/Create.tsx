import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from "@/components/ui/command";

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, ChevronsUpDown } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Batches',
        href: '/batches',
    },
    {
        title: 'Create New Batch',
        href: '/batches/create',
    },
];
type CreateBatchForm = {
    batch_number?: string,
    product_id?: number | string,
    manufacture_date?: Date | null,
    expiry_date?: Date | null,
}
export default function Create({ products }: { products: { id: number, name: string }[] }) {

    const batchNumber = useRef<HTMLInputElement>(null)
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateBatchForm>>({
        batch_number: '',
        product_id: '',
        manufacture_date: null,
        expiry_date: null,
    })

    const createBatch: FormEventHandler = (e) => {
        e.preventDefault()

        post(route('batch.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.batch_number) {
                    reset('batch_number')
                    batchNumber.current?.focus()
                }
            }
        })
    }

    // If manufacture_date is set, set expiry_date to 1 year later
    if (data.manufacture_date && !data.expiry_date) {
        const manufactureDate = new Date(data.manufacture_date);
        const expiryDate = new Date(manufactureDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        setData('expiry_date', expiryDate);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Batch" />
            <form onSubmit={createBatch} className='space-y-6 p-4 mt-12 w-full max-w-2xl mx-auto shadow-md rounded-lg'>

                <div className='grid gap-2'>
                    <Label htmlFor='product_id'>Product</Label>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-between", errors.product_id && "border-red-500 text-muted-foreground")}
                            >
                                {data.product_id ? products.find(p => p.id === data.product_id)?.name : <span className="text-muted-foreground">Select a product</span>}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Command>
                                <CommandInput placeholder="Search products..." />
                                <CommandList>
                                    <CommandEmpty>No products found. <Link href='#' className='text-sky-800'>Create Product</Link> </CommandEmpty>
                                    <CommandGroup>
                                        {products.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                onSelect={() => setData('product_id', product.id)}
                                                className='cursor-pointer select-none relative px-2 py-1.5 hover:bg-gray-100'
                                            >
                                                {product.name}
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
                    <Label htmlFor='name'>Batch Name</Label>

                    <Input
                        id='batch_number'
                        ref={batchNumber}
                        value={data.batch_number}
                        onChange={(e) => setData('batch_number', e.target.value)}
                        className='mt-1 block w-full'
                        placeholder='Batch Number'
                    />

                    <InputError message={errors.batch_number} />
                </div>



                <div className="grid gap-2">
                    <Label className="block mb-2">
                        Manufacture Date
                    </Label>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal w-full", errors.manufacture_date && "border-red-500 text-muted-foreground")}
                            >
                                {data.manufacture_date ? format(new Date(data.manufacture_date), 'yyyy-MM-dd') : <span className="text-muted-foreground">Select manufacture_date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="">
                            <Calendar
                                mode="single"
                                selected={data.manufacture_date ? new Date(data.manufacture_date) : undefined}
                                captionLayout='dropdown'
                                onSelect={(date) => setData('manufacture_date', date ?? null)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Label className="block mb-2">
                        Expiry Date
                    </Label>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal w-full", errors.expiry_date && "border-red-500 text-muted-foreground")}
                            >
                                {data.expiry_date ? format(new Date(data.expiry_date), 'yyyy-MM-dd') : <span className="text-muted-foreground">Select expiry_date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Calendar
                                mode="single"
                                selected={data.expiry_date ? new Date(data.expiry_date) : undefined}
                                captionLayout='dropdown'
                                onSelect={(date) => setData('expiry_date', date ?? null)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Create Batch</Button>
                </div>
            </form>
        </AppLayout >
    );
}
