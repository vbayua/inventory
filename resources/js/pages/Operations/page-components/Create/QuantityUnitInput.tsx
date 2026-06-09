import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SelectCommand from '@/components/ui/select-command';
import { cn } from '@/lib/utils';
import { Stock, Unit } from '@/types/resources';
import { ChevronsUpDown, HashIcon } from 'lucide-react';

export default function QuantityUnitInput({
    data,
    setData,
    units,
    currentStock,
    errors,
}: {
    data: any;
    setData: any;
    units: Unit[];
    currentStock: Stock;
    errors: any;
}) {
    // console.log(data);
    return (
        <div className={cn('grid grid-cols-2 gap-4 rounded-md border p-4', (errors.quantity || errors.unit) && 'border-red-500')}>
            <Label className="flex items-center gap-2">
                <HashIcon className="text-primary w-4" />
                Quantity
            </Label>
            <div className="justify-self-end">
                <ButtonGroup>
                    <Input
                        type="number"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                        className={cn(errors.quantity && 'text-muted-foreground border-red-500')}
                        placeholder="Enter quantity"
                        min={1}
                        step={0.01}
                        disabled={!data.batch}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn('justify-between', errors.unit && 'text-muted-foreground border-red-500')}
                                disabled={!data.batch}
                                size={'sm'}
                            >
                                {currentStock.unit ? currentStock.unit : 'Pilih unit'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                            <SelectCommand
                                lists={units}
                                defaultValue={currentStock.unit ? units.find((unit) => unit.name === currentStock.unit) : undefined}
                                getKey={(item) => item.name}
                                getId={(item) => item.name}
                                getLabel={(item) => item.name}
                                onSelect={(item) => {
                                    setData('unit', item.name);
                                }}
                                placeholder="Pilih unit"
                                renderItem={(item) => <span>{item.name}</span>}
                            />
                        </PopoverContent>
                    </Popover>
                </ButtonGroup>
            </div>
            {currentStock && (
                <p className="text-muted-foreground mt-1 text-sm">
                    {currentStock && `In stock: ${Number(currentStock.quantity)} ${currentStock.unit}`}
                </p>
            )}
        </div>
    );
}
