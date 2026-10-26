import ContainerLayout from "@/components/container-layout";
import { columns } from "@/components/production/columns";
import { DataTable } from "@/components/production/data-table";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Production } from "@/types/resources";
import { Head, Link, router } from "@inertiajs/react";
import { CheckIcon, Icon } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Production",
        href: "/production",
    }
];
export default function Index({productionOrders} : {productionOrders: Production[]}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Production Plan"/>
            <ContainerLayout>
                <div>
                    <h1 className="mb-4 text-2xl font-bold">Production Plan</h1>
                </div>
                <div>
                    <DataTable columns={columns} data={productionOrders} clientSide={true} onRowClick={(production) => router.visit(`/production/${production.id}`)} />
                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
