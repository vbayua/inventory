import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function Show({ warehouse }: { warehouse: { id: number; name?: string } }) {
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${warehouse?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{warehouse.name}</h2>

                        <p className="text-gray-600">Warehouse ID: {warehouse.id}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Link href={`/warehouse/${warehouse.id}/edit`}>
                                <Button variant="outline" className="cursor-pointer mt-4">
                                    Edit Warehouse
                                </Button>
                            </Link>
                            <div>
                                <h3 className='text-md font-semibold'>Danger Zone</h3>
                                <Button variant="destructive" className="cursor-pointer mt-4" size={"sm"} onClick={() => deleteWarehouse(warehouse.id)}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
