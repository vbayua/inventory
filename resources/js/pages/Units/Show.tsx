import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function Show({ unit }: { unit: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Units',
            href: '/units',
        },
        {
            title: `${unit.name}`,
            href: `/units/${unit.id}`,
        }
    ];

    const deleteUnit = (id: number) => {
        if (confirm('are you sure?')) {
            router.delete(route('units.destroy', { name: unit.name }))
            toast.success('Unit deleted successfuly')
        }
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${unit?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4">
                        <h2 className="text-2xl font-semibold mb-4">{unit.name}</h2>

                        <p className="text-gray-600">Unit Type : {unit.unit_type}</p>
                        <p className="text-gray-600">Base Unit : {unit.base_unit}</p>
                        <p className="text-gray-600">Conversion to Base : 1 {unit.name} equals to {`${unit.conversion_to_base}${unit.base_unit}`}</p>

                        <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-8'>
                            <h3 className='font-semibold font-lg'>Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <h3 className='text-md'>Edit</h3>
                                    <Link href={`/units/${unit.id}/edit`}>
                                        <Button variant="outline" className="cursor-pointer mt-4">
                                            Edit Unit
                                        </Button>
                                    </Link>
                                </div>
                                <div>
                                    <h3 className='text-md'>Danger Zone</h3>
                                    <Button variant="destructive" className="cursor-pointer mt-4" size={"sm"} onClick={() => deleteUnit(unit.id)}>
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
