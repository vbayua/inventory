import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from '@/components/ui/table';
import { Box, ExternalLink, MapPin } from 'lucide-react';

export default function Show({ warehouse, stockCount }: {
    warehouse:
    {
        id: number;
        name?: string;
        locations?: any[];
        products?: any[];
    },
    stockCount: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Warehouses',
            href: '/warehouse',
        },
        {
            title: `${warehouse.name}`,
            href: `/warehouse/${warehouse.id}`,
        }
    ];

    const deleteWarehouse = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('warehouse.destroy', { id }))
            toast.success('Warehouse deleted successfuly')
        }
    }

    const locationCount = warehouse.locations?.length;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${warehouse?.name}`} />
            <ContainerLayout>
                <Card className='p-2'>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle>
                                {warehouse.name}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <MapPin className='h-5 w-5 text-primary mt-0.5' />
                                <div className="">
                                    <p className="text-sm text-muted-foreground">Locations</p>
                                    <p className="text-lg mt-2 font-semibold">
                                        {`${locationCount}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Box className='h-5 w-5 text-primary mt-0.5' />
                                <div className="">
                                    <p className="text-sm text-muted-foreground">Stock Count</p>
                                    <p className="text-lg mt-2 font-semibold">
                                        {`${stockCount}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className='p-2'>
                    <CardHeader>
                        <CardTitle>Locations</CardTitle>
                        <CardDescription>View and manage locations inside of {`${warehouse.name}`}</CardDescription>
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
                                {warehouse.locations ? warehouse.locations.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell>{location.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant={'ghost'}
                                                asChild>
                                                <Link href={route('location.show', location.id)}>
                                                    View
                                                    <ExternalLink className='h-3 w-3' />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
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
