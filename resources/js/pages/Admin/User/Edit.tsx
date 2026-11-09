import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RoleCheckboxList from '@/components/users/role-checkbox-list';
import AppLayout from '@/layouts/app-layout';
import { Role, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';

type EditUserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: string[];
};

export default function Edit({ user, roles }: { user: User; roles: Role[] }) {
    const { data, setData, put, processing, errors } = useForm<EditUserForm>({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles?.map((role: Role) => role.name) ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.users.update', { id: user.id }));
    };
    return (
        <AppLayout>
            <Head title="Edit User" />
            <ContainerLayout>
                <form onSubmit={handleSubmit}>
                    <Label htmlFor="name"> Name </Label>
                    <Input
                        id="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                    />
                    <Label htmlFor="email" className="mt-4">
                        {' '}
                        Email{' '}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <RoleCheckboxList
                        roles={roles}
                        selectedRoleNames={data.roles}
                        onChange={(roleNames) => setData('roles', roleNames)}
                        error={errors.roles ?? errors['roles.0']}
                    />
                    <Button disabled={processing} className="btn btn-primary mt-4">
                        Save Changes
                    </Button>
                </form>
            </ContainerLayout>
        </AppLayout>
    );
}
