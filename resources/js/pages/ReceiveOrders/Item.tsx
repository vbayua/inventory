import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { ReceiveOrder, ReceiveOrderItem } from '@/types/resources';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Item({ receive_order, item }: { receive_order: ReceiveOrder; item: ReceiveOrderItem }) {
    console.log(receive_order, item);
    return (
        <AppLayout>
            <Head title="RO - Item" />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button variant={'link'} asChild>
                                <Link href={route('receive-orders.show', { receive_order: receive_order.id })}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Receive Order
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
