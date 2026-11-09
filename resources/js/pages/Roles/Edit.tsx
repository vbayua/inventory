import ContainerFormLayout from '@/components/container-form-layout';
import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Role } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Roles",
        href: "/roles",
    }
]
export default function Edit({role}:{role:Role}) {
    const breadcrumbsWithRole = [
        ...breadcrumbs,
        {
            title: `${role.name}`,
            href: `/roles/${role.id}/edit`,
        },
    ]

    const { data, setData, put, reset, processing, isDirty } = useForm({
        name: role.name,
        description: role.description,
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('role.update', { id: role.id, ...data }), {
            onSuccess: () => {
                //
            },
            onError: () => {
                //
            },
        })
    }
    return (
        <AppLayout breadcrumbs={breadcrumbsWithRole}>
            <Head title="Edit Roles"/>
            <ContainerFormLayout>
                <form onSubmit={handleSubmit}>
                    <div>
                        <Button variant="link" className="p-1" size="sm" asChild>
                            <Link href={route('role.index')} prefetch={false}><ArrowLeft className="h-4"/> Back to Roles</Link>
                        </Button>
                    </div>
                    <h1 className="text-2xl font-semibold">Edit Role</h1>
                    <div className="flex flex-col gap-4 [&_div]:flex [&_div:not(:last-child)]:flex-col [&_div]:gap-2">
                        <div>
                        </div>
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input type="text" id="name" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />

                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input type="text" id="description" name="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </div>
                        <div className="flex w-full">
                            <Button type="submit" variant="default" size="sm" disabled={!isDirty || processing}>Save</Button>

                            {isDirty && <Button type="reset" variant="destructive" size="sm" onClick={() => {
                                                            setData('name', role.name);
                                                            setData('description', role.description);
                                                        }}>
                                                            Reset
                                                        </Button>}
                        </div>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    )
}
