import ContainerLayout from '@/components/container-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SelectCommand from '@/components/ui/select-command';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Batch, Location, PurchaseOrder, PurchaseOrderItem } from '@/types/resources';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDownIcon } from 'lucide-react';
import { SubmitEventHandler, useRef, useState } from 'react';

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
        items: [] as PurchaseOrderItem[],
        notes: '',
    });



    const receiveItemsHandler: SubmitEventHandler = (e) => {
        e.preventDefault();

        post(route('purchase-orders.process-receive', purchaseOrder.id), {
            onSuccess: () => {
                console.log('Items received successfully');
            },
            onError: (errors) => {
                console.log('Error receiving items:', errors);
            },
        });
    };

    const [selectedItems, setSelectedItems] = useState<PurchaseOrderItem[]>([]);

    const addItem = (item: PurchaseOrderItem) => {
        const newItem = { ...item };
        setSelectedItems([...selectedItems, newItem]);
        setData('items', [...selectedItems, newItem]);
    }

    const removeItem = (item: PurchaseOrderItem) => {
        const updatedItems = data.items.filter(i => i.id !== item.id);
        setSelectedItems(updatedItems);
        setData('items', updatedItems);
    }

    const clearSelectedItems = () => {
        setSelectedItems([]);
        setData('items', []);
    }

    const addAllItems = (items: PurchaseOrderItem[]) => {
        setSelectedItems(items);
        setData('items', items);
    }

    const toggleAllCheckbox = () => {
        if (selectedItems.length === data.items.length && selectedItems.length > 0 && data.items.length > 0) {
            clearSelectedItems();
        } else {
            addAllItems(purchaseOrder.items ?? []);
        }
    }

    const toggleSelectedItem = (item: PurchaseOrderItem, checked: boolean | string) => {
        if (checked) {
            addItem(item);
        } else {
            removeItem(item);
        }
    }

    const handleQuantityChange = (itemId: number, quantity: number = 0) => {
        const updatedItems = data.items.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity_received: quantity };
            }
            return item;
        });
        setData('items', updatedItems);
    }

    const inputRefs = useRef([]);

    const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
    const [batchPopoverOpen, setBatchPopoverOpen] = useState(false);
    const [receiveDatePopoverOpen, setReceiveDatePopoverOpen] = useState(false);
    const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
    console.log(data.items)

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
                                <div className="mt-6 space-y-6">
                                    <h2>Item(s) to Receive</h2>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead><Checkbox className="border-blue-100"  onCheckedChange={toggleAllCheckbox} /></TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-center">Order Quantity</TableHead>
                                                <TableHead className="text-center">Receive Quantity</TableHead>
                                                <TableHead>Receive Location</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {purchaseOrder.items?.map((item, index) => (
                                            <TableRow key={item.id} className={item.quantity_received ? 'bg-green-600' : ''}>
                                                    <TableCell><Checkbox className="border border-blue-100" checked={selectedItems.some(i => i.id === item.id)} onCheckedChange={(checked) => {
                                                        toggleSelectedItem(item, checked)
                                                }} /></TableCell>
                                                <TableCell className="text-xl">{item.product?.name}</TableCell>
                                                <TableCell className="text-xl text-center">{item.quantity}</TableCell>
                                                <TableCell className="flex justify-center">
                                                    {selectedItems.some(i => i.id === item.id) ?
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={item.quantity}
                                                            defaultValue={item.quantity_received ?? 0}
                                                            className="max-w-24 text-xl text-center p-2"
                                                            onChange={(e) => {
                                                                const qty = parseInt(e.target.value);
                                                                handleQuantityChange(item.id, qty);
                                                            }} />
                                                            : <span className="text-xl">{item.quantity_received}</span>}
                                                </TableCell>
                                                    <TableCell>
                                                        {selectedItems.find(i => i.id === item.id)
                                                            ?
                                                            <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen} defaultOpen={false}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="max-w-2xl justify-between text-left"
                                                                    >
                                                                        <span>
                                                                            {locations.find((l) => l.id === item.location_id)?.name}
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
                                                            : locations.find((l) => l.id === item.location_id)?.name}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                </Table>
                                </div>
                            </CardContent>
                        </Card>
                        <div>Selected Items : {data.items.length}</div>
                        <div className="mt-6 flex justify-end">
                            <Button disabled={processing}>Receive Items</Button>
                        </div>
                    </form>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
