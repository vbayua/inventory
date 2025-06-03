import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Show({ product }: { product: { id: number; name?: string } }) {
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${product?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{product.name}</h2>

                        <p className="text-gray-600">product ID: {product.id}</p>
                        <div className="flex">
                            <Link href={`/products/${product.id}/edit`}>
                                <Button variant="outline" className="cursor-pointer mt-4">
                                    Edit Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
