import ContainerLayout from '@/components/container-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Batch, Location, PurchaseOrder } from '@/types/resources';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, PenBoxIcon } from 'lucide-react';
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
                location_id: 1,
                quantity_received: 0,
                batch_id: '',
                notes: '',
            })) || [],
        notes: '',
    });
    // console.log(purchaseOrder);
    console.log(batches);
    // const filteredBatches = purchaseOrder.items?.
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

    const [popoverLocationOpen, setPopoverLocationOpen] = useState(false);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Receive Items for PO - ${purchaseOrder.po_number}`} />
            <div className="space-y-6">
                <div className="mb-4">
                    <Button variant={'link'} asChild>
                        <Link href={route('purchase-orders.show', purchaseOrder.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Purchase Order {purchaseOrder.po_number}
                        </Link>
                    </Button>
                </div>
                <ContainerLayout>
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
                                    <Popover>
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
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                autoFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.receive_date} />
                                </div>

                                <Table className="w-full border p-2.5">
                                    <TableCaption>
                                        Please enter the quantity of each item received and select the location where they will be stored.
                                    </TableCaption>
                                    <TableHeader className="bg-muted">
                                        <TableRow className="text-sm font-semibold">
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity Ordered</TableHead>
                                            <TableHead>Quantity Already Received</TableHead>
                                            <TableHead>Quantity to Receive</TableHead>
                                            <TableHead>Receive Locations</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y">
                                        {purchaseOrder.items?.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                className={item.quantity_received >= item.quantity ? 'bg-green-50' : 'hover:bg-muted/50'}
                                            >
                                                <TableCell>{item.product?.name}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.quantity_received} / {item.quantity}
                                                </TableCell>
                                                <TableCell className="w-48">
                                                    <Input
                                                        type="text"
                                                        value={data.items[index]?.quantity_received}
                                                        className="text-foreground w-max-full font-semibold"
                                                        readOnly
                                                    />
                                                    <InputError message={errors[`items.${index}.quantity_received`]} />
                                                </TableCell>
                                                <TableCell>{locations.find((loc) => loc.id === data.items[index]?.location_id)?.name}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="default" size="sm">
                                                                <PenBoxIcon className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-sm">
                                                            <DialogHeader>
                                                                <DialogTitle>{item.product?.name}</DialogTitle>
                                                                <DialogDescription>
                                                                    Set the quantity received and select the location for this item.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <FieldGroup>
                                                                <Field>
                                                                    <Label htmlFor="quantity_received">Quantity Received</Label>
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

                                                                    <InputError message={errors[`items.${index}.quantity_received`]} />
                                                                </Field>
                                                                <Field>
                                                                    <Label htmlFor="location_id">Receive Location</Label>
                                                                    <Popover
                                                                        open={popoverLocationOpen}
                                                                        onOpenChange={setPopoverLocationOpen}
                                                                        defaultOpen={false}
                                                                    >
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="w-full justify-between text-left"
                                                                            >
                                                                                {data.items[index]?.location_id
                                                                                    ? locations.find(
                                                                                          (loc) => loc.id === data.items[index].location_id,
                                                                                      )?.name || 'Select Location'
                                                                                    : 'Select Location'}
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent>
                                                                            <Command>
                                                                                <CommandInput placeholder="Search locations..." />
                                                                                <CommandEmpty>
                                                                                    {!locations && (
                                                                                        <div className="text-muted-foreground p-2 text-sm">
                                                                                            Loading...
                                                                                        </div>
                                                                                    )}
                                                                                    {locations && <div>No locations found.</div>}
                                                                                </CommandEmpty>
                                                                                <CommandList>
                                                                                    {locations &&
                                                                                        locations.map((location) => (
                                                                                            <CommandItem
                                                                                                key={location.id}
                                                                                                onSelect={() => {
                                                                                                    // Handle location selection logic here
                                                                                                    console.log('Selected location:', location);
                                                                                                    setData((prevData) => {
                                                                                                        const newItems = [...prevData.items];
                                                                                                        if (!newItems[index].location_id) {
                                                                                                            newItems[index].location_id = location.id;
                                                                                                        } else {
                                                                                                            // If a location is already selected, you can choose to replace it or allow multiple selections
                                                                                                            newItems[index].location_id = location.id; // Replace with the new selection
                                                                                                        }
                                                                                                        return { ...prevData, items: newItems };
                                                                                                    });
                                                                                                    setPopoverLocationOpen(false); // Close the popover after selection
                                                                                                }}
                                                                                            >
                                                                                                {location.name}
                                                                                            </CommandItem>
                                                                                        ))}
                                                                                </CommandList>
                                                                            </Command>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </Field>
                                                            </FieldGroup>
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button variant="outline">Cancel</Button>
                                                                </DialogClose>
                                                                <Button type="button">Save changes</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/*<Table className="w-full border p-2.5">
                                    <TableCaption>
                                        Please enter the quantity of each item received and select the location where they will be stored.
                                    </TableCaption>
                                    <TableHeader className="bg-muted">
                                        <TableRow className="text-sm font-semibold">
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity Ordered</TableHead>
                                            <TableHead>Quantity Already Received</TableHead>
                                            <TableHead>Quantity to Receive</TableHead>
                                            <TableHead>Receive Locations</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y">
                                        {purchaseOrder.items?.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                className={item.quantity_received >= item.quantity ? 'bg-green-50' : 'hover:bg-muted/50'}
                                            >
                                                <TableCell>{item.product?.name}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.quantity_received} / {item.quantity}
                                                </TableCell>
                                                <TableCell className="w-48">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={item.quantity - item.quantity_received}
                                                        value={data.items[index]?.quantity_received}
                                                        onChange={(e) => {
                                                            const newItems = [...data.items];
                                                            newItems[index].quantity_received = parseInt(e.target.value);
                                                            setData('items', newItems);
                                                        }}
                                                    />
                                                    <InputError message={errors[`items.${index}.quantity_received`]} />
                                                </TableCell>
                                                <TableCell>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" size="sm" className="w-full justify-between text-left">
                                                                {data.items[index]?.location_id
                                                                    ? locations.find((loc) => loc.id === data.items[index].location_id)?.name ||
                                                                      'Select Location'
                                                                    : 'Select Location'}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent>
                                                            <Command>
                                                                <CommandInput placeholder="Search locations..." />
                                                                <CommandEmpty>
                                                                    {!locations && (
                                                                        <div className="text-muted-foreground p-2 text-sm">Loading...</div>
                                                                    )}
                                                                    {locations && <div>No locations found.</div>}
                                                                </CommandEmpty>
                                                                <CommandList>
                                                                    {locations &&
                                                                        locations.map((location) => (
                                                                            <CommandItem
                                                                                key={location.id}
                                                                                onSelect={() => {
                                                                                    // Handle location selection logic here
                                                                                    console.log('Selected location:', location);
                                                                                    setData((prevData) => {
                                                                                        const newItems = [...prevData.items];
                                                                                        if (!newItems[index].location_id) {
                                                                                            newItems[index].location_id = location.id;
                                                                                        } else {
                                                                                            // If a location is already selected, you can choose to replace it or allow multiple selections
                                                                                            newItems[index].location_id = location.id; // Replace with the new selection
                                                                                        }
                                                                                        return { ...prevData, items: newItems };
                                                                                    });
                                                                                }}
                                                                            >
                                                                                {location.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>*/}
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex justify-end">
                            <Button disabled={processing}>Receive Items</Button>
                        </div>
                    </form>
                </ContainerLayout>
            </div>
        </AppLayout>
    );
}
