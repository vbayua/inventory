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
import { ProductionMaterial, ProductionOrder } from "@/types/resources";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, CheckIcon, DownloadIcon, EditIcon, MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

const badgeVariant = {
    draft: {
        label: 'Draft',
        variant: 'outline',
        style: 'bg-yellow-800 text-yellow-100 border border-yellow-100'
    },
    released: {
        label: 'Released',
        variant: 'default',
        style: 'bg-blue-800/20 text-blue-100 border border-blue-100'
    },
    in_progress: {
        label: 'In Progress',
        variant: 'default',
        style: 'bg-blue-800 text-blue-100 border border-blue-100'
    },
    completed: {
        label: 'Completed',
        variant: 'default',
        style: 'bg-green-800 text-green-100 border border-green-100'
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'outline',
        style: 'bg-red-800 text-red-100 border border-red-100'
    },
} as const;

const badge = (status: keyof typeof badgeVariant) => {
    return <Badge variant={badgeVariant[status].variant} className={`capitalize ${badgeVariant[status].style}`}>
        <span className="capitalize">{badgeVariant[status].label}</span>
    </Badge>
}

const productionOrderAction = {
    draft: {
        label: 'Release Order',
        variant: 'default',
        style: 'bg-blue-800 text-blue-100',
    },
    released: {
        label: 'Cancel Order',
        variant: 'default',
        style: 'bg-red-800 text-red-100 border border-red-100',
    },
    in_progress: {
        label: 'Cancel Order',
        variant: 'default',
        style: 'bg-red-800 text-red-100 border border-red-100',
    },
    completed: {
        label: 'Completed',
        variant: 'default',
        style: 'bg-green-800 text-green-100 border border-green-100',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'outline',
        style: 'bg-red-800 text-red-100 border border-red-100',
    },
} as const

const handleProductionOrderStatus = (production: ProductionOrder) => {
    router.put(route('production.status.update', { production: production.id }), { status: production.status },
        {
            onSuccess: () => {
                toast.success('Production order status updated successfully');
            },
            onError: () => {
                toast.error('Failed to update production order status');
            },
        }
    )
};

export default function Show({production} : {production: ProductionOrder}) {
    console.log(production);
    const productionMaterial = production.materials ?? [];
    const canIssueStock = production.status === 'released' || production.status === 'in_progress';
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
                                        <Button
                                            variant={productionOrderAction[production.status]?.variant}
                                            type="button"
                                            onClick={() => handleProductionOrderStatus(production)}
                                            className={productionOrderAction[production.status]?.style}
                                        >
                                            {productionOrderAction[production.status]?.label}
                                        </Button>
                                    </ButtonGroup>
                                    <ButtonGroup>
                                        <Button variant="outline" asChild><Link href={route('production.issue', { production: production.id })} prefetch={false}>Issue Log</Link></Button>
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
                                    <p className="text-xl">{production.product?.name} ({production.product?.sku})</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Order Number</h3>
                                    <p className="text-xl">{production.order_number}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Target Quantity</h3>
                                    <p className="text-xl">{Number(production.target_quantity).toLocaleString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">BoM ID</h3>
                                    <p className="text-xl"><Link href={route('bom.show', { bom: production.bom_id })} prefetch={false}>{production.bom_id}</Link></p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">BoM Version</h3>
                                    <p className="text-xl">{production.bom?.version}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Status</h3>
                                    <p className="text-xl">{badge(production.status)}</p>
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
                                        <TableHead className="font-semibold"></TableHead>
                                        <TableHead className="font-semibold">Qty Issued</TableHead>
                                        <TableHead className="font-semibold">Unit</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productionMaterial.map((material) => (
                                        <TableRow key={material.id}>
                                            <TableCell className="md:text-xl">{material.product?.name}</TableCell>
                                            <TableCell className="md:text-xl">{Number(material.quantity_per_unit).toLocaleString()}</TableCell>
                                            <TableCell className="md:text-xl">{Number(material.quantity_required).toLocaleString()}</TableCell>
                                            <TableCell className="md:text-xl">
                                                /
                                            </TableCell>
                                            <TableCell className="md:text-xl">{Number(material.quantity_issued).toLocaleString()}</TableCell>
                                            <TableCell className="md:text-xl">{material.product?.unit as string}</TableCell>
                                            <TableCell>
                                                <ButtonGroup>
                                                    {canIssueStock ? (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={route('production.issue.create', { production: material?.production_order_id, material: material.id })} prefetch={false}>
                                                                Issue Stock
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" size="sm" disabled title="Stock can only be issued to a released or in-progress production order">
                                                            Issue Stock
                                                        </Button>
                                                    )}
                                                </ButtonGroup>
                                            </TableCell>
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
