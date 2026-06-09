import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/receive-orders/columns';
import { DataTable } from '@/components/receive-orders/data-table';
import AppLayout from '@/layouts/app-layout';

import { SharedData, type BreadcrumbItem } from '@/types';
import { ReceiveOrder } from '@/types/resources';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Receive Orders',
        href: '/receive-orders',
    },
];

export default function Index({ receiveOrders }: { receiveOrders: ReceiveOrder[] }) {
    const { permissions } = usePage<SharedData>().props;
    console.log(receiveOrders);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Receive Orders" />
            <ContainerLayout className="p-0">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Receive Orders</h1>
                        <p className="text-muted-foreground mb-6 text-sm">List of receive orders.</p>
                    </div>
                </div>
                <div>
                    <DataTable columns={columns} data={receiveOrders} clientSide={true} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
