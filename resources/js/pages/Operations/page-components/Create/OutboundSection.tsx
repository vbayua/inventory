import { Warehouse } from '@/types/resources';
import QuantityUnitInput from './QuantityUnitInput';
import WarehouseLocationPicker from './WarehouseLocationPicker';

export default function OutboundSection({ form, warehouses }: { form: any; warehouses: Warehouse[] }) {
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
    console.log(currentStock);
    return (
        <>
            <WarehouseLocationPicker
                warehouses={warehouses}
                locations={filteredLocations}
                selectedWarehouse={selectedWarehouse}
                warehousePopoverOpen={warehousePopoverOpen}
                setWarehousePopoverOpen={setWarehousePopoverOpen}
                locationPopoverOpen={locationPopoverOpen}
                setLocationPopoverOpen={setLocationPopoverOpen}
                onWarehouseSelect={handleWarehouseChange}
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationChange}
                errors={errors}
            />

            <QuantityUnitInput data={data} setData={setData} units={filteredUnits} errors={errors} currentStock={currentStock} />
        </>
    );
}
