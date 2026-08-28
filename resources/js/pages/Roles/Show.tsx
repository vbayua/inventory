import ContainerLayout from "@/components/container-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Role } from "@/types";
import { RolePermission } from "@/types/resources";
import { Head } from "@inertiajs/react";
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Roles",
        href: "/roles",
    }
]
export default function Show({ role, rolePermissions }: { role: Role; rolePermissions: RolePermission[] }) {
    const breadCrumbsWithroles: BreadcrumbItem[] = [
        ...breadcrumbs,
        {
            title: role.name.toString().charAt(0).toUpperCase() + role.name.toString().slice(1),
            href: `/roles/${role.id}`,
        }
    ]

    console.log(rolePermissions)
    return (
        <AppLayout breadcrumbs={breadCrumbsWithroles}>
            <Head title="Role Details" />
            <ContainerLayout>
                <div>
                    <h1>{role.name.toString().charAt(0).toUpperCase() + role.name.toString().slice(1)}</h1>
                </div>
                <div>
                    <h2 className="">Role Permissions</h2>
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
