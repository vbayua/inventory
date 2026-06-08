import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SelectCommand from '@/components/ui/select-command';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Batch, Location, Product, Stock, Unit, Warehouse } from '@/types/resources';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { BoxesIcon, CalendarIcon, ChevronsUpDown, NotepadTextIcon, PackageIcon } from 'lucide-react';
import { SubmitEventHandler, useEffect, useState } from 'react';

import { ButtonGroup } from '@/components/ui/button-group';
import useOperationForm from '@/hooks/use-operation-form';
import { toast } from 'sonner';
import InboundSection from './page-components/Create/InboundSection';
import OperationTypeSelect from './page-components/Create/OperationTypeSelect';
import OutboundSection from './page-components/Create/OutboundSection';
import ProductSelectDialog from './page-components/Create/ProductSelectDialog';
import ReturnSection from './page-components/Create/ReturnSection';
import TransferSection from './page-components/Create/TransferSection';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Operations',
        href: '/operations',
    },
    {
        title: 'Create New Operation',
        href: '/operations/create',
    },
];

type OperationType = 'outbound' | 'inbound' | 'adjustment' | 'transfer' | 'return';

interface ProductsWithLinks extends Product {
    links: {
        active: boolean;
        label: string;
        page: number;
        url: string;
    }[];
    data: Product[];
    total?: number;
    from?: number;
    to?: number;
}

