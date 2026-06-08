import { Batch, Location, Product, Stock, Unit, Warehouse } from '@/types/resources';
import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type OperationForm = {
    product: string;
    batch: string;
    quantity: string | number;
    location: string;
    date?: string; // Optional date field,
    unit: string;
    operationType: string;
    adjustmentType: string;
    remarks: string;
    // transfer operation might need more fields like destination location
    source_location?: string;
    destination_location?: string;
};

export default function useOperationForm({
    stocks,
    warehouses,
    batches,
    locations,
    units,
    stockQuery,
    operationType,
    adjustmentType,
}: {
    stocks: Stock[];
    warehouses: Warehouse[];
    batches: Batch[];
    locations: Location[];
    units: Unit[];
    stockQuery?: Stock;
    operationType: 'outbound' | 'inbound' | 'adjustment' | 'transfer' | 'return';
    adjustmentType?: 'addition' | 'subtraction';
}) {
    const { data, setData, post, reset, processing, errors } = useForm<OperationForm>({
        product: '',
        batch: '',
        quantity: 0,
        location: '',
        date: '',
        unit: '',
        operationType: operationType || 'outbound',
        adjustmentType: adjustmentType || 'addition',
        remarks: '',
        source_location: '',
        destination_location: '',
    });

    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [selectedBatch, setSelectedBatch] = useState<Batch>();
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse>();
    const [selectedLocation, setSelectedLocation] = useState<Location>();
    const [selectedUnit, setSelectedUnit] = useState<Unit>();

    const [selectedTransferLocations, setSelectedTransferLocations] = useState<{
        source_warehouse: Warehouse | undefined;
        source_location: Location | undefined;
        destination_warehouse: Warehouse | undefined;
        destination_location: Location | undefined;
    }>({
        source_warehouse: undefined,
        source_location: undefined,
        destination_warehouse: undefined,
        destination_location: undefined,
    });

    const resetForm = () => {
        setSelectedProduct(undefined);
        setSelectedBatch(undefined);
        setSelectedLocation(undefined);
        setSelectedWarehouse(undefined);
        setSelectedUnit(undefined);
    };

    const handleProductChange = (product: Product) => {
        if (selectedProduct) resetForm();
        setSelectedProduct(product);

        setData({ ...data, product: String(product.id) });
    };

    const handleBatchChange = (batch: Batch) => {
        setSelectedBatch(batch);
        setData({ ...data, batch: String(batch.id) });
    };

    const handleLocationChange = (location: Location) => {
        setSelectedLocation(location);
        setData({ ...data, location: String(location.id) });
    };

    const handleWarehouseChange = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setData({ ...data, location: '' });
    };

    const handleUnitChange = (unit: Unit) => {
        setSelectedUnit(unit);
        setData({ ...data, unit: String(unit.name) });
    };

    const handleTransferChange = ({ name, value }: { name: string; value: any }) => {
        if (name === 'source_warehouse') {
            setSelectedTransferLocations({ ...selectedTransferLocations, source_warehouse: value ?? undefined, source_location: undefined });
            setData({ ...data, source_location: undefined });
        } else if (name === 'destination_warehouse') {
            setSelectedTransferLocations({
                ...selectedTransferLocations,
                destination_warehouse: value ?? undefined,
                destination_location: undefined,
            });
            setData({ ...data, destination_location: undefined });
        } else {
            setSelectedTransferLocations({ ...selectedTransferLocations, [name]: value ?? undefined });
            setData({ ...data, [name]: value?.id });
        }
    };

    const filteredBatches = useMemo(() => {
        if (!selectedProduct) return [];
        return batches.filter((batch) => batch.product_id === selectedProduct.id);
    }, [selectedProduct, batches]);

    const filteredLocations = useMemo(() => {
        if (!selectedProduct || !selectedBatch || !selectedWarehouse) return [];
        if (data.operationType === 'outbound' || data.operationType === 'transfer') {
            return (
                selectedWarehouse.locations?.filter((location) =>
                    stocks.some(
                        (item: Stock) =>
                            item.batch_id === selectedBatch.id &&
                            item.product_id === selectedProduct.id &&
                            item.location_id === location.id &&
                            Number(item.quantity) > 0,
                    ),
                ) ?? []
            );
        }
        return selectedWarehouse.locations ?? [];
    }, [data.operationType, selectedProduct, selectedBatch, selectedWarehouse, stocks]);

    const filteredSourceLocations = useMemo(() => {
        if (!selectedProduct || !selectedBatch || !selectedTransferLocations.source_warehouse) return [];
        const filteredData = warehouses.find((warehouse) => warehouse.id === selectedTransferLocations?.source_warehouse?.id);
        return (
            filteredData?.locations?.filter((location) =>
                stocks.some(
                    (item: Stock) =>
                        item.batch_id === selectedBatch.id &&
                        item.product_id === selectedProduct.id &&
                        item.location_id === location.id &&
                        Number(item.quantity) > 0,
                ),
            ) ?? []
        );
    }, [selectedProduct, selectedBatch, stocks, warehouses, selectedTransferLocations]);

    const filteredUnits = useMemo(() => {
        if (!selectedProduct || !selectedBatch) return [];
        return units.filter((unit) => unit.base_unit === selectedProduct.unit.base_unit);
    }, [selectedProduct, selectedBatch, units]);

    const filteredDestinationLocations = useMemo(() => {
        if (!selectedProduct || !selectedBatch || !selectedTransferLocations.destination_warehouse) return [];
        const filteredData = warehouses.find((warehouse) => warehouse.id === selectedTransferLocations?.destination_warehouse?.id);
        return filteredData?.locations ?? [];
    }, [selectedProduct, selectedBatch, selectedTransferLocations.destination_warehouse, warehouses]);

    const currentStock = useMemo(() => {
        if (!selectedProduct || !selectedBatch || !selectedLocation || !selectedTransferLocations.source_location) return 0;
        const currentStock = stocks.find(
            (item: Stock) =>
                item.batch_id === selectedBatch.id &&
                item.product_id === selectedProduct.id &&
                (item.location_id === selectedLocation.id || item.location_id === selectedTransferLocations?.source_location?.id),
        );
        if (currentStock) {
            setSelectedUnit(units.find((unit) => unit.name === currentStock.unit));
            setSelectedWarehouse(warehouses.find((warehouse) => warehouse.id === currentStock.location?.warehouse_id));
            setData('batch', String(selectedBatch.id));
            setData('unit', currentStock.unit);
            return currentStock;
        }
        return 0;
    }, [selectedProduct, selectedBatch, selectedLocation, setData, units, warehouses, stocks, selectedTransferLocations.source_location]);

    const handleSubmit = () => {
        post('/operations', {
            onSuccess: () => {
                reset();
            },
            onError: (error) => {
                console.error(error);
                for (const field in error) {
                    toast.error(error[field]);
                }
            },
        });
    };

    return {
        data,
        post,
        setData,
        errors,
        reset,
        processing,
        selectedProduct,
        selectedBatch,
        currentStock,
        selectedLocation,
        selectedWarehouse,
        selectedUnit,
        selectedTransferLocations,
        handleProductChange,
        handleLocationChange,
        handleWarehouseChange,
        handleUnitChange,
        handleTransferChange,
        handleBatchChange,
        handleSubmit,
        filteredLocations,
        filteredBatches,
        filteredSourceLocations,
        filteredDestinationLocations,
        filteredUnits,
    };
}
