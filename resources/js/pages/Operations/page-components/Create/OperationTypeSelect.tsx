import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftToLine, ArrowRightFromLine, ArrowRightLeft } from 'lucide-react';
type OperationType = 'outbound' | 'inbound' | 'adjustment' | 'transfer' | 'return';
type OperationTypeItem = { value: string; label: string };

export default function OperationTypeSelect({
    operationTypes,
    selectedValue,
    toggleOperationType,
}: {
    operationTypes: OperationTypeItem[];
    selectedValue: string;
    toggleOperationType: (value: string) => void;
}) {
    const operationCardClassName =
        'hover:bg-accent hover:text-accent-foreground flex h-28 items-center justify-between rounded-md border p-6 shadow-md';

    return (
        <>
            <div className="md:hidden">
                <Label className="mb-4 block">Jenis Operasi</Label>
                <Select onValueChange={toggleOperationType} value={selectedValue}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih jenis operasi (In, Out, Transfer)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {operationTypes.map((type) => (
                                <SelectItem className="hover:bg-accent hover:text-accent-foreground" key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="hidden grid-cols-4 content-center items-center gap-6 md:grid">
                <div
                    className={selectedValue === 'outbound' ? `${operationCardClassName} bg-accent text-accent-foreground` : operationCardClassName}
                    onClick={() => toggleOperationType('outbound')}
                >
                    <p>Stock Out</p>
                    <ArrowRightFromLine className="h-4 w-4" />
                </div>
                <div
                    className={selectedValue === 'inbound' ? `${operationCardClassName} bg-accent text-accent-foreground` : operationCardClassName}
                    onClick={() => toggleOperationType('inbound')}
                >
                    <p>Stock In</p>
                    <ArrowLeftToLine className="h-4 w-4" />
                </div>
                <div
                    className={selectedValue === 'transfer' ? `${operationCardClassName} bg-accent text-accent-foreground` : operationCardClassName}
                    onClick={() => toggleOperationType('transfer')}
                >
                    <p>Transfer</p>
                    <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div
                    className={selectedValue === 'return' ? `${operationCardClassName} bg-accent text-accent-foreground` : operationCardClassName}
                    onClick={() => toggleOperationType('return')}
                >
                    <p>Return</p>
                    <ArrowLeftToLine className="h-4 w-4" />
                </div>
            </div>
        </>
    );
}
