import { Warehouse } from '@/types/resources';
import QuantityUnitInput from './QuantityUnitInput';
import WarehouseLocationPicker from './WarehouseLocationPicker';

export default function InboundSection({ form, warehouses }: { form: any; warehouses: Warehouse[] }) {
    const {
        data,
        setData,
        errors,
        filteredLocations,
        filteredUnits,
        selectedWarehouse,
        selectedLocation,
        handleWarehouseChange,
        handleLocationChange,
        currentStock,
        warehousePopoverOpen,
        locationPopoverOpen,
        setWarehousePopoverOpen,
        setLocationPopoverOpen,
    } = form;
    return (
        <>
            <WarehouseLocationPicker
                warehouses={warehouses}
                locations={filteredLocations}
                selectedWarehouse={selectedWarehouse}
                onWarehouseSelect={handleWarehouseChange}
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationChange}
                warehousePopoverOpen={warehousePopoverOpen}
                locationPopoverOpen={locationPopoverOpen}
                setWarehousePopoverOpen={setWarehousePopoverOpen}
                setLocationPopoverOpen={setLocationPopoverOpen}
                errors={errors}
            />

            <QuantityUnitInput data={data} setData={setData} units={filteredUnits} errors={errors} currentStock={currentStock} />
        </>
    );
}
