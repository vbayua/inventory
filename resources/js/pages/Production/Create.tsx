import ContainerFormLayout from "@/components/container-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Link, useForm } from "@inertiajs/react";

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

export default function Create() {

    const {data, setData, post, reset, errors, processing} = useForm({
        order_number: '',
        product_id: undefined,
        bom_id: undefined,
        target_quantity: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('production.store'), {
            onSuccess: () => reset(),
            onError: (errors) => console.log(errors),
        });
    };

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
                <form className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Order Number</Label>
                        <Input disabled/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Product</Label>
                        <Input disabled/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Bill Of Material</Label>
                        <Input disabled/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Target Quantity</Label>
                        <Input disabled/>
                    </div>
                    <Button variant="default" type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </form>
                <div className="my-6 border border-blue-100/20 p-4 rounded-lg">
                    <h2 className="mb-4">Bill Of Material - Version 1</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-center">Unit</TableHead>
                                <TableHead className="text-center">Scrap %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Material 1</TableCell>
                                <TableCell className="text-center">200</TableCell>
                                <TableCell className="text-center">pcs</TableCell>
                                <TableCell className="text-center">0</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </ContainerFormLayout>
        </AppLayout>
    )
}
