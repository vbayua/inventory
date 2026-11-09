import InputError from '@/components/input-error';
import SelectCommand from '@/components/products/select-command';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { type Location, type Warehouse } from '@/types/resources';
import { useState } from 'react';

type DefaultLocationFieldProps = {
    warehouses: Pick<Warehouse, 'id' | 'name'>[];
    locations: Pick<Location, 'id' | 'name' | 'warehouse_id'>[];
    locationId: string;
    onLocationChange: (locationId: string) => void;
    error?: string;
};

export default function DefaultLocationField({ warehouses, locations, locationId, onLocationChange, error }: DefaultLocationFieldProps) {
    const [warehouseId, setWarehouseId] = useState<number | undefined>(
        () => locations.find((location) => String(location.id) === locationId)?.warehouse_id,
    );
    const [warehousePopover, setWarehousePopover] = useState(false);
    const [locationPopover, setLocationPopover] = useState(false);

    const filteredLocations = locations.filter((location) => location.warehouse_id === warehouseId);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
                <Label htmlFor="default_warehouse">Default Warehouse</Label>
                <Popover open={warehousePopover} onOpenChange={setWarehousePopover}>
                    <PopoverTrigger asChild>
                        <Button
                            id="default_warehouse"
                            type="button"
                            variant="outline"
                            className={cn('w-full justify-between', !warehouseId && 'text-muted-foreground')}
                        >
                            {warehouses.find((warehouse) => warehouse.id === warehouseId)?.name ?? 'Select a warehouse'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <SelectCommand
                            lists={warehouses}
                            getId={(warehouse) => warehouse.id}
                            getLabel={(warehouse) => warehouse.name}
                            placeholder="Select a warehouse"
                            onSelect={(warehouse) => {
                                if (warehouse.id !== warehouseId) {
                                    setWarehouseId(warehouse.id);
                                    onLocationChange('');
                                }
                                setWarehousePopover(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="default_location_id">Default Location</Label>
                <Popover open={locationPopover} onOpenChange={setLocationPopover}>
                    <PopoverTrigger asChild>
                        <Button
                            id="default_location_id"
                            type="button"
                            variant="outline"
                            disabled={!warehouseId}
                            className={cn('w-full justify-between', !locationId && 'text-muted-foreground')}
                        >
                            {filteredLocations.find((location) => String(location.id) === locationId)?.name ?? 'Select a location'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <SelectCommand
                            lists={filteredLocations}
                            getId={(location) => location.id}
                            getLabel={(location) => location.name}
                            placeholder="Select a location"
                            onSelect={(location) => {
                                onLocationChange(String(location.id));
                                setLocationPopover(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
                <InputError message={error} />
            </div>
        </div>
    );
}
