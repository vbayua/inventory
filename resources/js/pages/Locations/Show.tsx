import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function Show({ location }: { location: any }) {
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${location?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{location.name}</h2>

                        <p className="text-gray-600">Location ID: {location.id}</p>
                        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8'>
                                <h3 className='font-semibold'>Warehouse</h3>
                                <p className="text-gray-600 mt-2">
                                    {location.warehouse ? (
                                        <Link href={`/warehouse/${location.warehouse.id}`} className="hover:text-blue-600 hover:underline">
                                            {location.warehouse.name}
                                        </Link>
                                    ) : (
                                        'No warehouse assigned'
                                    )}
                                </p>
                            </div>
                            <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8'>
                                <h3 className='font-semibold'>Products</h3>
                                <ul className="list-disc pl-5 mt-2">
                                    {location.stocks.length > 0 ? location.stocks.map((stock: any) => (
                                        <li key={stock.id}>
                                            <Link href={`/product/${stock.product.id}`}>
                                                {stock.product.name} (Quantity: {stock.quantity})
                                            </Link>
                                        </li>
                                    )) : (
                                        <li>No products in this location</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8'>
                            <h3 className='font-semibold font-lg'>Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h3 className='text-md'>Edit</h3>
                                    <Link href={`/location/${location.id}/edit`}>
                                        <Button variant="outline" className="cursor-pointer mt-4">
                                            Edit Location
                                        </Button>
                                    </Link>
                                </div>
                                <div>
                                    <h3 className='text-md'>Danger Zone</h3>
                                    <Button variant="destructive" className="cursor-pointer mt-4" size={"sm"} onClick={() => deleteLocation(location.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
