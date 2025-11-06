import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


export default function Show({ location }: { location: any; }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Locations',
            href: '/location',
        },
        {
            title: location.warehouse.name,
            href: route('warehouse.show', location.warehouse.id)
        },
        {
            title: `${location.name}`,
            href: `/location/${location.id}`,
        }
    ];

    const deleteLocation = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('location.destroy', { id }))
            toast.success('Location deleted successfuly')
        }
    }
    console.log(location.stocks);

    const stockCount = location.stocks?.length

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${location?.name}`} />
            <ContainerLayout>
                <div className="p-4">
                    <h2 className="text-3xl font-semibold mb-2 5">
                        {`${location.name}`}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Location ID: {`${location.id}`}
                    </p>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                    <div className="grid grid-cols-2 gap-2">
                        <Card>
                            <CardHeader className='grid grid-cols-2'>
                                <div>
                                    <CardTitle>Warehouse</CardTitle>
                                </div>
                                <div className='col-start-2 row-span-2 self-start justify-self-end'>
                                    <Button variant={'ghost'} asChild>
                                        <Link href={route('warehouse.show', location.warehouse?.id)}>
                                            View
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-xl font-medium text-foreground">
                                    {`${location.warehouse?.name}`}
                                </h3>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className='grid grid-cols-2'>
                                <div>
                                    <CardTitle>Product Count</CardTitle>
                                </div>
                                <div className='col-start-2 row-span-2 self-start justify-self-end'>
                                    <Button variant={'ghost'} asChild>
                                        <Link href={route('stocks.index')}>
                                            View
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-2xl font-medium text-foreground">
                                    {`${stockCount}`}
                                </h3>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='mt-8'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Products in {`${location.name}`}</CardTitle>
                                <CardDescription>View total products in this location</CardDescription>
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
