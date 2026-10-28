import ConfirmDialog from "@/components/confirm-dialog";
import ContainerFormLayout from "@/components/container-form-layout";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SelectCommand from "@/components/ui/select-command";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Product } from "@/types/resources";
import { Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Production",
        href: "/production",
    },
    {
        title: "Create",
        href: "/production/create",
    }
];

export default function Create({finishedGoods}: {finishedGoods: Product[]}) {

    const {data, setData, post, reset, errors, processing} = useForm({
        order_number: '',
        product_id: '',
        bom_id: '',
        target_quantity: 0
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [productPopoverOpen, setProductPopoverOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setProductPopoverOpen(false);
        setData('product_id', String(product.id));
        setData('bom_id', String(product.active_bom?.id));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmOpen(true);
    };

    const submitForm = () => {
        post(route('production.store'), {
            onSuccess: () => reset(),
        })
    };

    console.log(finishedGoods)

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="text-2xl mb-4 font-bold">Create Production Order</h1>
                        <p className="text-muted-foreground mb-6 text-sm"></p>
                    </div>
                    <div className="">
                        <Button variant={'link'} asChild>
                            <Link href={route('production.index')}>
                                Back to index
                            </Link>
                        </Button>
                    </div>
                </div>
                <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <Label>Product</Label>
                        <Popover open={productPopoverOpen} onOpenChange={() => {
                            router.reload({only: ['finishedGoods']})
                            setProductPopoverOpen(!productPopoverOpen)
                        }}>
                            <PopoverTrigger>
                                <Input
                                    type="text"
                                    name="product_id"
                                    id="product_id"
                                    defaultValue={selectedProduct && `(${selectedProduct?.sku}) ${selectedProduct?.name}`}
                                    placeholder="Select Products"
                                    readOnly
                                />
                            </PopoverTrigger>
                            <PopoverContent>
                                <SelectCommand
                                    lists={finishedGoods}
                                    defaultValue={selectedProduct}
                                    onSelect={(item) => handleSelectProduct(item)}
                                    renderItem={(item) => <span>({item.sku}) {item.name}</span>}
                                    getKey={(item) => item.id}
                                    />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Bill Of Material</Label>
                        <Input type="text" id="bom" name="bom" defaultValue={selectedProduct? `${selectedProduct.name} v.${selectedProduct?.active_bom?.version}` : ''} placeholder="-" readOnly />
                        <InputError message={errors.bom_id} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Order Number</Label>
                        <Input
                            type="text"
                            name="order_number"
                            id="order_number"
                            onChange={(e) => setData('order_number', e.target.value)}
                        />
                        <InputError message={errors.order_number} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Target Quantity</Label>
                        <Input type="number" id="target_quantity" name="target_quantity" min={1} onChange={(e) => setData('target_quantity', parseInt(e.target.value))} />
                        <InputError message={errors.target_quantity} />
                    </div>
                    <Button variant="default" type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                    <ConfirmDialog
                        open={confirmOpen}
                        onOpenChange={setConfirmOpen}
                        title="Create Production Order"
                        description="Are you sure you want to create this order?"
                        onConfirm={submitForm}
                    />
                </form>

                <Separator />
                {selectedProduct && selectedProduct.active_bom && (
                    <div className="my-6 border border-blue-100/20 p-4 rounded-lg">
                        <h2 className="mb-4">Bill Of Material: {selectedProduct.name} - Version {selectedProduct.active_bom.version}</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead className="text-center">Quantity Per Unit</TableHead>
                                    <TableHead className="text-center">Unit</TableHead>
                                    <TableHead className="text-center">Scrap %</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedProduct.active_bom.lines?.map((line) => (
                                    <TableRow key={line.component_product_id}>
                                        <TableCell>{line.component?.name}</TableCell>
                                        <TableCell className="text-center">{line.quantity_per_unit}</TableCell>
                                        <TableCell className="text-center">{line.unit}</TableCell>
                                        <TableCell className="text-center">{line.scrap_percentage}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {selectedProduct && !selectedProduct.active_bom ? (
                    <div className="my-6 border border-blue-100/20 p-4 rounded-lg text-center">
                        <h2 className="text-xl font-semibold">No active BOM for this product</h2>
                    </div>
                ) : null}
            </ContainerFormLayout>
        </AppLayout>
    )
}
