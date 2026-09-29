import ContainerLayout from "@/components/container-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { ProductionMaterial } from "@/types/resources";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, CheckIcon, DownloadIcon, EditIcon, MoreHorizontalIcon } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Production Plan",
        href: route('production.index'),
    },
    {
        title: "Production Plan Detail",
        href: route('production.show', {id: 1}),
    }
]

const productionMaterial: ProductionMaterial[] = [
    {
        id: 1,
        production_plan_id: 1,
        product_id: 10,
        quantity_required: 100,
        quantity_consumed: 10,
        scrap_percentage: 0.2,
        created_at: "2023-01-01",
        updated_at: "2023-01-01",
        production: {
            id: 1,
            order_number: "Production Plan 1",
            product_id: 1,
            target_quantity: 1000,
            bom_id: 1,
            status: 'draft',
            ordered_at: "2024-01-01",
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            product: {
                id: 1,
                sku: "FG01",
                name: "Product 1",
                unit: "pcs",
            }
        },
        product: {
            id: 10,
            sku: "PP010",
            name: "Material",
            unit: "pcs",
        },
    },

    {
        id: 2,
        production_plan_id: 1,
        product_id: 12,
        quantity_required: 100,
        quantity_consumed: 80,
        scrap_percentage: 0.2,
        created_at: "2023-01-01",
        updated_at: "2023-01-01",
        production: {
            id: 1,
            order_number: "Production Plan 1",
            product_id: 1,
            target_quantity: 1000,
            bom_id: 1,
            status: 'draft',
            ordered_at: "2024-01-01",
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            product: {
                id: 1,
                sku: "FG01",
                name: "Product 1",
                unit: "pcs",
            }
        },
        product: {
            id: 12,
            sku: "PP012",
            name: "Material 2",
            unit: "pcs",
        },
    }
]
export default function Show() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Production Order Detail" />
            <ContainerLayout>
                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <CardTitle>Production Order Detail - {`#123450`}</CardTitle>
                            <div className="mt-6 md:mt-0">
                                <ButtonGroup>
                                    <ButtonGroup>
                                        <Button variant="outline">Action</Button>
                                        <Button variant="outline">Action</Button>
                                    </ButtonGroup>
                                    <ButtonGroup>
                                        <Button variant="outline"><DownloadIcon className="mr-2 w-2.5" />Export</Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline"><MoreHorizontalIcon /></Button>
                                            </DropdownMenuTrigger>
                                        </DropdownMenu>
                                    </ButtonGroup>
                                </ButtonGroup>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Product</h3>
                                    <p className="text-xl">Product Name (SKU)</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Order Number</h3>
                                    <p className="text-xl">ORDER01239103</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Target Quantity</h3>
                                    <p className="text-xl">123</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Batch Number</h3>
                                    <p className="text-xl">123</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">BoM ID</h3>
                                    <p className="text-xl"><Link href="#" prefetch={false}>#</Link></p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Status</h3>
                                    <p className="text-xl">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bill of Materials</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Material Name</TableHead>
                                        <TableHead className="font-semibold">Qty Per Unit</TableHead>
                                        <TableHead className="font-semibold">Total Qty</TableHead>
                                        <TableHead className="font-semibold">Unit</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productionMaterial.map((material) => (
                                        <TableRow key={material.id}>
                                            <TableCell className="md:text-xl">{material.product?.name}</TableCell>
                                            <TableCell className="md:text-xl">{material.quantity_required} x target_quantity</TableCell>
                                            <TableCell className="md:text-xl">total</TableCell>
                                            <TableCell className="md:text-xl">{material.product?.unit as string}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