export default function Create({
    stocks,
    products,
    warehouses,
    locations,
    batches,
    units,
    stockQuery,
    operationType,
}: {
    stocks: Stock[];
    products: ProductsWithLinks[];
    warehouses: Warehouse[];
    locations: Location[];
    batches: Batch[];
    units: Unit[];
    stockQuery?: Stock;
    operationType?: OperationType;
    requests?: any;
}) {
    const stock = {
        data: stockQuery ?? undefined,
    };

    const form = useOperationForm({
        stocks,
        warehouses,
        locations,
        batches,
        units,
        stockQuery,
        operationType: operationType || 'outbound',
    });

    useEffect(() => {
        if (stock.data?.unit) {
            form.setData('unit', stock.data?.unit);
        }
    }, [stock.data, form.setData, form]);

    const operationTypes = [
        { value: 'outbound', label: 'Stock Out (Keluar/Pengeluaran)' },
        { value: 'inbound', label: 'Stock In (Masuk/Penerimaan)' },
        { value: 'transfer', label: 'Transfer Stock (Pindah)' },
        { value: 'return', label: 'Pengembalian Stock' },
    ];

    const [operationTypeData, setOperationType] = useState<OperationType>('outbound');

    const createOperation: SubmitEventHandler = (e) => {
        e.preventDefault();
        console.log('Creating operation with data:', form.data);
        form.post('/operations', {
            onSuccess: () => {
                form.reset();
            },
            onError: (errors) => {
                console.error(errors);
                for (const field in errors) {
                    toast.error(errors[field]);
                }
            },
            preserveScroll: true,
        });
    };

    const toggleOperationType = (value: string) => {
        setOperationType(value as OperationType);
        form.setData('operationType', operationTypeData);
        form.handleLocationChange({} as Location);
        form.setData('quantity', 0);
        form.setData('date', '');
        form.setData('remarks', '');
        form.handleWarehouseChange({} as Warehouse);
    };

    const handleProductSelect = (product: Product) => {
        form.handleProductChange(product);
    };

    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [batchPopoverOpen, setBatchPopoverOpen] = useState(false);
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Operation" />
            <ContainerLayout>
                <form onSubmit={createOperation} className="mb-6 space-y-6">
                    <h1 className="mb-12 text-2xl font-semibold">Operasi Stok</h1>
                    <OperationTypeSelect
                        operationTypes={operationTypes}
                        selectedValue={operationTypeData}
                        toggleOperationType={toggleOperationType}
                    />

                    {/*ADJUSTMENT SECTION*/}

                    {/*END OF ADJUSTMENT SECTION*/}

                    <div className="space-y-4">
                        <div
                            className={cn(
                                'grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2',
                                (form.errors.product || form.errors.batch) && 'border-red-500',
                            )}
                        >
                            <Field>
                                <FieldLabel className="flex items-center gap-2">
                                    <PackageIcon className="text-primary w-4" />
                                    Product
                                </FieldLabel>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        className={cn('w-full', form.errors.product && 'text-muted-foreground border-red-500')}
                                        onClick={() => setProductDialogOpen(true)}
                                        type="button"
                                    >
                                        {form.selectedProduct ? `${form.selectedProduct?.sku} ${form.selectedProduct?.name}` : 'No Product Selected'}
                                    </Button>
                                </div>
                                <ProductSelectDialog
                                    products={products}
                                    onProductSelect={handleProductSelect}
                                    selectedProduct={form.selectedProduct}
                                    productDialogOpen={productDialogOpen}
                                    setProductDialogOpen={setProductDialogOpen}
                                />
                            </Field>

                            <Field>
                                <FieldLabel className="flex items-center gap-2">
                                    <BoxesIcon className="text-primary w-4" />
                                    Batch
                                </FieldLabel>
                                <div>
                                    <Popover open={batchPopoverOpen} onOpenChange={setBatchPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-full justify-between', form.errors.batch && 'text-muted-foreground border-red-500')}
                                            >
                                                {form.selectedBatch?.batch_number ?? 'Pilih batch'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="start">
                                            <SelectCommand
                                                lists={form.filteredBatches}
                                                getKey={(item) => item.id}
                                                getId={(item) => item.id}
                                                getLabel={(item) => item.batch_number}
                                                onSelect={(item) => {
                                                    form.handleBatchChange(item);
                                                    form.handleLocationChange({} as Location);
                                                    setBatchPopoverOpen(false);
                                                }}
                                                placeholder="Cari batch..."
                                                emptyText={
                                                    <>
                                                        <span>Tidak ada batch untuk product yang dipilih</span>
                                                        <br />
                                                        <Button
                                                            variant={'link'}
                                                            onClick={() => {
                                                                window.open(route('batch.create', { product: form.selectedProduct?.id }), '_blank');
                                                            }}
                                                        >
                                                            Register Batch Baru?
                                                        </Button>
                                                    </>
                                                }
                                                renderItem={(item) => <span>{item.batch_number}</span>}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </Field>
                        </div>

                        {/*TRANSFER SECTION*/}
                        {operationTypeData === 'transfer' && <TransferSection form={form} warehouses={warehouses} locations={locations} />}
                        {/*END OF TRANSFER SECTION*/}

                        {/*OUTBOUND SECTION*/}
                        {operationTypeData === 'outbound' && <OutboundSection form={form} warehouses={warehouses} />}
                        {/*END OF OUTBOUND SECTION*/}

                        {/*INBOUND SECTION*/}
                        {operationTypeData === 'inbound' && <InboundSection form={form} warehouses={warehouses} />}
                        {/*END OF INBOUND SECTION*/}

                        {/*RETURN SECTION*/}
                        {operationTypeData === 'return' && <ReturnSection form={form} warehouses={warehouses} />}
                        {/*END OF RETURN SECTION*/}

                        {/* Adjust Qty Section */}

                        <div className={cn('grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2', form.errors.date && 'border-red-500')}>
                            <Label className="flex items-center gap-2">
                                <CalendarIcon className="text-primary w-4" />
                                Tanggal
                            </Label>

                            <div className="flex items-center gap-2 place-self-end">
                                <ButtonGroup>
                                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    form.errors.date && 'text-muted-foreground border-red-500',
                                                )}
                                                size="sm"
                                            >
                                                {form.data.date ? (
                                                    format(new Date(form.data.date), 'yyyy-MM-dd')
                                                ) : (
                                                    <span className="text-muted-foreground">Select date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                endMonth={new Date()}
                                                selected={form.data.date ? new Date(form.data.date) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        form.setData('date', format(date, 'yyyy-MM-dd'));
                                                        setDatePopoverOpen(false);
                                                    } else {
                                                        form.setData('date', '');
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => form.setData('date', format(new Date(), 'yyyy-MM-dd'))}
                                        disabled={form.processing}
                                        className="bg-accent/75 text-accent-foreground"
                                        size="sm"
                                    >
                                        Set Today
                                    </Button>
                                </ButtonGroup>
                            </div>
                            {form.errors.date && <p className="mt-1 text-sm text-red-500">{form.errors.date}</p>}
                        </div>

                        <div className="col-span-1 rounded-md border p-4 md:col-span-2">
                            <Label className="mb-4 flex items-center gap-1">
                                <NotepadTextIcon className="text-primary w-4" />
                                Notes / Remarks
                            </Label>
                            <Textarea
                                value={form.data.remarks}
                                onChange={(e) => form.setData('remarks', e.target.value)}
                                className={cn('w-full', form.errors.remarks && 'text-muted-foreground border-red-500')}
                            />
                        </div>
                    </div>
                    <Button variant="default" type="submit" className="w-full sm:w-auto">
                        Buat Operasi Stok
                    </Button>
                </form>
            </ContainerLayout>
        </AppLayout>
    );
}
