import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import ContainerFormLayout from '@/components/container-form-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Create New Category',
        href: '/categories/create',
    },
];

type CreateCategoryForm = {
    name?: string,
}
export default function Create() {

    const categoriesName = useRef<HTMLInputElement>(null)
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateCategoryForm>>({
        name: '',
    })

    const createCategory: FormEventHandler = (e) => {
        e.preventDefault()

        post(route('categories.store'), {
            // forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    categoriesName.current?.focus()
                }
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Category" />
            <ContainerFormLayout>
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Create New Category</h1>
                        <p className="text-sm text-muted-foreground mb-6">Create a new category to organize your products.</p>
                    </div>

                    <Link href={route('categories.index')} className={buttonVariants({ variant: 'secondary' })}>
                        Back to Products
                    </Link>
                </div>
                <form onSubmit={createCategory} className='space-y-6'>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Category Name</Label>
                        <Input
                            id='name'
                            ref={categoriesName}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className='mt-1 block w-full'
                            placeholder='Category Name'
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Category</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}


