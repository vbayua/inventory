import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ProductType } from '@/types/resources';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, PlusIcon, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quality Control', href: '/qc/checklists' },
    { title: 'Checklists', href: '/qc/checklists' },
    { title: 'Create', href: '/qc/checklists/create' },
];

interface ChecklistItemForm {
    item_name: string;
    description: string;
    is_required: boolean;
}

interface FormData {
    name: string;
    description: string;
    product_type_id: string;
    is_active: boolean;
    items: ChecklistItemForm[];
}

export default function Create({ productTypes }: { productTypes: ProductType[] }) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        description: '',
        product_type_id: '',
        is_active: true,
        items: [],
    });

    const addItem = () => {
        setData('items', [...data.items, { item_name: '', description: '', is_required: true }]);
    };

    const removeItem = (index: number) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const updateItem = (index: number, field: keyof ChecklistItemForm, value: string | boolean) => {
        const updated = data.items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        setData('items', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('qc.checklists.store'));
    };

    const getItemError = (index: number, field: string): string | undefined => {
        const key = `items.${index}.${field}` as keyof typeof errors;
        return errors[key] as string | undefined;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create QC Checklist" />
            <ContainerLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Button variant="link" asChild className="px-0">
                            <Link href={route('qc.checklists.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Checklists
                            </Link>
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Checklist Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <Label htmlFor="name">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Standard Incoming QC"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div className="space-y-1">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Optional description..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>

                                {/* Product Type */}
                                <div className="space-y-1">
                                    <Label htmlFor="product_type_id">Product Type</Label>
                                    <Select
                                        value={data.product_type_id}
                                        onValueChange={(val) => setData('product_type_id', val === '__all__' ? '' : val)}
                                    >
                                        <SelectTrigger id="product_type_id">
                                            <SelectValue placeholder="All Products" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">All Products</SelectItem>
                                            {productTypes.map((pt) => (
                                                <SelectItem key={pt.id} value={String(pt.id)}>
                                                    {pt.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.product_type_id && <p className="text-sm text-red-500">{errors.product_type_id}</p>}
                                </div>

                                {/* Is Active */}
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Active (checklist can be used in inspections)
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Checklist Items */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Checklist Items</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.items.length === 0 ? (
                                    <p className="text-muted-foreground py-6 text-center text-sm">
                                        No items yet. Click "Add Item" to add checklist items.
                                    </p>
                                ) : (
                                    data.items.map((item, index) => (
                                        <div key={index} className="bg-muted/30 rounded-lg border p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-medium">Item {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {/* Item Name */}
                                                <div className="space-y-1">
                                                    <Label>
                                                        Item Name <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={item.item_name}
                                                        onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                                        placeholder="e.g. Visual Inspection"
                                                    />
                                                    {getItemError(index, 'item_name') && (
                                                        <p className="text-sm text-red-500">{getItemError(index, 'item_name')}</p>
                                                    )}
                                                </div>

                                                {/* Item Description */}
                                                <div className="space-y-1">
                                                    <Label>Description</Label>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Optional detail..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Is Required */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <Checkbox
                                                    id={`item_required_${index}`}
                                                    checked={item.is_required}
                                                    onCheckedChange={(checked) => updateItem(index, 'is_required', !!checked)}
                                                />
                                                <Label htmlFor={`item_required_${index}`} className="cursor-pointer text-sm">
                                                    Required item
                                                </Label>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pb-6">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('qc.checklists.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Create Checklist'}
                            </Button>
                        </div>
                    </form>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
