import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import ContainerFormLayout from '@/components/container-form-layout';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supplier',
        href: '/suppliers',
    },
    {
        title: 'Add New Supplier',
        href: '/supplier/create',
    },
];
type CreateSupplierForm = {
    name: string;
    notes?: string;
}
type Partner = { id: number; name: string };
export default function Create() {
    const { props } = usePage<{ partners?: Partner[] }>();
    const partners = props.partners;

    const supplierName = useRef<HTMLInputElement>(null)
    const notes = useRef<HTMLTextAreaElement>(null);
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateSupplierForm>>({
        name: '',
        notes: '',
    })

    const [partnersPopoverOpen, setPartnersPopoverOpen] = useState(false);

    useEffect(() => {
        if (partnersPopoverOpen && !partners) {
            router.reload({ only: ['partners'] });
        }
    }, [partnersPopoverOpen, partners]);
    const createSupplier: FormEventHandler = (e) => {
        e.preventDefault()

        post(route('supplier.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset()
            },
            onError: (errors) => {
                if (errors.name) {
                    reset('name')
                    supplierName.current?.focus()
                }
                console.log(errors)
            }
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Supplier" />
            <ContainerFormLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="">
                        <h1 className="text2xl font-bold mb-4">Add New Supplier</h1>
                        <p className="text-sm text-muted-foreground mb-6">Add a new supplier from a list of partners</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={route('supplier.index')}>Back to index</Link>
                    </div>
                </div>
                <form onSubmit={createSupplier} className='space-y-6'>
                    <div className="grid gap-2">
                        <Label htmlFor='name'>Supplier</Label>
                        <Popover open={partnersPopoverOpen} onOpenChange={(open) => setPartnersPopoverOpen(open)}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {data.name ? data.name : 'Select partner'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align='start'>
                                <Command>
                                    <CommandInput placeholder="Search supplier..." />
                                    <CommandList>
                                        {!partners && (
                                            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                                        )}
                                        <CommandEmpty>
                                            <div>
                                                No Partner is found.
                                            </div>
                                            <Button variant={'link'} asChild>
                                                <Link href={route('partners.create')}>Create New Partner</Link>
                                            </Button>
                                        </CommandEmpty>
                                        {partners && (
                                            <CommandGroup>
                                                {partners.map((partner) => (
                                                    <CommandItem
                                                        key={partner.id}
                                                        onSelect={() => {
                                                            setData('name', partner.name);
                                                            setPartnersPopoverOpen(false);
                                                        }}
                                                    >
                                                        {partner.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor='notes'>Notes</Label>

                        <Textarea
                            id='notes'
                            ref={notes}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className='resize-none p-4'
                            placeholder='Enter Notes'
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Supplier</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout >
    );
}
