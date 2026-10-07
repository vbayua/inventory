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
import { SubmitEventHandler, useEffect, useRef, useState } from 'react';

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

export default function Receive({ purchaseOrder, locations, batches, receiveAll }: { purchaseOrder: PurchaseOrder; locations: Location[]; batches: Batch[]; receiveAll: boolean }) {
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

    useEffect(() => {
        if (receiveAll) {
            const poItems = purchaseOrder.items?.map((item) => {
                return { ...item, quantity_received: (item.quantity - item.quantity_received) }
            })
            setData('items', poItems || []);
        }
    }, [receiveAll, purchaseOrder.items, setData]);

    const addItem = (item: PurchaseOrderItem) => {
        const newItem = { ...item, quantity_received: 0 };
        setData('items', [...data.items, newItem]);
    }

    const removeItem = (item: PurchaseOrderItem) => {
        const updatedItems = data.items.filter(i => i.id !== item.id);
        setData('items', updatedItems);
    }

    const clearSelectedItems = () => {
        setData('items', []);
    }

    const addAllItems = (items: PurchaseOrderItem[]) => {
        setData('items', items);
    }

    const toggleAllCheckbox = () => {
        if (data.items.length === (purchaseOrder.items?.length ?? 0) && data.items.length > 0) {
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

    const [openLocationIndex, setOpenLocationIndex] = useState<number | null>(null);
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
                                            <TableRow key={item.id} className={item.quantity_received === item.quantity ? 'bg-green-600' : ''}>
                                                    <TableCell><Checkbox className="border border-blue-100" checked={data.items.some(i => i.id === item.id)} onCheckedChange={(checked) => {
                                                        toggleSelectedItem(item, checked)
                                                }} /></TableCell>
                                                <TableCell className="text-xl">{item.product?.name}</TableCell>
                                                <TableCell className="text-xl text-center">{item.quantity}</TableCell>
                                                <TableCell className="flex justify-center">
                                                    {data.items.some(i => i.id === item.id) ?
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={item.quantity}
                                                            value={data.items.find(i => i.id === item.id)?.quantity_received ?? 0}
                                                            className="max-w-24 text-xl text-center p-2"
                                                            onChange={(e) => {
                                                                const qty = parseInt(e.target.value);
                                                                setData(prevData => ({
                                                                    ...prevData,
                                                                    items: prevData.items.map(i => i.id === item.id ? { ...i, quantity_received: qty } : i)
                                                                }))
                                                            }} />
                                                            : <span className="text-xl">{item.quantity_received ?? 0}</span>}

                                                    <InputError message={errors[`items.${index}.quantity_received`]} />
                                                </TableCell>
                                                    <TableCell>
                                                        {data.items.find(i => i.id === item.id)
                                                            ?
                                                            <Popover open={openLocationIndex === index} onOpenChange={(open) => setOpenLocationIndex(open ? index : null)}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="max-w-2xl justify-between text-left"
                                                                    >
                                                                        <span>
                                                                            {data.items.find((i) => i.id === item.id)?.location_id
                                                                                ? locations.find((l) => l.id === data.items.find((i) => i.id === item.id)?.location_id)?.name
                                                                                : 'Select Location'}
                                                                        </span>
                                                                        <ChevronDownIcon className="size-4" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full" align="start">
                                                                    <SelectCommand
                                                                        lists={locations}
                                                                        getId={(l) => l.id}
                                                                        getKey={(l) => l.id}
                                                                        renderItem={(l) => {
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
                                                                                const newItems = prevData.items.map((i) =>
                                                                                    i.id === item.id ? { ...i, location_id: l.id } : i,
                                                                                );
                                                                                return {
                                                                                    ...prevData,
                                                                                    items: newItems,
                                                                                };
                                                                            });

                                                                            setOpenLocationIndex(null);
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
