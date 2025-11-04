import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import StockDetailCard from '@/components/stocks/StockDetailCard';
import OperationHistoryTable from '@/components/stocks/OperationHistoryTable';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRef, useState } from 'react';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

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

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAdjustDialog, setShowAdjustDialog] = useState(false);
    const [minimumQuantity, setMinimumQuantity] = useState(stock?.minimum_quantity || 0);


    const handleMinimumQuantityUpdate = () => {
        router.put(route('stocks.update', stock.id), {
            minimum_quantity: minimumQuantity,
        }, {
            onSuccess: () => {
                setShowEditDialog(false);
            },
            onError: () => {
                //
            }
        });
    }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${stock?.batch?.batch_number} - ${stock?.product?.name}`} />
            <ContainerLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
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

                    <div>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Actions</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Stock Actions</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                                        Edit Stock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Adjust Stock
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Stock</DialogTitle>
                                <DialogDescription>
                                    Edit stock details here.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Minimum Quantity</FieldLabel>
                                    <Input
                                        name="minimum_quantity"
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-md"
                                        defaultValue={stock?.minimum_quantity}
                                        onChange={(e) => setMinimumQuantity(e.target.valueAsNumber)}
                                        min={0}
                                        step={0.1}
                                    />
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    onClick={handleMinimumQuantityUpdate}
                                >Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
