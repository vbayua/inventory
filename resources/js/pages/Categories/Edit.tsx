import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';

type Category = {
    id?: number;
    name?: string;
}
type EditCategoryForm = {
    name?: string
}
export default function Edit({ category }: { category: Category }) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categories',
            href: '/category',
        },
        {
            title: `${category.name}`,
            href: `/categories/${category.id}`,
        },
        {
            title: 'Edit',
            href: `/categories/${category.id}/edit`,
        },
    ];
    const categoryName = useRef<HTMLInputElement>(null)
    const { data, setData, put, reset, processing, errors } = useForm<Required<EditCategoryForm>>({
        name: category.name ?? '',
    })

    const editCategory: FormEventHandler = (e) => {
        e.preventDefault()

        put(route('categories.update', { id: category.id }), {
            preserveScroll: true,
            onSuccess: () => {
                // reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    categoryName.current?.focus()
                }
            }
        })
    }
    // console.log(category)
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Category" />
            <form onSubmit={editCategory} className='space-y-6 mt-8 p-4'>
                <div className="grid gap-2">
                    <Label htmlFor='name'>Category Name</Label>

                    <Input
                        id='name'
                        ref={categoryName}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        name='name'
                        type='text'
                        className='mt-1 block w-full'
                        placeholder='Category Name'
                    />

                    <InputError message={errors.name} />
                </div>


                <div className="flex items-center gap-4">
                    <Button disabled={processing} type='submit'>Edit Category</Button>
                </div>
            </form>
        </AppLayout >
    );
}
