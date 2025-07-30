import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';


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
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Create New Category</h1>
                    <p className="text-sm text-muted-foreground mb-6">Create a new category to organize your products.</p>
                </div>
                <form onSubmit={createCategory} className='space-y-6 md:w-7xl'>
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
            </div>
        </AppLayout >
    );
}


