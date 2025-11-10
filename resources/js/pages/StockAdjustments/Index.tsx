import ContainerLayout from "@/components/container-layout";
import { DataTable } from "@/components/stock-adjustments/data-table";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { columns } from "@/components/stock-adjustments/columns";

type Batch = {
    id: number;
    batch_number: string;
    [key: string]: any; // Adjust this type based on your batch structure
}

type Product = {
    id: number;
    name: string;
    [key: string]: any; // Adjust this type based on your product structure
}

type Location = {
    id: number;
    name: string;
    [key: string]: any; // Adjust this type based on your location structure
}


type Stock = {
    id: number;
    name: string;
    location?: Location;
    product?: Product;
    batch?: Batch;
    [key: string]: any; // Adjust this type based on your stock structure
}

type AdjustmentIndex = {
    id: number;
    stock?: Stock;
    adjustment_type: string;
    unit: string;
    quantity: number;
    remarks: string;
    created_at: string;
    operation_date: string;
}

export default function Index({ stock_adjustments }: { stock_adjustments: AdjustmentIndex[] }) {
    return (
        <AppLayout>
            <Head title="Stock Adjustments" />
            <ContainerLayout>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Stock Adjustments</h1>
                        <p className="text-sm text-muted-foreground mb-6">Stock adjustments log</p>
                    </div>
                </div>
                <DataTable columns={columns} data={stock_adjustments} clientSide={true} />
            </ContainerLayout>
        </AppLayout>
    )
}
