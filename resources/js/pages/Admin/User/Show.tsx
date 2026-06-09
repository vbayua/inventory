import ContainerLayout from '@/components/container-layout';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Show({ user }: { user: any }) {
    return (
        <AppLayout>
            <Head title="User Details" />
            <ContainerLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="mb-4 text-2xl font-bold">User Details</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Detailed information about the user will be displayed here.</p>
                        {/* Additional user details components can be added here */}

                        <ul>
                            <li>
                                <strong>Name:</strong> {user.name}
                            </li>
                            <li>
                                <strong>Email:</strong> {user.email}
                            </li>
                            <li>
                                <strong>Roles:</strong> {user.roles.map((role: string) => role.name).join(', ')}
                            </li>
                        </ul>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
