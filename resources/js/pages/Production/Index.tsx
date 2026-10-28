import ContainerLayout from "@/components/container-layout";
import { columns } from "@/components/production/columns";
import { DataTable } from "@/components/production/data-table";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Production Plan</h1>
                    <div>
                        <ButtonGroup>
                            <Button variant="default" asChild>
                                <Link href={route('production.create')}>
                                    Create Production Order
                                </Link>
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div>
                    <DataTable columns={columns} data={productionOrders} clientSide={true} onRowClick={(production) => router.visit(`/production/${production.id}`)} />
                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
