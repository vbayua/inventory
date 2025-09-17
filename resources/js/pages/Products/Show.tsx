import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function Show({ product }: { product: { id: number; name?: string, suppliers: any } }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Product',
            href: '/products',
        },
        {
            title: `${product.name}`,
            href: `/products/${product.id}`,
        }
    ];

    const deleteProduct = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            // Call the delete API endpoint
            router.delete(`/products/${id}`, {
                onSuccess: () => {
                    toast.success('Product deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete product');
                },
            });
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${product?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{product.name}</h2>
                        <p className="text-gray-600">product ID: {product.id}</p>
                        <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8'>
                            <h3 className="font-semibold font-lg">Suppliers</h3>
                            <ul className='list-disc pl-5 mt-2'>
                                {product.suppliers.length > 0 ? product.suppliers.map((supplier: any) => (
                                    <li key={supplier.id}>
                                        <Link href={route('supplier.show', supplier.id)}>
                                            {supplier.name}
                                        </Link>
                                    </li>
                                )) :
                                    (
                                        <li>No Supplier Found</li>
                                    )}
                            </ul>
                        </div>
                        <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8'>
                            <h3 className='font-semibold font-lg'>Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h3 className='text-md'>Edit</h3>
                                    <Link href={`/products/${product.id}/edit`}>
                                        <Button variant="outline" className="cursor-pointer mt-4">
                                            Edit Product
                                        </Button>
                                    </Link>
                                </div>
                                <div>
                                    <h3 className='text-md'>Danger Zone</h3>
                                    <Button variant="destructive" className="cursor-pointer mt-4" size={"sm"} onClick={() => deleteProduct(product.id)}>
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
