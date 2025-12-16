import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Show({ location }: { location: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Locations',
            href: '/location',
        },
        {
            title: location.warehouse.name,
            href: route('warehouse.show', location.warehouse.id),
        },
        {
            title: `${location.name}`,
            href: `/location/${location.id}`,
        },
    ];

    const deleteLocation = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('location.destroy', { id }));
            toast.success('Location deleted successfuly');
        }
    };
    console.log(location.stocks);

    const stockCount = location.stocks?.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${location?.name}`} />
            <ContainerLayout>
                <div className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="5 mb-2 text-3xl font-semibold">{`${location.name}`}</h2>
                        <Button variant="outline" asChild>
                            <Link href={route('location.edit', location.id)}>Edit Location</Link>
                        </Button>
                    </div>
                    <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
                    <div className="grid grid-cols-2 gap-2">
                        <Card>
                            <CardHeader className="grid grid-cols-2">
                                <div>
                                    <CardTitle>Warehouse</CardTitle>
                                </div>
                                <div className="col-start-2 row-span-2 self-start justify-self-end">
                                    <Button variant={'ghost'} asChild>
                                        <Link href={route('warehouse.show', location.warehouse?.id)}>
                                            View
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-foreground text-xl font-medium">{`${location.warehouse?.name}`}</h3>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="grid grid-cols-2">
                                <div>
                                    <CardTitle>Jumlah Product</CardTitle>
                                </div>
                                <div className="col-start-2 row-span-2 self-start justify-self-end">
                                    <Button variant={'ghost'} asChild>
                                        <Link href={route('stocks.index')}>
                                            View
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-foreground text-2xl font-medium">{`${stockCount}`}</h3>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>List Product</CardTitle>
                                <CardDescription>Daftar product di {`${location.name}`}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Batch Number</TableHead>
                                            <TableHead>Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {location.stocks?.map((stock: any) => (
                                            <TableRow key={stock.id}>
                                                <TableCell>{stock.product?.name}</TableCell>
                                                <TableCell>{stock.batch?.batch_number}</TableCell>
                                                <TableCell>{stock.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
