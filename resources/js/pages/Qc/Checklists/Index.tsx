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
import { ClipboardList, PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quality Control',
        href: '/qc/checklists',
    },
    {
        title: 'Checklists',
        href: '/qc/checklists',
    },
];

export default function Index({ checklists }: { checklists: QcChecklist[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QC Checklists" />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">QC Checklists</h1>
                            <p className="text-muted-foreground mt-1 text-sm">Manage quality control checklists.</p>
                        </div>
                        <Button asChild>
                            <Link href={route('qc.checklists.create')}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Checklist
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Checklists
                            </CardTitle>
                            <CardDescription>All QC checklists defined in the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Product Type</TableHead>
                                        <TableHead className="text-center">Items</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {checklists.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                                                No checklists found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        checklists.map((checklist, index) => (
                                            <TableRow
                                                key={checklist.id}
                                                className="cursor-pointer"
                                                onClick={() => router.get(route('qc.checklists.show', checklist.id))}
                                            >
                                                <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{checklist.name}</TableCell>
                                                <TableCell>{checklist.product_type?.name ?? <span className="text-muted-foreground">All Products</span>}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">{checklist.items_count ?? checklist.items?.length ?? 0}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {checklist.is_active ? (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{checklist.user?.name ?? '-'}</TableCell>
                                                <TableCell>
                                                    {checklist.created_at
                                                        ? format(new Date(checklist.created_at), 'LLL dd, y')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={route('qc.checklists.show', checklist.id)}>View</Link>
                                                    </Button>
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
