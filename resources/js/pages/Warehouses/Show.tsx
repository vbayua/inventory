import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Box, ExternalLink, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function Show({
    warehouse,
    stockCount,
}: {
    warehouse: {
        id: number;
        name?: string;
        locations?: any[];
        products?: any[];
    };
    stockCount: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'List Gudang',
            href: '/warehouse',
        },
        {
            title: `${warehouse.name}`,
            href: `/warehouse/${warehouse.id}`,
        },
    ];

    const deleteWarehouse = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('warehouse.destroy', { id }));
            toast.success('Warehouse deleted successfuly');
        }
    };

    const locationCount = warehouse.locations?.length;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${warehouse?.name}`} />
            <ContainerLayout>
                <Card className="p-2">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle>{warehouse.name}</CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('warehouse.edit', warehouse.id)}>Edit Gudang</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-primary mt-0.5 h-5 w-5" />
                                <div className="">
                                    <p className="text-muted-foreground text-sm">Lokasi</p>
                                    <p className="mt-2 text-lg font-semibold">{`${locationCount}`}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Box className="text-primary mt-0.5 h-5 w-5" />
                                <div className="">
                                    <p className="text-muted-foreground text-sm">Jumlah Item</p>
                                    <p className="mt-2 text-lg font-semibold">{`${stockCount}`}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="p-2">
                    <CardHeader>
                        <CardTitle>Daftar Lokasi</CardTitle>
                        <CardDescription>Lokasi yang terdaftar di {`${warehouse.name}`}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="h-14">
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {warehouse.locations ? (
                                    warehouse.locations.map((location) => (
                                        <TableRow key={location.id}>
                                            <TableCell>{location.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant={'ghost'} asChild>
                                                    <Link href={route('location.show', location.id)}>
                                                        View
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-26 text-center">
                                            No Results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </ContainerLayout>
        </AppLayout>
    );
}
