import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Container, PlusIcon } from 'lucide-react';
import ContainerFormLayout from '@/components/container-form-layout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormEventHandler, useRef } from 'react';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface EditProductTypeForm {
    name?: string;
    description?: string;
    type_code?: string;
    has_scientific_name?: boolean;
    has_brand_name?: boolean;
}
export default function Edit({ productType }: { productType: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Product Types',
            href: '/product-types',
        },
        {
            title: productType.name,
            href: `/product-types/${productType.id}`,
        },
        {
            title: 'Edit Product Type',
            href: `/product-types/${productType.id}/edit`,
        }
    ];

    const productTypeName = useRef<HTMLInputElement>(null);
    const productTypeDescription = useRef<HTMLTextAreaElement>(null);
    const productTypeCode = useRef<HTMLInputElement>(null);
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditProductTypeForm>>({
        name: productType.name || '',
        description: productType.description || '',
        type_code: productType.type_code || '',
        has_scientific_name: false,
        has_brand_name: false,
    });

    const editProductType: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('product-types.update'), {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.name) {
                    toast.error(errors.name);
                    productTypeName.current?.focus();
                }
                if (errors.type_code) {
                    toast.error(errors.type_code);
                    productTypeCode.current?.focus();
                }
                if (errors.description) {
                    toast.error(errors.description);
                    productTypeDescription.current?.focus();
                }
            }
        })
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product Type" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Create Product Type</h1>
                        <p className="text-sm text-muted-foreground mb-6">Create a new product type. Fill in the details below.</p>
                    </div>
                    <Link className={buttonVariants({ variant: 'secondary' })} href={route('product-types.index')}>
                        Back to Product Types
                    </Link>
                </div>
                <form onSubmit={editProductType} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            Product Type Name
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            ref={productTypeName}
                            onChange={(e) => setData('name', e.target.value)}
                            name="name"
                            type="text"
                            placeholder="Enter product type name"
                            className='mt-1 block w-full'
                            autoFocus
                            required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type_code">
                            Type Code
                        </Label>
                        <Input
                            id="type_code"
                            value={data.type_code}
                            ref={productTypeCode}
                            onChange={(e) => setData('type_code', e.target.value)}
                            name="type_code"
                            type="text"
                            placeholder="eg. RMP for Raw Material Product"
                            className='mt-1 block w-full'
                            required />
                        <InputError message={errors.type_code} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            ref={productTypeDescription}
                            onChange={(e) => setData('description', e.target.value)}
                            name="description"
                            placeholder="Enter product type description"
                            className='mt-1 block w-full' />
                        <InputError message={errors.description} />
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="has_scientific_name"
                                name="has_scientific_name"
                                checked={data.has_scientific_name}
                                onCheckedChange={(checked) => setData('has_scientific_name', !!checked)}
                                className="mt-1"
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="has_scientific_name">Has Scientific Name</Label>
                                <p className="text-muted-foreground text-sm">
                                    Product types that require a scientific name will have this option enabled. This is useful for products that are categorized scientifically.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="has_brand_name"
                                name='has_brand_name'
                                checked={data.has_brand_name}
                                onCheckedChange={(checked) => setData('has_brand_name', !!checked)}
                                className="mt-1"
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="has_brand_name">Has Brand Name</Label>
                                <p className="text-muted-foreground text-sm">
                                    Product types that require a brand name will have this option enabled. This is useful for products that are branded.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button className='hover:cursor-pointer' disabled={processing}>Create Product Type</Button>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    )
}
