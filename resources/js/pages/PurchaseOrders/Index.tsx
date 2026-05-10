import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/purchase-orders/columns';
import { DataTable } from '@/components/purchase-orders/data-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

import { SharedData, type BreadcrumbItem } from '@/types';
import { PurchaseOrder } from '@/types/resources';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
    },
];

export default function Index({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
    const { permissions } = usePage<SharedData>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />
            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Purchase Orders</h1>
                        <p className="text-muted-foreground mb-6 text-sm">List of purchase orders.</p>
                    </div>
                </div>
                <DataTable columns={columns} data={purchaseOrders} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
