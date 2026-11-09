import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RoleCheckboxList from '@/components/users/role-checkbox-list';
import AppLayout from '@/layouts/app-layout';
import { Role } from '@/types';
import { Head, useForm } from '@inertiajs/react';

type CreateUserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: string[];
};

export default function Create({ roles }: { roles: Role[] }) {
    const { data, setData, post, reset, processing, errors } = useForm<CreateUserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => reset(),
            onError: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AppLayout>
            <Head title="Create User" />
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
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password_confirmation">Password Confirmation</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>
                    <Button disabled={processing} className="btn btn-primary mt-4">
                        Create User
                    </Button>
                </form>
            </ContainerLayout>
        </AppLayout>
    );
}
