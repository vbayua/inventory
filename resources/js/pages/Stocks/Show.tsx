import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

type Operation = {
    id: number;
    product?: {
        id: number;
        name?: string;
    };
    batch?: {
        id: number;
        batch_number?: string;
    };
    location?: {
        id: number;
        name?: string;
    };
    quantity?: number;
    unit?: string;
    remarks?: string;
    operation_type?: string;
    operation_date?: Date | string;
    created_at?: string;
    updated_at?: string;
}

export default function Show({ operation }: { operation: Operation }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Operation',
            href: '/operations',
        },
        {
            title: `${operation?.batch?.batch_number} - ${operation?.product?.name}`,
            href: `/operations/${operation.id}`,
        }
    ];

    const deleteOperation = (id: number) => {
        if (confirm('Are you sure you want to delete this operation?')) {
            // Call the delete API endpoint
            router.delete(`/operations/${id}`, {
                onSuccess: () => {
                    toast.success('Operation deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete operation');
                },
            });
        }
    };
    console.log("Operation:", operation);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${operation?.product?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{operation?.batch?.batch_number} - {operation?.product?.name}</h2>

                        <p className="text-gray-600">Operation ID: {operation.id}</p>
                        <p className="text-gray-600">
                            {operation.operation_type?.toString().toUpperCase()} - {operation.operation_date ? new Date(operation.operation_date).toLocaleDateString() : 'N/A'}
                        </p>
                        {/* <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8'>
                            <h3 className='font-semibold font-lg'>Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h3 className='text-md'>Edit</h3>
                                    <Link href={`/operations/${operation.id}/edit`}>
                                        <Button variant="outline" className="cursor-pointer mt-4">
                                            Edit Operation
                                        </Button>
                                    </Link>
                                </div>
                                <div>
                                    <h3 className='text-md'>Danger Zone</h3>
                                    <Button variant="destructive" className="cursor-pointer mt-4" size={"sm"} onClick={() => deleteOperation(operation.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
