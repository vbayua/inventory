import ConfirmDialog from "@/components/confirm-dialog";
import ContainerFormLayout from "@/components/container-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SelectCommand from "@/components/ui/select-command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Bom, BomLines, Product, Unit } from "@/types/resources";
import { Link, useForm } from "@inertiajs/react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "BoM Index",
        href: "/bom",
    },
];

export default function Edit({ bom, materials, units }: { bom: Bom; materials: Product[]; units: Unit[] }) {
    const initialLines: BomLines[] = bom.lines ?? [];

    const { data, setData, put, reset, processing } = useForm({
        materials: initialLines.map((line) => ({
            component_product_id: line.component_product_id,
            quantity_per_unit: Number(line.quantity_per_unit),
            unit: line.unit,
        })),
    });

    // Components are kept separate from form data so only primitive fields are submitted.
    const [selectedComponents, setSelectedComponents] = useState<Product[]>(
        initialLines.map((line) => line.component).filter((component): component is Product => component != null),
    );
    const [itemsOpen, setItemsOpen] = useState(false);
    const [unitOpenIndex, setUnitOpenIndex] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const filteredProducts = materials
        ? materials.filter((product) => !selectedComponents.find((component) => component.id === product.id))
        : [];

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        setConfirmOpen(true);
    };

    const submitForm = () => {
        put(route('bom.update', {bom: bom.id}), {
            onSuccess: () => {
                console.log(bom);
            },
            onError: (error) => {
                console.error(error);
                toast.error(error.message);
            },
        });
    };

    const addItems = (product: Product) => {
        if (selectedComponents.find((component) => component.id === product.id)) {
            return;
        }

        const productUnit = units.find((u) => u.name === (typeof product.unit === 'string' ? product.unit : product.unit?.name));
        setSelectedComponents([...selectedComponents, product]);
        setData('materials', [
            ...data.materials,
            {
                component_product_id: product.id,
                quantity_per_unit: 1,
                unit: productUnit?.name ?? '',
            },
        ]);
    };

    const removeItem = (componentProductId: number) => {
        setSelectedComponents(selectedComponents.filter((component) => component.id !== componentProductId));
        setData(
            'materials',
            data.materials.filter((line) => line.component_product_id !== componentProductId),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="text-2xl mb-4 font-bold">Edit BoM - {bom.product?.name} v. {bom.version}</h1>
                        <p className="text-muted-foreground mb-6 text-sm"></p>
                    </div>
                    <div className="">
                        <Button variant={'link'} asChild>
                            <Link href={route('bom.index')}>
                                Back to index
                            </Link>
                        </Button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Finished Good</Label>
                        <Input
                            id="finished_good"
                            name="finished_good"
                            value={`(${bom.product?.sku})${bom.product?.name}`}
                            type="text"
                            readOnly
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Materials</Label>
                        <div className="space-y-2">
                            <Label htmlFor="items">Product Items</Label>
                            <div className="overflow-y-auto rounded-md">
                                {selectedComponents.length === 0 ? (
                                    <div className="border-muted-foreground bg-muted-foreground/20 flex h-32 items-center justify-center rounded-md border p-4">
                                        <p className="text-muted-foreground text-center">No Materials</p>
                                    </div>
                                ) : (
                                    <div className="mt-6 max-h-96 space-y-2 overflow-y-auto rounded-md border md:mt-4">
                                        <Table className="w-full">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Material</TableHead>
                                                    <TableHead>Qty Per Unit</TableHead>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedComponents.map((component: Product, index) => {
                                                    const line = data.materials.find((item) => item.component_product_id === component.id);

                                                    return (
                                                        <TableRow key={component.id}>
                                                            <TableCell>({component.sku}) {component.name}</TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={line?.quantity_per_unit ?? 1}
                                                                    onChange={(e) => {
                                                                        const quantity = Number(e.target.value);
                                                                        setData('materials', data.materials.map((item) =>
                                                                            item.component_product_id === component.id
                                                                                ? { ...item, quantity_per_unit: quantity }
                                                                                : item,
                                                                        ));
                                                                    }}
                                                                    className="w-full"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Popover open={unitOpenIndex === index} onOpenChange={(open) => setUnitOpenIndex(open ? index : null)}>
                                                                    <PopoverTrigger>
                                                                        <Input type="text" value={line?.unit ?? ''} readOnly />
                                                                    </PopoverTrigger>
                                                                    <PopoverContent>
                                                                        <SelectCommand
                                                                            lists={units}
                                                                            getLabel={(unit) => unit.name}
                                                                            onSelect={(unit) => {
                                                                                setData('materials', data.materials.map((item) =>
                                                                                    item.component_product_id === component.id
                                                                                        ? { ...item, unit: unit.name }
                                                                                        : item,
                                                                                ));
                                                                                setUnitOpenIndex(null);
                                                                            }}
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button variant="destructive" size="icon" onClick={() => removeItem(component.id)}>
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                            <Popover open={itemsOpen} onOpenChange={setItemsOpen} defaultOpen={false}>
                                <div className="mt-6 flex w-full items-center justify-end md:mt-8">
                                    <PopoverTrigger asChild>
                                        <Button size={'sm'} className="">
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </PopoverTrigger>
                                </div>
                                <PopoverContent className="w-full p-0" align="end">
                                    <SelectCommand
                                        lists={filteredProducts}
                                        getKey={(product: Product) => product.id}
                                        renderItem={(product: Product) => <>({product.sku}) {product.name}</>}
                                        onSelect={(product: Product) => {
                                            addItems(product);
                                            setItemsOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <Button variant="default" type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                    <ConfirmDialog
                        title="Confirm Save"
                        description="Are you sure you want to save this BOM?"
                        open={confirmOpen}
                        onOpenChange={setConfirmOpen}
                        onConfirm={submitForm}
                        processing={processing}
                    />
                </form>
            </ContainerFormLayout>
        </AppLayout>
    )
}
