import ContainerFormLayout from "@/components/container-form-layout";
import ContainerLayout from "@/components/container-layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Role } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { LucideKeyRound, PencilIcon } from "lucide-react";


const breadcrumbs : BreadcrumbItem[] = [
    {
        title: "Roles",
        href: "/roles",
    }
]
export default function Index({ roles }: { roles: Role[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Roles" />
            <ContainerFormLayout>
                <div>
                    <h1 className="mb-4 text-2xl font-bold">Roles</h1>
                    <p className="text-muted-foreground mb-6 text-sm">User Roles Management</p>
                </div>

                <div>
                    <Table>
                        <TableCaption>List of Roles</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-medium tracking-wider uppercase">Name</TableHead>
                                <TableHead className="font-medium tracking-wider uppercase">Description</TableHead>
                                <TableHead className="font-medium tracking-wider uppercase">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles && roles.map((role) => (
                                <TableRow key={role.id}>
                                   <TableCell className="text-primary font-medium tracking-wider">{role.name.toString().charAt(0).toUpperCase() + role.name.toString().slice(1)}</TableCell>
                                   <TableCell className="text-muted-foreground tracking-wider">{role.description}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('role.edit', {id: role.id})} prefetch={false}>
                                            <span><PencilIcon className="w-4 h-4" /></span>
                                            Edit
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('role.edit.permissions', {id: role.id})} prefetch={false}>
                                                <span><LucideKeyRound className="w-4 h-4" /></span>
                                                Manage Permissions
                                            </Link>
                                        </Button>
                                   </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </ContainerFormLayout>
        </AppLayout>
    )
}
