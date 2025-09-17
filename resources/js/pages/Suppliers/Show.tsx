import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function Show({ supplier }: {
    supplier: {
        id: number;
        name?: string;
        products?: any;
    }
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Suppliers',
            href: '/suppliers',
        },
        {
            title: `${supplier.name}`,
            href: `/supplier/${supplier.id}`,
        }
    ];

    const deleteSupplier = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('supplier.destroy', { id }))
            toast.success('Supplier deleted successfuly')
        }
    }
    console.log(supplier);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${supplier?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{supplier.name}</h2>

                        <p className="text-gray-600">Supplier ID: {supplier.id}</p>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8">
                                <h3 className="font-semibold">Details</h3>
                                <p>-</p>
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8">
                                <h3 className="font-semibold">Products</h3>
                                <ul className="list-disc pl-5 mt-2">
                                    {supplier.products.length > 0 ? supplier.products.map((product: any) => (
                                        <li key={product.id}>
                                            {product.name}
                                        </li>
                                    )) : (
                                        <li>No Product Found</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Link href={`/supplier/${supplier.id}/edit`}>
                                <Button variant="outline" className="cursor-pointer mt-4">
                                    Edit Supplier
                                </Button>
                            </Link>
                            <div>
                                <h3 className='text-md font-semibold'>Danger Zone</h3>
                                <Button variant="destructive" className="cursor-pointer mt-4" size={"sm"} onClick={() => deleteSupplier(supplier.id)}>
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
