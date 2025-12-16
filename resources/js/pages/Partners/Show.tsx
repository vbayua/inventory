import ContainerLayout from '@/components/container-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronsUpDown, ExternalLink, Mail, MapPin, Package, Phone, Plus, X } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { toast } from 'sonner';

type Product = {
    id: number;
    name?: string;
    sku?: string;
    unit?: string;
    categories?: {
        name?: string;
        slug?: string;
    };
    status?: string;
    pivot?: {
        price?: number;
    }
}

type ProductMin = {
    id: number;
    name?: string;
    sku?: string;
}

type Partner = {
    id: number;
    name?: string;
    phone_number?: string;
    email?: string;
    contact_person?: string;
    address?: string;
    notes?: string;
}

type ProductForm = {
    product_ids?: number[]
}

export default function Show({ partner }: {
    partner: Partner,
}) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Partners',
            href: '/partners',
        },
        {
            title: `${partner?.name}`,
            href: `/partners/${partner.id}`,
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${partner?.name}`} />
            <ContainerLayout>
                <div>
                    {/* <h2 className="text-3xl font-semibold mb-2.5">{supplier.name}</h2>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                    <div className="grid grid-cols-2 gap-4 mt-4"></div> */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle>
                                    <h2 className="text-3xl font-semibold mb-2.5">{partner?.name}</h2>
                                </CardTitle>
                                <Button size='sm' variant='outline' asChild>
                                    <Link href={route('partners.edit', { id: partner.id })}>
                                        Edit Partner
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <Mail className='h-5 w-5 text-primary mt-0.5' />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                                        <a href={partner.email ? `mailto:${partner.email}` : "#"} className="text-foreground hover:text-primary transition-colors">
                                            {partner.email ?? "-"}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className='h-5 w-5 text-primary mt-0.5' />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                                        <a href={partner.phone_number ? `tel:${partner.phone_number}` : "#"} className="text-foreground hover:text-primary transition-colors">
                                            {partner.phone_number ?? "-"}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className='h-5 w-5 text-primary mt-0.5' />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Address</p>
                                        <p className="text-foreground">
                                            {partner.address ?? "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
