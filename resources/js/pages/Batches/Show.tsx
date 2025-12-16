import ContainerLayout from '@/components/container-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, CalendarClock, CalendarX, Hash, Package, Truck } from 'lucide-react';

export default function Show({ batch }: { batch: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'List Batch',
            href: route('batch.index'),
        },
        {
            title: String(batch.batch_number),
            href: route('batch.show', batch.id),
        },
    ];

    const createdDate = new Date(batch.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const updatedDate = new Date(batch.updated_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const manufactureDate = batch.manufacture_date
        ? new Date(batch.manufacture_date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '-';

    const expiryDate = batch.expiry_date
        ? new Date(batch.expiry_date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '-';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch" />

            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <Link className={buttonVariants({ variant: 'link' })} href={route('batch.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke List Batch
                    </Link>

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Actions
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    <Link href={route('batch.edit', { id: batch.id })} className={'w-full'}>
                                        Edit Batch
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle>Detail Batch</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Hash className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">No. Batch</CardDescription>
                                    <p className="font-medium">{batch.batch_number}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Package className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Nama Product</CardDescription>
                                    <Button variant="link" className="p-0 font-medium" asChild>
                                        <Link href={route('products.show', { id: batch.product_id })}>{batch.product?.name}</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Truck className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Supplier</CardDescription>
                                    <p className="font-medium">{batch.supplier?.partner?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <CalendarCheck className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Tanggal Manufacture</CardDescription>
                                    <p className="font-medium">{manufactureDate}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <CalendarX className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Expiry Date</CardDescription>
                                    <p className="font-medium">{expiryDate}</p>
                                </div>
                            </div>
                            <Separator className="md:col-span-2" />
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <CalendarClock className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Created Date</CardDescription>
                                    <p className="font-medium">{createdDate}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <CalendarClock className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Updated Date</CardDescription>
                                    <p className="font-medium">{updatedDate}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </ContainerLayout>
        </AppLayout>
    );
}
