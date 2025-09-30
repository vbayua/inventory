import ContainerLayout from "@/components/container-layout";
import { buttonVariants } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";


export default function Show({ batch }: { batch: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Batches',
            href: route('batch.index')
        },
        {
            title: String(batch.batch_number),
            href: route('batch.show', batch.id)
        }
    ]

    const createdDate = new Date(batch.created_at).toLocaleDateString('en-US', {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
    const updatedDate = new Date(batch.updated_at).toLocaleDateString('en-US', {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
    const manufactureDate = batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString('en-US', {
        year: "numeric",
        month: "long",
        day: "numeric"
    }) : false;

    const expiryDate = batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-US', {
        year: "numeric",
        month: "long",
        day: "numeric"
    }) : false;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch" />

            <ContainerLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h3 className="text-base/7 font-semibold text-white">Batch Information</h3>
                        <p className="mt-1 max-w-2xl text-sm/6 text-gray-400">Batch details and information.</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={route('batch.index')}>Back to index</Link>
                    </div>
                </div>
                <div>
                    <div className="mt-6 border-t border-white/10">
                        <dl className="divide-y divide-white/10">
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-100">Batch Number</dt>
                                <dd className="mt-1 text-sm/6 text-gray-400 hover:text-gray-100 sm:col-span-2 sm:mt-0">{batch.batch_number}</dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-100">Product Name</dt>
                                <dd className="mt-1 text-sm/6 text-gray-400 hover:text-gray-100 sm:col-span-2 sm:mt-0">{batch.product.name}</dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-100">Supplier</dt>
                                <dd className="mt-1 text-sm/6 text-gray-400 hover:text-gray-100 sm:col-span-2 sm:mt-0">{batch.supplier.name}</dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-100">Manufactured Date</dt>
                                <dd className="mt-1 text-sm/6 text-gray-400 hover:text-gray-100 sm:col-span-1 sm:mt-0">{manufactureDate ? manufactureDate : "Not Set"}</dd>
                                <dd className="mt-1 text-sm/6 text-blue-400 hover:text-gray-100 hover:cursor-pointer sm:col-span-1 sm:mt-0">
                                    <Link href={route('batch.edit', { batch: batch.id, })}>Set Manufacture Date</Link>
                                </dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-100">Expiry Date</dt>
                                <dd className="mt-1 text-sm/6 text-gray-400 hover:text-gray-100 sm:col-span-2 sm:mt-0">{expiryDate}</dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-100">Last updated</dt>
                                <dd className="mt-1 text-sm/6 text-gray-400 hover:text-gray-100 sm:col-span-2 sm:mt-0">{updatedDate}</dd>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-100">Created at</dt>
                                <dd className="mt-1 text-sm/6 text-gray-400 hover:text-gray-100 sm:col-span-2 sm:mt-0">{createdDate}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

            </ContainerLayout>
        </AppLayout>
    )
}
