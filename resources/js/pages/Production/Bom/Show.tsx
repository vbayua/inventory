import ContainerLayout from "@/components/container-layout";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArchiveX, ArchiveXIcon, CheckIcon, DownloadIcon, MoreHorizontalIcon, PencilIcon, SaveIcon, TrashIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BreadcrumbItem } from "@/types";
import { BomStatusBadge } from "@/components/boms/bom-status-badge";
import { Bom } from "@/types/resources";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { toast } from "sonner";
import ConfirmDialog from "@/components/confirm-dialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "BoM",
        href: "/bom",
    },
]
export default function Show({ bom }: { bom: Bom }) {
    breadcrumbs[1] = {
        title: `BoM ${bom.product?.name} #${bom.version}`,
        href: `/bom/${bom.id}`,
    }

    const activateBom = () => {
        new Promise((resolve, reject) => {
            router.put(route('bom.activate', { bom: bom.id }), { status: 'active' }, {
                onSuccess: () => {
                    toast.success('BoM is Active');
                },
                onError: (error) => {
                    console.error(error);
                    toast.error(error.status);
                    reject();
                },
                onFinish: resolve
            });
        });
    }


    const retireBom = () => {
        new Promise((resolve, reject) => {
            router.put(route('bom.retire', { bom: bom.id }), { status: 'retired' }, {
                onSuccess: () => {
                    toast.success('BoM is Retired');
                },
                onError: (error) => {
                    console.error(error);
                    toast.error(error.status);
                    reject();
                },
                onFinish: resolve
            });
        });
    }

    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`BoM ${bom.product?.name} #${bom.version}`} />
            <ContainerLayout>
                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <CardTitle className="mb-6 lg:mb-0">{`${bom.product?.name} - BoM #${bom.version}`}</CardTitle>
                            <div className="mt-6 md:mt-0">
                                <ButtonGroup>
                                    <ButtonGroup>
                                        <Button variant="outline"><PencilIcon /> Edit</Button>
                                    </ButtonGroup>
                                    <ButtonGroup>
                                        <Button variant="outline" className="hover:bg-background!" asChild >
                                            <span>
                                                Status
                                                <BomStatusBadge status={bom.status} />
                                            </span>
                                        </Button>
                                        {
                                            bom.status === 'draft' &&
                                            <ConfirmDialog
                                                trigger={<Button variant="outline"><CheckIcon /></Button>}
                                                title="Set as Active"
                                                description="Are you sure you want to set this BoM as active?"
                                                onConfirm={() => activateBom()}
                                            />
                                        }
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline"><MoreHorizontalIcon /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
                                                    <ArchiveXIcon />Archive
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <ConfirmDialog
                                            open={confirmOpen}
                                            onOpenChange={setConfirmOpen}
                                            title="Archive"
                                            description="Are you sure you want to archive this BoM?"
                                            onConfirm={() => retireBom()}
                                        />
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
                                    <p className="text-xl">({bom.product?.sku}) {bom.product?.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Version</h3>
                                    <p className="text-xl">{bom.version}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Status</h3>
                                    <p className="text-xl"></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Material Line
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-left">Unit</TableHead>
                                        <TableHead className="text-center">Scrap %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bom.lines?.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>{line.component?.name}</TableCell>
                                            <TableCell className="text-right">{Number(line.quantity_per_unit).toFixed()}</TableCell>
                                            <TableCell className="text-left">{line.unit}</TableCell>
                                            <TableCell className="text-center">{line.scrap_percentage}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
