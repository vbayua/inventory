import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/receive-orders/columns';
import { DataTable } from '@/components/receive-orders/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

import { SharedData, type BreadcrumbItem } from '@/types';
import { ReceiveOrder } from '@/types/resources';
import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

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
            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">Receive Orders</h1>
                        <p className="text-muted-foreground mb-6 text-sm">List of receive orders.</p>
                    </div>
                    {permissions.create && (
                        <Button variant={'default'} size={'lg'} asChild>
                            <Link href={`/receive-orders/create`} className="text-primary text-lg font-medium">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Receive Order
                            </Link>
                        </Button>
                    )}
                </div>
                <DataTable columns={columns} data={receiveOrders} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    );
}
