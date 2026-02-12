import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
type Role = {
    id: number;
    name: string;
};
export default function Edit({ roles }: { roles: Role[] }) {
    const { data, setData, post, reset, processing } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        // put(`/admin/users/${user.id}`, {
        //     onSuccess: () => reset('password', 'password_confirmation'),
        // });
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
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign Role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem
                                    key={role.id}
                                    value={role.name}
                                    onSelect={() => {
                                        setData('role_id', role.id.toString());
                                    }}
                                >
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Additional form fields for password, roles, etc. */}
                    <Button disabled={processing} className="btn btn-primary mt-4">
                        Save Changes
                    </Button>
                </form>
            </ContainerLayout>
        </AppLayout>
    );
}
