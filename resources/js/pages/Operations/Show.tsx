import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowDownUp, ArrowUp, Edit2, Hash, LogIn, MapPin, Package } from 'lucide-react';

import { toast } from 'sonner';

type Operation = {
    id: number;
    product?: {
        id: number;
        name?: string;
    };
    batch?: {
        id: number;
        batch_number?: string;
    };
    location?: {
        id: number;
        name?: string;
    };
    quantity?: number;
    unit?: string;
    remarks?: string;
    operation_type?: string;
    operation_date?: Date | string;
    created_at?: string;
    updated_at?: string;
};

export default function Show({ operation }: { operation: Operation }) {
    const operationConfig = {
        inbound: {
            id: 'inbound',
            label: 'IN',
            color: 'bg-green-200 text-green-800',
            variant: 'default' as const,
            icon: ArrowDown,
            prefix: '+',
        },
        outbound: {
            id: 'outbound',
            label: 'OUT',
            color: 'bg-red-200 text-red-800',
            variant: 'secondary' as const,
            icon: ArrowUp,
            prefix: '-',
        },
        initial: {
            id: 'initial',
            label: 'IN',
            color: 'bg-purple-200 text-purple-800',
            variant: 'secondary' as const,
            icon: ArrowDown,
            prefix: '+',
        },
        adjustment: {
            id: 'adjustment',
            label: 'ADJ',
            color: 'bg-yellow-100 text-yellow-800',
            variant: 'outline' as const,
            icon: Edit2,
        },
        transfer: {
            id: 'transfer',
            label: 'Transfer',
            color: 'bg-indigo-100 text-indigo-800',
            variant: 'default' as const,
            icon: LogIn,
        },
        transfer_in: {
            id: 'transfer_in',
            label: 'TRANSFER IN',
            color: 'bg-teal-100 text-teal-800',
            variant: 'default' as const,
            icon: ArrowDownUp,
            prefix: '+',
        },
        transfer_out: {
            id: 'transfer_out',
            label: 'TRANSFER OUT',
            color: 'bg-indigo-100 text-indigo-800',
            variant: 'default' as const,
            icon: ArrowDownUp,
            prefix: '-',
        },
        return: {
            id: 'return',
            label: 'RETURN',
            color: 'bg-cyan-100 text-cyan-800',
            variant: 'default' as const,
            icon: ArrowDown,
            prefix: '+',
        },
    };
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'List Operasi',
            href: '/operations',
        },
        {
            title: `${operation?.batch?.batch_number} - ${operation?.product?.name}`,
            href: `/operations/${operation.id}`,
        },
    ];

    const deleteOperation = (id: number) => {
        if (confirm('Are you sure you want to delete this operation?')) {
            // Call the delete API endpoint
            router.delete(`/operations/${id}`, {
                onSuccess: () => {
                    toast.success('Operation deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete operation');
                },
            });
        }
    };

    const operationType = operation?.operation_type || 'unknown';
    const operationTypeConfig = operationConfig[operationType as keyof typeof operationConfig];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${operation?.product?.name}`} />
            <ContainerLayout>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle>Operasi Stok</CardTitle>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${operationTypeConfig.color}`}>
                                {operationTypeConfig.icon && <operationTypeConfig.icon className="mr-1 h-4 w-4" />}
                                {operationTypeConfig.label}
                            </span>
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
                                    <p className="font-medium">{operation?.batch?.batch_number}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Package className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Nama Product</CardDescription>
                                    <Button variant="link" className="p-0 font-medium" asChild>
                                        <Link href={route('products.show', { id: operation?.product?.id })}>{operation?.product?.name}</Link>
                                    </Button>
                                </div>
                            </div>
                            <Separator className="md:col-span-2" />
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <MapPin className="text-primary h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <CardDescription className="text-muted-foreground text-sm">Lokasi</CardDescription>
                                    <p className="font-medium">{operation?.location?.name}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-border border-t pt-4">
                        <div className="w-full">
                            <CardDescription>Remarks</CardDescription>
                            <p className="font-medium">{operation?.remarks || '-'}</p>
                        </div>
                    </CardFooter>
                </Card>
            </ContainerLayout>
        </AppLayout>
    );
}
