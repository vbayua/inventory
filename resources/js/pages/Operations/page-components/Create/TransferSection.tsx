import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SelectCommand from '@/components/ui/select-command';
import { cn } from '@/lib/utils';
import { Location, Warehouse } from '@/types/resources';
import { ChevronsUpDown, WarehouseIcon } from 'lucide-react';
import { useState } from 'react';
import QuantityUnitInput from './QuantityUnitInput';

export default function TransferSection({ form, warehouses, locations }: { form: any; warehouses: Warehouse[]; locations: Location[] }) {
    const [warehouseSourcePopoverOpen, setWarehouseSourcePopoverOpen] = useState(false);
    const [warehouseDestinationPopoverOpen, setWarehouseDestinationPopoverOpen] = useState(false);
    const [locationSourcePopoverOpen, setLocationSourcePopoverOpen] = useState(false);
    const [locationDestinationPopoverOpen, setLocationDestinationPopoverOpen] = useState(false);

    const {
        data,
        setData,
        errors,
        filteredSourceLocations,
        filteredDestinationLocations,
        filteredUnits,
        selectedTransferLocations,
        handleTransferChange,
        currentStock,
    } = form;
    console.log(data);
    return (
        <>
            <div className={cn('grid grid-cols-2 gap-4 rounded-md border p-4', errors.location && 'border-red-500')}>
                <div>
                    <Label className="mb-2 flex items-center gap-2">
                        <WarehouseIcon className="text-primary w-4" />
                        From
                    </Label>
                    <ButtonGroup orientation="vertical">
                        <Popover open={warehouseSourcePopoverOpen} onOpenChange={setWarehouseSourcePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn('justify-between', errors.location && 'text-muted-foreground border-red-500')}
                                >
                                    {selectedTransferLocations?.source_warehouse?.name ?? 'Select Warehouse'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                                <SelectCommand
                                    lists={warehouses}
                                    defaultValue={selectedTransferLocations?.source_warehouse?.id}
                                    onSelect={(value) => {
                                        handleTransferChange({ name: 'source_warehouse', value });
                                        setWarehouseSourcePopoverOpen(false);
                                    }}
                                    getKey={(item) => item.id}
                                    getLabel={(item) => item.name}
                                />
                            </PopoverContent>
                        </Popover>
                        <Popover open={locationSourcePopoverOpen} onOpenChange={setLocationSourcePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn('justify-between', errors.location && 'text-muted-foreground border-red-500')}
                                >
                                    {selectedTransferLocations?.source_location?.name ?? 'Pilih Sumber Lokasi'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                                <SelectCommand
                                    lists={filteredSourceLocations}
                                    defaultValue={selectedTransferLocations?.source_location?.id}
                                    onSelect={(value) => {
                                        handleTransferChange({ name: 'source_location', value: value });
                                        setLocationSourcePopoverOpen(false);
                                    }}
                                    getKey={(item) => item.id}
                                    getLabel={(item) => item.name}
                                />
                            </PopoverContent>
                        </Popover>
                    </ButtonGroup>
                </div>

                <div className="">
                    <Label className="mb-2 flex items-center gap-2">
                        <WarehouseIcon className="text-primary w-4" />
                        To
                    </Label>
                    <ButtonGroup orientation="vertical">
                        <Popover open={warehouseDestinationPopoverOpen} onOpenChange={setWarehouseDestinationPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn('w-full justify-between', errors.location && 'text-muted-foreground border-red-500')}
                                >
                                    {selectedTransferLocations?.destination_warehouse?.name || 'Select Warehouse'}
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
                                        handleTransferChange({ name: 'destination_warehouse', value: item });
                                        setWarehouseDestinationPopoverOpen(false);
                                    }}
                                    placeholder="Search warehouse..."
                                    emptyText="No warehouse found"
                                    renderItem={(item) => <span>{item.name}</span>}
                                />
                            </PopoverContent>
                        </Popover>
                        <Popover open={locationDestinationPopoverOpen} onOpenChange={setLocationDestinationPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn('justify-between', errors.location && 'text-muted-foreground border-red-500')}
                                >
                                    {selectedTransferLocations?.destination_location?.name ?? 'Pilih lokasi tujuan'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                                <SelectCommand
                                    lists={filteredDestinationLocations}
                                    defaultValue={selectedTransferLocations?.destination_location?.id}
                                    onSelect={(value) => {
                                        handleTransferChange({ name: 'destination_location', value: value });
                                        setLocationDestinationPopoverOpen(false);
                                    }}
                                    getKey={(item) => item.id}
                                    getLabel={(item) => item.name}
                                />
                            </PopoverContent>
                        </Popover>
                    </ButtonGroup>
                </div>
            </div>

            <QuantityUnitInput data={data} setData={setData} units={filteredUnits} errors={errors} currentStock={currentStock} />
        </>
    );
}
