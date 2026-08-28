import ContainerFormLayout from "@/components/container-form-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Role  } from "@/types";
import { Permission } from "@/types/resources";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeftIcon, PenIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Roles",
        href: "/roles",
    }
]
export default function EditPermission({role, permissions, rolePermissions}: {role: Role, permissions: Permission[], rolePermissions: Permission[]}) {
    const breadCrumbsWithRoles: BreadcrumbItem[] = [
        ...breadcrumbs,
        {
            title: role.name.toString().charAt(0).toUpperCase() + role.name.toString().slice(1),
            href: route('role.show', { role: role.id })
        },
        {
            title: "Permissions",
            href: route('role.edit.permissions', { role: role.id })
        }
    ]
    const grouped = Object.groupBy(permissions, (permission) => permission.name.split(".")[0])
    const permissionNames = Object.keys(Object.groupBy(permissions, (permission) => permission.name.split(".")[1]))
    const groupedRolePermissions = Object.groupBy(rolePermissions, (permission) => permission.name.split(".")[0])
    const [readOnlyCheck, setReadOnlyCheck] = useState(true);


    const { data, setData, put, reset, disabled, isDirty, processing } = useForm({
        permissions: rolePermissions.map(p => p.id),
    })

    const handleEditPermission = (permission: Permission, checked: boolean) => {
        const newPermissions = checked
            ? [...data.permissions, permission.id]
            : data.permissions.filter(id => id !== permission.id);
        setData({ ...data, permissions: newPermissions });
    }

    const handleSave: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if(isDirty) {
            put(route('role.update.permissions', { role: role.id }), {
                onSuccess: () => {
                    setReadOnlyCheck(true);
                },
                onError: (error) => {
                    toast.error(error.message);
                    console.log(error)
                    setReadOnlyCheck(false);
                }
            })
        }
    }
    return (
        <AppLayout breadcrumbs={breadCrumbsWithRoles}>
            <Head title="Edit Role Permissions" />
            <ContainerFormLayout>
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Edit Role Permissions</h1>
                        {readOnlyCheck ?
                            <Button type="button" onClick={() => setReadOnlyCheck(false)}><span><PenIcon className="h-4" /></span>Edit Permission</Button> :
                            isDirty ?
                                <Button type="submit" variant="outline" onClick={handleSave} disabled={processing}>Save</Button> :
                                <Button type="button" variant="outline" onClick={() => setReadOnlyCheck(true)}>Cancel</Button>}
                    </div>
                    <div className="mt-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="font-semibold">
                                    <TableHead>Resources</TableHead>
                                    <TableHead colSpan={Object.keys(grouped).length} className="text-center">Permissions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell></TableCell>
                                    {permissionNames.map((permission) => <TableCell key={permission} className="text-center">{permission}</TableCell>)}
                                </TableRow>
                                {Object.entries(grouped).map(([resource, permissions]) => (
                                    <TableRow key={resource} className="capitalize">
                                        <TableCell>{resource}</TableCell>
                                        {permissions?.map((permission) =>
                                            <TableCell
                                                key={permission.id}
                                                role="checkbox"
                                                className="text-center">
                                                <Checkbox
                                                    id={permission.id.toString()}
                                                    name={resource}
                                                    defaultChecked={groupedRolePermissions[resource]?.some((rolePermission) => rolePermission.id === permission.id)}
                                                    onCheckedChange={(checked) => handleEditPermission(permission, checked)}
                                                    disabled={readOnlyCheck} />
                                            </TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </ContainerFormLayout>
        </AppLayout>
    )
}
