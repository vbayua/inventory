import { useRef, useState } from 'react';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Minus, Plus } from 'lucide-react';

export default function AdjustOperation({ stock, isDialogOpen, setDialogOpen }: { stock: any, isDialogOpen?: boolean, setDialogOpen?: (open: boolean) => void }) {

    const { data, setData, post, processing, errors, reset } = useForm({
        adjustment_type: '',
        adjustment_quantity: 0,
        remarks: 'Adjusted via stock adjustment form',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('stock-adjustments.store', {
            stock_id: stock?.id,
            quantity: data.adjustment_quantity,
            unit: stock?.unit,
            adjustment_type: data.adjustment_type,
            remarks: data.remarks,
        }), {
            onSuccess: () => {
                reset();
                if (setDialogOpen) {
                    setDialogOpen(false);
                }
            },
            onError: (errors) => {
                console.log(errors)
            }
        });
    }
    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="current_quantity">Current Quantity</FieldLabel>
                        <Input
                            type="text"
                            id="current_quantity"
                            name="current_quantity"
                            value={`${stock?.quantity} ${stock?.unit}`}
                            disabled
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor='adjustment_type'>Adjustment Type</FieldLabel>
                        <Select required onValueChange={(value) => setData('adjustment_type', value)}>
                            <SelectTrigger id='adjustment_type' name='adjustment_type' className="w-full">
                                <SelectValue placeholder="Select adjustment type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Adjustment Types</SelectLabel>
                                    <SelectItem value="addition">
                                        <Plus className="mr-2 inline h-4 w-4" />Increase
                                    </SelectItem>
                                    <SelectItem value="subtraction">
                                        <Minus className="mr-2 inline h-4 w-4" />Decrease
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="adjustment_quantity">Adjustment Quantity</FieldLabel>
                        <Input
                            type="number"
                            id="adjustment_quantity"
                            name="adjustment_quantity"
                            onChange={(e) => setData('adjustment_quantity', e.target.valueAsNumber)}
                            defaultValue={0}
                            min={0}
                            required
                            autoFocus
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="remarks">Remarks</FieldLabel>
                        <Input
                            type="text"
                            id="remarks"
                            name="remarks"
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Optional remarks about the adjustment"
                        />
                    </Field>
                </FieldGroup>
                <Button variant={'default'} className={'w-full'}>
                    Adjust Stock
                </Button>
            </form>
        </div>
    )
}
