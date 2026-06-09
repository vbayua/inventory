import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SelectCommand from '@/components/ui/select-command';
import { cn } from '@/lib/utils';
import { Location, Warehouse } from '@/types/resources';
import { ChevronsUpDown, LocateIcon, WarehouseIcon } from 'lucide-react';
import { useState } from 'react';

export default function WarehouseLocationPicker({
    warehouses,
    locations,
    selectedWarehouse,
    onWarehouseSelect,
    selectedLocation,
    onLocationSelect,
    errors,
}: {
    warehouses: Warehouse[];
    locations: Location[];
    selectedWarehouse: Warehouse;
    onWarehouseSelect: (warehouse: Warehouse) => void;
    selectedLocation: Location;
    onLocationSelect: (location: Location) => void;
    errors: any;
}) {
    const [warehousePopoverOpen, setWarehousePopoverOpen] = useState(false);
    const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
    return (
        <div className={cn('grid grid-cols-2 gap-4 rounded-md border p-4', errors.location && 'border-red-500')}>
            <div>
                <Label className="mb-2 flex items-center gap-2">
                    <WarehouseIcon className="text-primary w-4" /> Gudang
                </Label>
                <Popover open={warehousePopoverOpen} onOpenChange={setWarehousePopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className={cn('w-full justify-between', errors.location && 'text-muted-foreground border-red-500')}
                        >
                            {selectedWarehouse?.name || 'Select Warehouse'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                        <SelectCommand
                            lists={warehouses}
                            getKey={(item) => item.id}
                            getId={(item) => item.id}
                            getLabel={(item) => item.name}
                            onSelect={(item) => {
                                onWarehouseSelect(item);
                                setWarehousePopoverOpen(false);
                            }}
                            placeholder="Search warehouse..."
                            emptyText="No warehouse found"
                            renderItem={(item) => <span>{item.name}</span>}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div>
                <Label className="mb-2 flex items-center gap-2">
                    <LocateIcon className="text-primary w-4" />
                    <span>Lokasi</span>
                </Label>
                <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className={cn('w-full justify-between', errors.location && 'text-muted-foreground border-red-500')}
                            disabled={!selectedWarehouse}
                        >
                            {selectedLocation?.name ?? 'Select Location'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                        <SelectCommand
                            lists={locations}
                            getKey={(item) => item.id}
                            getId={(item) => item.id}
                            getLabel={(item) => item.name}
                            onSelect={(item) => {
                                onLocationSelect(item);
                                setLocationPopoverOpen(false);
                            }}
                            placeholder="Search location..."
                            emptyText="No location found"
                            renderItem={(item) => <span>{item.name}</span>}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
