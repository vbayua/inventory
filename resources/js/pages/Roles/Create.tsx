import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: route('role.index'),
    },
    {
        title: 'Create Role',
        href: route('role.create'),
    },
];

type CreateRoleForm = {
    name: string;
    description: string;
};

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<CreateRoleForm>({
        name: '',
        description: '',
    });

    const createRole: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('role.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <ContainerFormLayout>
                <form onSubmit={createRole} className="flex flex-col gap-4">
                    <div>
                        <Button variant="link" className="p-1" size="sm" asChild>
                            <Link href={route('role.index')} prefetch={false}>
                                <ArrowLeft className="h-4" /> Back to Roles
                            </Link>
                        </Button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Create Role</h1>
                        <p className="text-muted-foreground text-sm">You can assign permissions after the role is created.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            required
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div>
                        <Button type="submit" size="sm" disabled={processing}>
                            Create Role
                        </Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
