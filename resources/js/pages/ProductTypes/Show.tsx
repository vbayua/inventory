import ContainerLayout from '@/components/container-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SelectCommand from '@/components/ui/select-command';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Location, ProductType } from '@/types/resources';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, PenIcon } from 'lucide-react';
import { MouseEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Types',
        href: '/product-types',
    },
    {
        title: 'Details',
        href: ``,
    },
];
export default function Show({ productType, locations }: { productType: ProductType; locations: Location[] }) {
    breadcrumbs[1].title = productType.name;
    breadcrumbs[1].href = `/product-types/${productType.id}`;

    const [isEditing, setIsEditing] = useState(false);
    const [productTypeData, setProductTypeData] = useState({
        id: productType.id,
        name: productType.name,
        type_code: productType.type_code,
        batch_interval_days: productType.batch_interval_days ?? '',
        default_location_id: productType.default_location_id ?? '',
        description: productType.description ?? '',
    });

    const handleProductTypeDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductTypeData({ ...productTypeData, [e.target.id]: e.target.value });
    };

    const handleSaveSettings: MouseEventHandler = (e) => {
        e.preventDefault();
        console.log(productTypeData);
        router.patch(route('product-types.update-settings', productType.id), productTypeData, {
            onSuccess: () => {
                setIsEditing(false);
                console.log('Product Type Settings is updated');
            },
            onError: (error) => {
                console.error('Error updating product type settings', error);
            },
        });
    };

    const [locationPopover, setLocationPopover] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Type Details" />
            <ContainerLayout>
                <div className="space-y-6">
                    {/* Back */}
                    <div>
                        <Button variant="link" asChild className="px-0">
                            <Link href={route('product-types.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Product Type Index
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-col justify-between md:flex-row md:items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">{productType.name}</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Settings
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="ml-auto">
                                    {isEditing ? <span>Cancel</span> : <PenIcon className="h-4 w-4" />}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="batch_interval_days">Batch Interval Days</Label>

                                    <Input
                                        id="batch_interval_days"
                                        type="text"
                                        value={productTypeData.batch_interval_days ?? ''}
                                        onChange={handleProductTypeDataChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description" className="block text-sm font-medium">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={productTypeData.description ?? ''}
                                        onChange={handleProductTypeDataChange}
                                        className="mt-1 w-full"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="default_location_id">Default Location</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="default_location_id"
                                            type="text"
                                            value={
                                                productTypeData.default_location_id
                                                    ? locations.find((l) => l.id === productTypeData.default_location_id)?.name
                                                    : 'No Location Selected'
                                            }
                                            onChange={handleProductTypeDataChange}
                                            className="mt-1 w-full"
                                            disabled={!isEditing}
                                        />
                                        {isEditing && (
                                            <Popover open={locationPopover} onOpenChange={setLocationPopover}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        {productTypeData.default_location_id ? 'Change Location' : 'Select Location'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start">
                                                    <SelectCommand
                                                        lists={locations}
                                                        getId={(l) => l.id}
                                                        getLabel={(l) => l.name}
                                                        placeholder="Select Location"
                                                        onSelect={(l) => {
                                                            setProductTypeData({ ...productTypeData, default_location_id: l.id });
                                                            setLocationPopover(false);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                </div>
                                {isEditing && (
                                    <Button type="submit" variant="default" size="sm" onClick={handleSaveSettings}>
                                        Save Settings
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
