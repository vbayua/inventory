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
    } = form;
    console.log(currentStock);
    return (
        <>
            <WarehouseLocationPicker
                warehouses={warehouses}
                locations={filteredLocations}
                selectedWarehouse={selectedWarehouse}
                onWarehouseSelect={handleWarehouseChange}
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationChange}
                errors={errors}
            />

            <QuantityUnitInput data={data} setData={setData} units={filteredUnits} errors={errors} currentStock={currentStock} />
        </>
    );
}
