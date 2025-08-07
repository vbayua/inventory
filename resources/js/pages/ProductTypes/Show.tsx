import ContainerLayout from "@/components/container-layout";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";

export default function Show({ productType }: { productType: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Product Types',
            href: '/product-types',
        },
        {
            title: productType.name,
            href: `/product-types/${productType.id}`
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Type Details" />
            <ContainerLayout>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{productType.name}</h2>

                        <p className="text-gray-600">Product Type ID: {productType.id}</p>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
