import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { Role, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ user }: { user: User }) {
    const { data, setData, put, reset, processing } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles?.map((role: Role) => role.name),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        put(route('admin.users.update', { id: user.id }), {
            onSuccess: () => {},
            onError: (error) => {
                console.error(error);
            },
        });
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="mt-4">
                                Assign Roles
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48">
                            {/* Role assignment UI goes here */}
                            <div>
                                <Label>
                                    <input
                                        type="checkbox"
                                        checked={data.roles?.includes('admin')}
                                        onChange={(e) => {
                                            const roles = data.roles?.includes('admin')
                                                ? data.roles?.filter((role) => role !== 'admin')
                                                : data.roles?.length
                                                  ? [...data.roles, 'admin']
                                                  : ['admin'];
                                            setData('roles', roles);
                                        }}
                                    />
                                    Admin
                                </Label>
                                <Label className="mt-2">
                                    <input
                                        type="checkbox"
                                        checked={data.roles?.includes('operator')}
                                        onChange={(e) => {
                                            const roles = data.roles?.includes('operator')
                                                ? data.roles?.filter((role) => role !== 'operator')
                                                : data.roles?.length
                                                  ? [...data.roles, 'operator']
                                                  : ['operator'];
                                            setData('roles', roles);
                                        }}
                                    />
                                    Operator
                                </Label>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {/* Additional form fields for password, roles, etc. */}
                    <Button disabled={processing} className="btn btn-primary mt-4">
                        Save Changes
                    </Button>
                </form>
            </ContainerLayout>
        </AppLayout>
    );
}
