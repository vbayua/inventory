import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, use, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContainerFormLayout from '@/components/container-form-layout';
import { PlusIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/units',
    },
    {
        title: 'Create New Unit',
        href: '/units/create',
    },
];
type CreateUnitForm = {
    name?: string,
    base_unit?: string,
    conversion_to_base?: number,
    unit_type?: 'item' | string // default to item, can be changed later
}

const unitTypes = [
    { value: 'item', label: 'Item' },
    { value: 'weight', label: 'Weight' },
    { value: 'volume', label: 'Volume' },
    { value: 'length', label: 'Length' },
]

export default function Create() {

    const unitName = useRef<HTMLInputElement>(null)
    const baseUnit = useRef<HTMLInputElement>(null)
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateUnitForm>>({
        name: '',
        base_unit: 'item', // default base unit
        conversion_to_base: 1,
        unit_type: "item", // default to item, can be changed later
    })

    const createUnit: FormEventHandler = (e) => {
        e.preventDefault()
        console.log('Creating unit with data:', data);
        post(route('units.store'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Unit created successfully');
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name', 'base_unit', 'conversion_to_base', 'unit_type')
                    unitName.current?.focus()
                }
            }
        })
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Unit" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Create New Unit</h1>
                        <p className="text-sm text-muted-foreground mb-6">Create a new unit of measurement to manage your inventory effectively.</p>
                    </div>
                    <div>
                        <Link className={buttonVariants({ variant: 'secondary' })} href={`/units`}>
                            Back to Units
                        </Link>
                    </div>
                </div>
                <form onSubmit={createUnit} className='space-y-6'>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Unit Name</Label>
                        <Input
                            id='name'
                            ref={unitName}
                            value={data.name}
                            onChange={(e) => setData('name', String(e.target.value))}
                            className='mt-1 block w-full'
                            placeholder='Unit Name'
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor='unit_type'>Unit Type</Label>
                        <Select
                            onValueChange={(value) => setData('unit_type', String(value))}
                            value={String(data.unit_type)}
                            defaultValue={String(data.unit_type)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Unit Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" disabled>Select Unit Type</SelectItem>
                                {unitTypes.map((unit) => (
                                    <SelectItem key={unit.value} value={String(unit.value)}>
                                        {unit.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.unit_type} />
                    </div>
                    {String(data.unit_type) !== 'item' && (
                        <div className="grid gap-2">
                            <Label htmlFor='name'>Base Unit</Label>
                            <Input
                                id='base_unit'
                                ref={baseUnit}
                                value={data.base_unit}
                                onChange={(e) => setData('base_unit', String(e.target.value))}
                                className='mt-1 block w-full'
                                placeholder='Base Unit (e.g. kg, g)'
                            />
                            <InputError message={errors.name} />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor='conversion_to_base'>Conversion to Base Unit</Label>
                        <Input
                            id='conversion_to_base'
                            type='number'
                            value={data.conversion_to_base}
                            onChange={(e) => setData('conversion_to_base', parseFloat(e.target.value))}
                            className='mt-1 block w-full'
                            placeholder='Conversion Factor (e.g. 1000 for grams to kilograms)'
                            min={0} // Ensure non-negative conversion factor
                            step="any" // Allow decimal values
                        />
                        <InputError message={errors.conversion_to_base} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Unit</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
