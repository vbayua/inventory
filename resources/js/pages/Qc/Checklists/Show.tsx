import ContainerLayout from '@/components/container-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { QcChecklist } from '@/types/resources';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, ClipboardList, PenIcon, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quality Control', href: '/qc/checklists' },
    { title: 'Checklists', href: '/qc/checklists' },
    { title: 'Details', href: '' },
];

export default function Show({ checklist }: { checklist: QcChecklist }) {
    breadcrumbs[2].href = `/qc/checklists/${checklist.id}`;

    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = () => {
        router.delete(route('qc.checklists.destroy', checklist.id), {
            onSuccess: () => {
                toast.success('Checklist deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete checklist.');
                setConfirmDelete(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`QC Checklist — ${checklist.name}`} />
            <ContainerLayout>
                <div className="space-y-6">
                    {/* Back + Actions row */}
                    <div className="flex items-center justify-between">
                        <Button variant="link" asChild className="px-0">
                            <Link href={route('qc.checklists.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Checklists
                            </Link>
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('qc.checklists.edit', checklist.id)}>
                                    <PenIcon className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>

                            {confirmDelete ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-red-600">Are you sure?</span>
                                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                                        Yes, Delete
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setConfirmDelete(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Checklist Info */}
                    <Card>
                        <CardHeader className="flex flex-col justify-between md:flex-row md:items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <ClipboardList className="h-5 w-5" />
                                    {checklist.name}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {checklist.description ?? 'No description provided.'}
                                </CardDescription>
                            </div>
                            <div className="mt-3 md:mt-0">
                                {checklist.is_active ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Product Type</p>
                                    <p className="mt-1 text-sm">
                                        {checklist.product_type?.name ?? (
                                            <span className="text-muted-foreground italic">All Products</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Total Items</p>
                                    <p className="mt-1 text-sm">
                                        {checklist.items?.length ?? checklist.items_count ?? 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Created By</p>
                                    <p className="mt-1 text-sm">{checklist.user?.name ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Created At</p>
                                    <p className="mt-1 text-sm">
                                        {checklist.created_at
                                            ? format(new Date(checklist.created_at), 'LLL dd, yyyy')
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Last Updated</p>
                                    <p className="mt-1 text-sm">
                                        {checklist.updated_at
                                            ? format(new Date(checklist.updated_at), 'LLL dd, yyyy')
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checklist Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Checklist Items</CardTitle>
                            <CardDescription>
                                {checklist.items?.length
                                    ? `${checklist.items.length} item(s) in this checklist.`
                                    : 'No items defined for this checklist.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-center">Required</TableHead>
                                        <TableHead className="w-20 text-center">Order</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!checklist.items || checklist.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-muted-foreground py-10 text-center"
                                            >
                                                No checklist items found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        checklist.items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {item.description ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.is_required ? (
                                                        <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="text-muted-foreground mx-auto h-4 w-4" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {item.sort_order}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
