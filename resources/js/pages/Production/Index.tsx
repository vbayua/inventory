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
        title: "Production Plan",
        href: "/production",
    }
];
const data = [
    {
        id: 1,
        plan_number: "Production Plan 1",
        product_id: 1,
        target_quantity: 1000,
        bom_id: 1,
        status: 'pending',
        ordered_at: "2024-01-01",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        product: {
            id: 1,
            sku: "PP01",
            name: "Product 1",
            unit: "pcs",
        }
    },
    {
        id: 2,
        plan_number: "Production Plan 2",
        product_id: 2,
        target_quantity: 1000,
        bom_id: 2,
        status: 'pending',
        ordered_at: "2024-01-01",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        product: {
            id: 2,
            sku: "PP02",
            name: "Product 2",
            unit: "pcs",
        }
    },
    {
        id: 3,
        plan_number: "Production Plan 3",
        product_id: 3,
        target_quantity: 1000,
        bom_id: 3,
        status: 'pending',
        ordered_at: "2024-01-01",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        product: {
            id: 3,
            sku: "PP03",
            name: "Product 3",
            unit: "pcs",
        }
    },
    {
        id: 4,
        plan_number: "Production Plan 4",
        product_id: 4,
        target_quantity: 1000,
        bom_id: 4,
        status: 'pending',
        ordered_at: "2024-01-01",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        product: {
            id: 4,
            sku: "PP04",
            name: "Product 4",
            unit: "pcs",
        }
    },
] satisfies Production[];
export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Production Plan"/>
            <ContainerLayout>

                <div>
                    <DataTable columns={columns} data={data} clientSide={true} onRowClick={(production) => router.visit(`/production/${production.id}`)} />
                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
