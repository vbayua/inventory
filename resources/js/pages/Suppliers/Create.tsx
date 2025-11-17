import ContainerFormLayout from '@/components/container-form-layout';
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

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
    partner_id?: string;
    notes?: string;
};
type Partner = { id: number; name: string };
export default function Create() {
    const { props } = usePage<{ partners?: Partner[] }>();
    const partners = props.partners;

    const notes = useRef<HTMLTextAreaElement>(null);
    const { data, setData, post, reset, processing, errors } = useForm<Required<CreateSupplierForm>>({
        partner_id: '',
        notes: '',
    });

    const [partnersPopoverOpen, setPartnersPopoverOpen] = useState(false);

    const selectedPartner = partners?.find((partner) => partner.id.toString() === data.partner_id);

    useEffect(() => {
        if (partnersPopoverOpen && !partners) {
            router.reload({ only: ['partners'] });
        }
    }, [partnersPopoverOpen, partners]);
    const createSupplier: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('supplier.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.partner_id) {
                    reset('partner_id');
                }
                console.log(errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Supplier" />
            <ContainerFormLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h1 className="text2xl mb-4 font-bold">Add New Supplier</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Add a new supplier from a list of partners</p>
                    </div>
                    <div className="">
                        <Link className={buttonVariants({ variant: 'secondary' })} href={route('supplier.index')}>
                            Back to index
                        </Link>
                    </div>
                </div>
                <form onSubmit={createSupplier} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="partner_id">Supplier</Label>
                        <Popover open={partnersPopoverOpen} onOpenChange={(open) => setPartnersPopoverOpen(open)}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {selectedPartner ? selectedPartner.name : 'Select Partner'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search supplier..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            {!partners && <div className="text-muted-foreground p-2 text-sm">Loading...</div>}
                                            <div>No Partner is found.</div>
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
                                                            setData('partner_id', partner.id.toString());
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
                        <InputError message={errors.partner_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>

                        <Textarea
                            id="notes"
                            ref={notes}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="resize-none p-4"
                            placeholder="Enter Notes"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Supplier</Button>
                    </div>
                </form>
            </ContainerFormLayout>
        </AppLayout>
    );
}
