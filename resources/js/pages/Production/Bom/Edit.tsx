
import ContainerFormLayout from "@/components/container-form-layout";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Item, ItemContent } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SelectCommand from "@/components/ui/select-command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Bom, Product, Unit } from "@/types/resources";
import { Link, useForm } from "@inertiajs/react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "BoM Index",
        href: "/bom",
    },
];
export default function Edit({finishedGood, materials, units}: {finishedGood: Bom; materials: Product[]; units: Unit[]}) {
    breadcrumbs[1] = { title: finishedGood.product?.name ?? 'BoM', href: `/boms/${finishedGood.id}` };
    breadcrumbs[2] = { title: "Edit", href: `/boms/${finishedGood.id}/edit` };

    const {data, setData, post, reset, errors, processing} = useForm({
        materials: finishedGood.lines?.map((m) => ({ product_id: m.component_product_id, quantity_per_unit: m.quantity_per_unit, unit: m.unit })) ?? []
    });

    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [itemsOpen, setItemsOpen] = useState(false);
    const [unitOpenIndex, setUnitOpenIndex] = useState<number|null>(null);
    const filteredProducts = materials.filter((product) => !selectedProducts.find((p) => p.id === product.id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(route('bom.store'), {
            onSuccess: () => reset(),
            onError: (errors) => console.log(errors),
        });
    };


    const addItems = (product: Product) => {
        if (!selectedProducts.find((p) => p.id === product.id)) {
            setSelectedProducts([...selectedProducts, product]);
            const productUnit = units.find((u) => u.name === (typeof product.unit === 'string' ? product.unit : product.unit.name));
            setData('materials', data.materials ? [...data.materials, { product_id: product.id, quantity_per_unit: 1, unit: productUnit!.name }] : []);
        }
    };

    const removeItem = (product: Product) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
        setData(
            'materials',
            data.materials.filter((item) => item.product_id !== product.id),
        );
    };

    const clearItems = () => {
        setSelectedProducts([]);
        setData('materials', []);
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="text-2xl mb-4 font-bold">Create Bill Of Material</h1>
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
                        <Label>Materials</Label>
                        <div className="space-y-2">
                            <Label htmlFor="items">Product Items</Label>
                            <div className="overflow-y-auto rounded-md">
                                {selectedProducts.length === 0 ? (
                                    <div className="border-muted-foreground bg-muted-foreground/20 flex h-32 items-center justify-center rounded-md border p-4" onClick={(e) => {
                                        e.preventDefault();
                                        // setFocus to supplier
                                    }}>
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
                                                {selectedProducts.map((product: Product, index) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell>({product.sku}) {product.name}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                defaultValue={data.materials.find((item) => item.product_id === product.id)?.quantity_per_unit || 1}
                                                                onChange={(e) => {
                                                                    const quantity = Number(e.target.value);
                                                                    setData((prevData) => {
                                                                        const newData = prevData.materials.map((item) =>
                                                                            item.product_id === product.id ? { ...item, quantity_per_unit: quantity } : item
                                                                        )
                                                                        return { ...prevData, materials: newData };
                                                                    })
                                                                }}
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Popover open={unitOpenIndex === index} onOpenChange={(open) => setUnitOpenIndex(open ? index : null)}>
                                                                <PopoverTrigger>
                                                                    <Input type="text" value={data.materials.find(i => i.product_id === product.id)?.unit ? units.find(u => u.name === data.materials.find(i => i.product_id === product.id)?.unit)?.name : ''} readOnly/>
                                                                </PopoverTrigger>
                                                                <PopoverContent>
                                                                    <SelectCommand
                                                                        lists={units}
                                                                        getLabel={(unit) => unit.name}
                                                                        onSelect={(unit) => {
                                                                            setData((prevData) => {
                                                                                const newData = prevData.materials.map((item) =>
                                                                                    item.product_id === product.id ? { ...item, unit: unit.name } : item
                                                                                )
                                                                                return { ...prevData, materials: newData };
                                                                            })
                                                                            setUnitOpenIndex(null);
                                                                        }}
                                                                    />

                                                                </PopoverContent>
                                                            </Popover>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="destructive" size="icon" onClick={() => removeItem(product)}>
                                                                <TrashIcon className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
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
                                    <Command
                                        filter={(value, search) => {
                                            return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                                        }}
                                    >
                                            <CommandInput placeholder="Search products..." />
                                            <CommandEmpty>No products found.</CommandEmpty>
                                            <CommandList>
                                                {filteredProducts.map((product: Product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={`${product.name} (${product.sku})`}
                                                        onSelect={() => {
                                                            addItems(product);
                                                            setItemsOpen(false);
                                                        }}
                                                    >
                                                        {product.name} ({product.sku})
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                        </div>
                    </div>
                    <Button variant="default" type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    )
}
