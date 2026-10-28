import ConfirmDialog from "@/components/confirm-dialog";
import ContainerLayout from "@/components/container-layout";
import InputError from "@/components/input-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { ProductionMaterial, ProductionOrder } from "@/types/resources";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, CheckIcon, CircleSlashedIcon, CogIcon, DownloadIcon, EditIcon, FileInput, FileInputIcon, ListTreeIcon, MoreHorizontalIcon, PlayIcon } from "lucide-react";
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

type status = 'released' | 'in_progress' | 'completed' | 'cancelled';


export default function Show({production} : {production: ProductionOrder}) {
    console.log(production);
    const productionMaterial = production.materials ?? [];
    const canIssueStock = production.status === 'released' || production.status === 'in_progress';
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAttributes, setConfirmAttributes] = useState({
        title: '',
        message: '',
    });
    const { data, put, errors, processing, disabled, setData } = useForm<{status: status | ''}>({
        status: '',
    })

    const releaseOrder = (e: React.MouseEvent) => {
        e.preventDefault();
        setData('status', 'released');
        setConfirmAttributes({
            title: 'Release Order',
            message: 'Are you sure you want to release this order?',
        });
        setConfirmOpen(true);
    };

    const startOrder = (e: React.MouseEvent) => {
        e.preventDefault();
        setData('status', 'in_progress');
        setConfirmAttributes({
            title: 'Start Order',
            message: 'Are you sure you want to start this order?',
        });
        setConfirmOpen(true);
    };

    const completeOrder = (e:React.MouseEvent) => {
       e.preventDefault();
       setData('status', 'completed');
       setConfirmAttributes({
           title: 'Complete Order',
           message: 'Are you sure you want to complete this order?',
       });
       setConfirmOpen(true);
    };

    const [cancelOpen, setCancelOpen] = useState(false);
    const cancelForm = useForm<{ status: 'cancelled'; cancel_note: string }>({
        status: 'cancelled',
        cancel_note: '',
    });

    const cancelOrder = (e: React.MouseEvent) => {
        e.preventDefault();
        cancelForm.reset();
        cancelForm.clearErrors();
        setCancelOpen(true);
    };

    const handleConfirmCancel = () => {
        return new Promise<void>((resolve, reject) => {
            cancelForm.put(route('production.status.update', { production: production.id }), {
                onSuccess: () => {
                    toast.success('Production order cancelled successfully');
                    resolve();
                },
                onError: (error) => {
                    toast.error('Failed to cancel production order');
                    reject(error);
                },
            });
        });
    };


    const handleConfirmOrder = () => {
        return new Promise<void>((resolve, reject) => {
            put(route('production.status.update', { production: production.id }),
                {
                    onSuccess: () => {
                        toast.success('Production order status updated successfully');
                        resolve();
                    },
                    onError: (error) => {
                        toast.error('Failed to update production order status');
                        console.error(error);
                        reject(error);
                    },
                }
            )
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Production Order Detail" />
            <ContainerLayout>
                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="space-y-4">
                                <CardTitle>Order Produksi - {production.order_number}</CardTitle>
                                <CardDescription className="text-lg">({production.product?.sku}) {production.product?.name} - {production.bom_id}</CardDescription>
                            </div>
                            <div className="mt-6 md:mt-0">
                                <ButtonGroup>
                                    <ButtonGroup>
                                        {badge(production.status)}
                                    </ButtonGroup>
                                    <ButtonGroup>
                                        <Button variant="outline" asChild></Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline"><MoreHorizontalIcon /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {production.status === 'draft' &&
                                                    <DropdownMenuGroup>
                                                    <DropdownMenuItem variant="default" onClick={(e) => releaseOrder(e)}>
                                                        <FileInputIcon /> Release Order
                                                    </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                }
                                                {production.status === 'released' &&
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem variant="default" onClick={(e) => startOrder(e)}>
                                                            <PlayIcon/>Start Production
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem variant="destructive" onClick={(e) => cancelOrder(e)}>
                                                            <CircleSlashedIcon />Cancel Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                }
                                                {production.status === 'in_progress' &&
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem variant="default" onClick={(e) => completeOrder(e)}>
                                                            <CheckIcon />Mark as Complete
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem variant="destructive" onClick={(e) => cancelOrder(e)}>
                                                            <CircleSlashedIcon />Cancel Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                }
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild><Link href={route('production.issue', { production: production.id })} prefetch={false}><ListTreeIcon/>Issue Log</Link></DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <ConfirmDialog
                                            open={confirmOpen}
                                            onOpenChange={setConfirmOpen}
                                            title={confirmAttributes.title}
                                            description={confirmAttributes.message}
                                            processing={processing}
                                            onConfirm={handleConfirmOrder}
                                        />
                                        <ConfirmDialog
                                            open={cancelOpen}
                                            onOpenChange={setCancelOpen}
                                            title="Cancel Order"
                                            description="Are you sure you want to cancel this order? This cannot be undone."
                                            confirmLabel="Cancel Order"
                                            cancelLabel="Back"
                                            confirmVariant="destructive"
                                            processing={cancelForm.processing}
                                            onConfirm={handleConfirmCancel}
                                        >
                                            <div className="grid gap-2">
                                                <Label htmlFor="cancel_note">
                                                    Notes <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    id="cancel_note"
                                                    value={cancelForm.data.cancel_note}
                                                    onChange={(e) => cancelForm.setData('cancel_note', e.target.value)}
                                                    placeholder="Reason for cancelling this order"
                                                    rows={4}
                                                />
                                                <InputError message={cancelForm.errors.cancel_note} />
                                            </div>
                                        </ConfirmDialog>
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
