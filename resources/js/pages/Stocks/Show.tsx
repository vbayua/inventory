import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import StockDetailCard from '@/components/stocks/StockDetailCard';
import OperationHistoryTable from '@/components/stocks/OperationHistoryTable';

type StockStatus = "available" | "out_of_stock" | "reserved" | "low_stock";

export default function Show({ stock, operations }: { stock: any, operations: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Stock Index',
            href: '/stocks',
        },
        {
            title: `${stock?.batch?.batch_number} - ${stock?.product?.name}`,
            href: `/stocks/${stock?.id}`,
        }
    ];
    const stockStatus = stock.status;


    const getStockBadge = (status: StockStatus) => {
        const colors: Record<StockStatus, string> = {
            available: "bg-green-100 text-green-800",
            out_of_stock: "bg-red-100 text-red-800",
            reserved: "bg-yellow-100 text-yellow-800",
            low_stock: "bg-orange-100 text-orange-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    }

    const stockData = {

    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${stock?.batch?.batch_number} - ${stock?.product?.name}`} />
            <ContainerLayout>
                <div className="mb-6">
                    <Button variant="ghost" className='text-muted-foreground hover:text-foreground' asChild>
                        <Link href={route('stocks.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Stocks
                        </Link>
                    </Button>

                    <h1 className="text-3xl font-bold mt-4">
                        {stock?.batch?.batch_number} - {stock?.product?.name}
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        View stock detail and operation history
                    </p>
                </div>

                <div className="space-y-6">
                    <StockDetailCard
                        batch_number={stock?.batch?.batch_number}
                        product_name={stock?.product?.name}
                        warehouse_name={stock?.location?.warehouse?.name}
                        location_name={stock?.location?.name}
                        quantity={stock?.quantity}
                        unit={stock?.unit}
                        status={stockStatus}
                    />
                    <OperationHistoryTable operations={operations} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
