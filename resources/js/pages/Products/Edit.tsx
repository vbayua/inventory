import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Product } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
    {
        title: 'Edit Product',
        href: '/products',
    },
];

type EditProductForm = {
    name?: string
}
export default function Edit({ product }: { product: Product }) {
    const productName = useRef<HTMLInputElement>(null)

    const { data, setData, put, reset, processing, errors } = useForm<Required<EditProductForm>>({
        name: product.name,
    })

    const editProduct: FormEventHandler = (e) => {
        e.preventDefault()

        put(route('products.update', product.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    productName.current?.focus()
                }
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />
            <form onSubmit={editProduct} className='space-y-6 mt-8 p-4'>
                <div className="grid gap-2">
                    <Label htmlFor='name'>Product Name</Label>

                    <Input
                        id='name'
                        ref={productName}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className='mt-1 block w-full'
                    />

                    <InputError message={errors.name} />
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Edit Product</Button>
                </div>
            </form>
        </AppLayout>
    );
}
