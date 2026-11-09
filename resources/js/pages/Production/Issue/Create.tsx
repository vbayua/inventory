import ContainerFormLayout from "@/components/container-form-layout";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SelectCommand from "@/components/ui/select-command";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { ProductionOrder, ProductionOrderMaterial, Stock } from "@/types/resources";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

let breadcrumbs = [
    {
        title: 'Production',
        href: route('production.index'),
    },
    {
        title: 'Production Order Detail',
        href: '',
    },
    {
        title: 'Issue Material',
        href: '',
    },
];

export default function Create({production, stocks, material, suggestedBatch}: {production: ProductionOrder, stocks: Stock[], material: ProductionOrderMaterial, suggestedBatch: Stock | undefined}) {
    breadcrumbs[1].href = route('production.show', production.id);
    const {data, setData, post, processing, errors, transform} = useForm({
        request_uuid: crypto.randomUUID(),
        stock_id: null as number | null,
        quantity: '',
        note: '',
    })
    const pickErrors = errors as Record<string, string | undefined>;

    const [stockOpen, setStockOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Stock | undefined>(undefined);

    const selectBatch = (stock: Stock) => {
        setSelectedBatch(stock);
        setData((previous) => ({...previous, stock_id: stock.id, quantity: String(Number(stock.quantity))}));
    }

    const handleSuggestedBatch = () => {
        setStockOpen(false);
        router.reload({
            only: ['suggestedBatch'],
            onSuccess: (page) => {
                console.log(page)
                const suggested = page.props.suggestedBatch as Stock | null;
                if (suggested) {
                    selectBatch(suggested);
                } else {
                    toast.error('No suggested batch found');
                }
            },
        });
    }


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(({request_uuid, stock_id, quantity, note}) => ({
            request_uuid,
            picks: [{stock_id, quantity}],
            note,
        }));
        post(route('production.issue.store', {production: production.id, material: material.id}), {
            preserveScroll: true,
            onError: (formErrors) => {
                toast.error((formErrors as Record<string, string>).status ?? 'Failed to issue material');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue Material" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="text2xl mb-4 font-bold">Issue Material</h1>
                        <p className="text-muted-foreground mb-6 text-sm">({material.product?.sku}) {material.product?.name} - {production.order_number}</p>
                    </div>
                    <div className="">
                        <Button variant={'link'} asChild>
                            <Link href={route('production.show', production.id)}>
                                Back to index
                            </Link>
                        </Button>
                    </div>
                </div>
                <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1.5 col-span-2">
                        <Label>Stock</Label>
                        <Popover open={stockOpen} onOpenChange={setStockOpen}>
                            <PopoverTrigger asChild>
                                <Item className="border-muted-foreground">
                                    <ItemContent>
                                        <ItemTitle>{selectedBatch ? `${selectedBatch?.batch?.batch_number} - ${selectedBatch?.product?.name} - ${selectedBatch?.location?.name}` : 'Select Stock'}</ItemTitle>
                                    </ItemContent>
                                    <ItemActions>
                                        <Button variant="ghost" type="button">{selectedBatch ? `${Number(selectedBatch.quantity).toLocaleString()} ${selectedBatch.unit}` : ''}</Button>
                                    </ItemActions>
                                </Item>
                            </PopoverTrigger>
                            <PopoverContent className="w-full"  align="start">
                               <SelectCommand
                                    lists={stocks}
                                    onSelect={(item) => {selectBatch(item); setStockOpen(false)}}
                                    placeholder="Select a batch"
                                    emptyText="No batches found."
                                    renderItem={(item) => <Item key={item.id} className="w-full">
                                        <ItemContent>
                                            <div>
                                                <ItemTitle>{item.batch?.batch_number}</ItemTitle>
                                                <span>{item.product?.name}</span>
                                                <ItemDescription>{`${item.location?.name}`}</ItemDescription>
                                            </div>
                                            <div>
                                                <span>{Number(item.quantity)} {item.unit}</span>
                                            </div>
                                        </ItemContent>
                                    </Item>}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant={'default'} type="button" onClick={handleSuggestedBatch}>Auto-Select Batch</Button>
                        {pickErrors['picks.0.stock_id'] && <p className="text-sm text-red-500">{pickErrors['picks.0.stock_id']}</p>}
                    </div>
                    <div className="col-span-2 border border-blue-100/20 p-5 mb-4 max-w-5xl max-h-50 overflow-y-auto">
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Location</Label>
                        <Input
                            type="text"
                            readOnly
                            value={selectedBatch ? `${selectedBatch.location?.warehouse?.name ?? ''} - ${selectedBatch.location?.name ?? ''}` : ''}
                            placeholder="Select a batch first"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Quantity {selectedBatch ? `(${selectedBatch.unit})` : ''}</Label>
                        <Input
                            type="number"
                            min={0}
                            step="any"
                            max={selectedBatch ? Number(selectedBatch.quantity) : undefined}
                            value={data.quantity}
                            onChange={(e) => setData('quantity', e.target.value)}
                            disabled={!selectedBatch}
                        />
                        {pickErrors['picks.0.quantity'] && <p className="text-sm text-red-500">{pickErrors['picks.0.quantity']}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-2">
                        <Label>Notes</Label>
                        <Textarea value={data.note} onChange={(e) => setData('note', e.target.value)} />
                    </div>
                    <div>
                        <Button variant={'secondary'} type="submit" disabled={processing || !selectedBatch}>Submit</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    )
}
