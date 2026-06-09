import ContainerLayout from '@/components/container-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SelectCommand from '@/components/ui/select-command';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Batch, Location, PurchaseOrder } from '@/types/resources';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDownIcon } from 'lucide-react';
import { SubmitEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
    },
    {
        title: 'Receive Items',
        href: '',
    },
];

export default function Receive({ purchaseOrder, locations, batches }: { purchaseOrder: PurchaseOrder; locations: Location[]; batches: Batch[] }) {
    breadcrumbs[1].href = `/purchase-orders/${purchaseOrder.id}/receive`;
    const { data, setData, post, processing, errors } = useForm({
        purchase_order_id: purchaseOrder.id,
        receive_order_number: '',
        reference_number: '',
        receive_date: '',
        items:
            purchaseOrder.items?.map((item) => ({
                purchase_order_item_id: item.id,
                product_id: item.product_id,
                location_id: item.product?.product_type?.default_location?.id ?? 1,
                quantity_received: 0,
                batch_id: '',
                notes: '',
            })) || [],
        notes: '',
        receive_all: false,
    });

    // const filteredBatches = batches.filter((batch) => batch.product_id === purchaseOrder.items?.[0].product_id); // Assuming all items are the same product, adjust as needed
    const receiveItemsHandler: SubmitEventHandler = (e) => {
        e.preventDefault();
        console.log(data);
        post(route('purchase-orders.process-receive', purchaseOrder.id), {
            onSuccess: () => {
                console.log('Items received successfully');
                console.log(data);
            },
            onError: (errors) => {
                console.log('Error receiving items:', errors);
            },
        });
    };

    // console.log(`Default location `, purchaseOrder.items?.[0].product?.product_type?.default_location?.id);

    // console.log(
    //     `PURCHASE ORDER ITEMS LOCATIONS `,
    //     purchaseOrder.items?.map((item) => item.location_id),
    // );

    const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
    const [batchPopoverOpen, setBatchPopoverOpen] = useState(false);
    const [receiveDatePopoverOpen, setReceiveDatePopoverOpen] = useState(false);
    const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Receive Items for PO - ${purchaseOrder.po_number}`} />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="mb-4">
                        <Button variant={'link'} asChild>
                            <Link href={route('purchase-orders.show', purchaseOrder.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Purchase Order {purchaseOrder.po_number}
                            </Link>
                        </Button>
                    </div>
                    <form onSubmit={receiveItemsHandler}>
                        <Card className="border-none">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Create Receive Order</CardTitle>
                                        <CardDescription>Enter the quantity of items received.</CardDescription>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-sm">Purchase Order: {purchaseOrder.po_number}</span>
                                    </div>
                                </div>
                                <hr className="my-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 space-y-2">
                                    <Label htmlFor="receive_order_number">Receive Order Number</Label>
                                    <Input
                                        id="receive_order_number"
                                        value={data.receive_order_number}
                                        placeholder="RO-12345"
                                        onChange={(e) => setData('receive_order_number', e.target.value)}
                                    />
                                    <InputError message={errors.receive_order_number} />
                                </div>
                                <div className="mb-4 space-y-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        placeholder="Optional reference number"
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                    />
                                    <InputError message={errors.reference_number} />
                                </div>
                                <div className="mb-4 space-y-2">
                                    <Label htmlFor="receive_date">Receive Date</Label>
                                    <Popover open={receiveDatePopoverOpen} onOpenChange={setReceiveDatePopoverOpen} defaultOpen={false}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                {data.receive_date ? new Date(data.receive_date).toLocaleDateString() : 'Select receive date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={data.receive_date ? new Date(data.receive_date) : undefined}
                                                onSelect={(date) => {
                                                    setData('receive_date', date?.toISOString() || '');
                                                    setReceiveDatePopoverOpen(false);
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                autoFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.receive_date} />
                                </div>

                                <Table className="w-full border p-2.5">
                                    <TableCaption>Click Item To Edit</TableCaption>
                                    <TableHeader className="bg-muted">
                                        <TableRow className="text-sm font-semibold">
                                            <TableHead>Product</TableHead>
                                            <TableHead>Order Quantity</TableHead>
                                            <TableHead>Quantity Received</TableHead>
                                            <TableHead>Receive Location</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y">
                                        {purchaseOrder.items?.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                className={`cursor-pointer ${item.quantity_received && item.quantity_received >= item.quantity ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-muted/50'}`}
                                                onClick={() => setOpenDialogIndex(index)}
                                            >
                                                <TableCell>
                                                    <div className="flex flex-col items-start gap-0.5">
                                                        {item.product?.name}
                                                        <span className="text-muted-foreground">{item.product?.sku}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.quantity_received} / {item.quantity}
                                                </TableCell>
                                                <TableCell className="w-48">
                                                    {data.items[index]?.quantity_received}
                                                    <InputError message={errors[`items.${index}.quantity_received`]} />
                                                </TableCell>
                                                <TableCell className="w-48">
                                                    {locations.find((l) => l.id === data.items[index]?.location_id)?.name}
                                                    <InputError message={errors[`items.${index}.location_id`]} />
                                                </TableCell>
                                                <Dialog
                                                    open={openDialogIndex === index}
                                                    onOpenChange={(open) => setOpenDialogIndex(open ? index : null)}
                                                >
                                                    <DialogContent className="sm:w-125 sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
                                                        <DialogHeader>
                                                            <DialogTitle>{item.product?.name}</DialogTitle>
                                                            <DialogDescription>
                                                                Set the quantity received and select the location for this item.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <FieldGroup>
                                                            <Field>
                                                                <Label htmlFor="product_name">Product</Label>
                                                                <Input
                                                                    id="product_name"
                                                                    className="text-muted-foreground"
                                                                    value={item.product?.name}
                                                                    readOnly
                                                                />
                                                            </Field>
                                                            <Field>
                                                                <Label htmlFor="quantity_ordered">Quantity Ordered</Label>
                                                                <Input
                                                                    id="quantity_ordered"
                                                                    className="text-muted-foreground"
                                                                    value={item.quantity}
                                                                    readOnly
                                                                />
                                                            </Field>
                                                            <Field>
                                                                <Label htmlFor="quantity_already_received">Quantity Already Received</Label>
                                                                <Input
                                                                    id="quantity_already_received"
                                                                    value={`${item.quantity_received} / ${item.quantity}`}
                                                                    className="text-muted-foreground"
                                                                    readOnly
                                                                />
                                                            </Field>
                                                            <Field>
                                                                <Label htmlFor="location_id">Location</Label>
                                                                <Popover
                                                                    open={locationPopoverOpen}
                                                                    onOpenChange={setLocationPopoverOpen}
                                                                    defaultOpen={false}
                                                                >
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="w-full justify-between text-left"
                                                                        >
                                                                            <span>
                                                                                {locations.find((l) => l.id === data.items[index]?.location_id)?.name}
                                                                            </span>
                                                                            <ChevronDownIcon className="size-4" />
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-full" align="start">
                                                                        <SelectCommand
                                                                            lists={locations}
                                                                            getId={(l) => l.id}
                                                                            getKey={(l) => l.id}
                                                                            getLabel={(l) => {
                                                                                return (
                                                                                    <p className="flex flex-col items-start gap-0.5">
                                                                                        {l.name}
                                                                                        <span className="text-muted-foreground text-xs">
                                                                                            ({l.warehouse?.name})
                                                                                        </span>
                                                                                    </p>
                                                                                );
                                                                            }}
                                                                            getSearchValue={(l) => l.name}
                                                                            onSelect={(l) => {
                                                                                setData((prevData) => {
                                                                                    const newItems = [...prevData.items];
                                                                                    newItems[index].location_id = l.id;
                                                                                    return {
                                                                                        ...prevData,
                                                                                        items: newItems,
                                                                                    };
                                                                                });

                                                                                setLocationPopoverOpen(false);
                                                                            }}
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </Field>

                                                            <Field>
                                                                <Label htmlFor="quantity_received">Receive Quantity</Label>
                                                                <div>
                                                                    <Input
                                                                        type="text"
                                                                        min={0}
                                                                        max={item.quantity - item.quantity_received}
                                                                        value={data.items[index]?.quantity_received ?? 0}
                                                                        onChange={(e) => {
                                                                            const newItems = [...data.items];
                                                                            const parsed = parseInt(e.target.value);
                                                                            newItems[index].quantity_received = isNaN(parsed) ? 0 : parsed;
                                                                            setData('items', newItems);
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        variant="secondary"
                                                                        onClick={() => {
                                                                            const newItems = [...data.items];
                                                                            const allRemainingQty = item.quantity - item.quantity_received;
                                                                            newItems[index].quantity_received = allRemainingQty;
                                                                            setData('items', newItems);
                                                                        }}
                                                                    >
                                                                        Receive All
                                                                    </Button>
                                                                </div>

                                                                <InputError message={errors[`items.${index}.quantity_received`]} />
                                                            </Field>
                                                        </FieldGroup>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button variant="outline">Close</Button>
                                                            </DialogClose>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex justify-end">
                            <Button disabled={processing}>Receive Items</Button>
                        </div>
                    </form>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
