import ContainerFormLayout from "@/components/container-form-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FormEventHandler, useEffect, useRef, useState } from "react";


interface EditBatchForm {
    batch_number?: string,
    manufacture_date?: Date | null,
    expiry_date?: Date | null,
}

export default function ({ batch, product, supplier }: { batch: any, product: any, supplier: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Batches',
            href: route('batch.index')
        },
        {
            title: String(batch.batch_number),
            href: route('batch.show', batch.id)
        },
        {
            title: "Edit",
            href: route('batch.edit', batch.id)
        },
    ]

    const { data, setData, put, reset, processing, errors } = useForm<Required<EditBatchForm>>({
        batch_number: String(batch.batch_number),
        manufacture_date: batch.manufacture_date,
        expiry_date: batch.expiry_date
    })

    const updateBatch: FormEventHandler = (e) => {
        e.preventDefault()
        console.log("Updating batch with data:", data)
        put(route('batch.update', {
            batch: batch.id,
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                //
            },
            onError: (errors: any) => {
                console.log(errors)
            }
        }))
    }

    const manufactureBtnRef = useRef<HTMLButtonElement>(null)
    const [openManufacturePopover, setOpenManufacturePopover] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('set_manufacture_date') === '1') {
            manufactureBtnRef.current?.focus()
            setOpenManufacturePopover(true)
        }
    }, [])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Batch Information" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text2xl font-bold mb-4">Edit {String(batch.batch_number)}</h1>
                        <p className="text-sm text-muted-foreground mb-6">Edit Batch Information</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={route('batch.show', batch.id)}>Back</Link>
                    </div>
                </div>
                <form onSubmit={updateBatch} className="space-y-6 mt-12 w-full mx-auto shadow-md rounded-lg" >

                    <div className="grid gap-2">
                        <Label>Batch Number</Label>
                        <Input
                            id="batch"
                            value={batch.batch_number}
                            className='mt-1 block w-full'
                            disabled
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Product Name</Label>
                        <Input
                            id="product"
                            value={product.name}
                            className='mt-1 block w-full'
                            disabled
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="block mb-2">
                            Manufacture Date
                        </Label>

                        <Popover open={openManufacturePopover} onOpenChange={setOpenManufacturePopover}>
                            <PopoverTrigger asChild>
                                <Button
                                    ref={manufactureBtnRef}
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
                                    onSelect={(date) => {
                                        setData('manufacture_date', date ?? null)
                                        setOpenManufacturePopover(false)
                                    }}
                                    endMonth={new Date(2099, 11, 31)} // Prevents selecting dates beyond 2099
                                    startMonth={new Date(1970, 0, 1)} // Prevents
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
                                    endMonth={new Date(2099, 11, 31)} // Prevents selecting dates beyond 2099
                                    startMonth={new Date(1970, 0, 1)} // Prevents
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label>Supplier</Label>
                        <Input
                            id="supplier"
                            value={supplier.name}
                            className='mt-1 block w-full'
                            disabled
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Update Batch</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    )
}
