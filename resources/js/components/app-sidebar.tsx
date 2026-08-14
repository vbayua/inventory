import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Box,
    Boxes,
    Building,
    Building2,
    ChartBar,
    CheckCheck,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    ClipboardCheck,
    ClipboardList,
    Cog,
    MapPin,
    ShieldCheck,
} from 'lucide-react';
import AppLogo from './app-logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Icon } from './ui/icon';
import { Separator } from './ui/separator';
import { useRef, useState } from 'react';

const productNavItems: NavItem[] = [
    {
        title: 'Product Master',
        href: 'products.index',
        icon: Box,
        uri: 'products',
    },

    {
        title: 'Kategori Produk',
        href: 'categories.index',
        icon: Boxes,
        uri: 'categories',
    },
    {
        title: 'Data Unit',
        href: 'units.index',
        icon: Cog,
        uri: 'units',
    },
    {
        title: 'Jenis Produk',
        href: 'product-types.index',
        icon: Box,
        uri: 'product-types',
    },
];

const warehouseNavItems: NavItem[] = [
    {
        title: 'Gudang',
        href: 'warehouse.index',
        icon: Building2,
        uri: 'warehouse',
    },
    {
        title: 'Lokasi',
        href: 'location.index',
        icon: MapPin,
        uri: 'location',
    },
];

const stockNavItems: NavItem[] = [
    {
        title: 'Stock List',
        href: 'stocks.index',
        icon: ChartBar,
        uri: 'stocks',
    },
    {
        title: 'Batch',
        href: 'batch.index',
        icon: Boxes,
        uri: 'batches',
    },
    {
        title: 'Operasi Stock',
        href: 'operations.index',
        icon: Cog,
        uri: 'operations',
    },
    {
        title: 'Adjustment Stock',
        href: 'stock-adjustments.index',
        icon: CheckCheck,
        uri: 'stock-adjustments',
    },
];

const supplierNavItem: NavItem[] = [
    {
        title: 'Mitra / Perusahaan',
        href: 'partners.index',
        icon: Building,
        uri: 'partners',
    },
    {
        title: 'Approved Supplier List',
        href: 'supplier.index',
        icon: Building,
        uri: 'suppliers',
    },
];

const qcNavItems: NavItem[] = [
    {
        title: 'QC Inspections',
        href: 'qc.inspections.index',
        icon: ClipboardCheck,
        uri: 'qc/inspections',
    },
    {
        title: 'QC Checklists',
        href: 'qc.checklists.index',
        icon: ClipboardList,
        uri: 'qc/checklists',
    },
];

const purchaseOrderNavItems: NavItem[] = [
    {
        title: 'Purchase Orders',
        href: 'purchase-orders.index',
        icon: Box,
        uri: 'purchase-orders',
    },
    {
        title: 'Receive Orders',
        href: 'receive-orders.index',
        icon: Box,
        uri: 'receive-orders',
    },
];

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
        icon: ChartBar,
        uri: 'dashboard',
    },
    {
        title: 'Data Produk',
        href: 'products.index',
        icon: Box,
        items: productNavItems,
        uri: 'product',
    },
    {
        title: 'Data Gudang',
        href: 'warehouse.index',
        icon: Building2,
        items: warehouseNavItems,
        uri: 'warehouse',
    },
    {
        title: 'Data Stock',
        href: 'stocks.index',
        icon: ChartBar,
        items: stockNavItems,
        uri: 'stock',
    },
    {
        title: 'Data Supplier',
        href: 'suppliers.index',
        icon: Building,
        items: supplierNavItem,
        uri: 'supplier',
    },
    {
        title: 'Purchasing',
        href: 'purchase-orders.index',
        icon: Box,
        items: purchaseOrderNavItems,
        uri: 'purchase-orders',
    },
    {
        title: 'Quality Control',
        href: 'qc.inspections.index',
        icon: ShieldCheck,
        items: qcNavItems,
        uri: 'qc_inspection',
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { state } = useSidebar();
    const viewPermissions: Record<string, boolean> = page.props.auth?.viewPermissions ?? {};
    const permissions = Object.keys(viewPermissions).filter((key) => viewPermissions[key] === true);

    const subItemIsActive = (item: NavItem[]): boolean => {
        return item.some((subItem) => page.props.uri === subItem.uri)
    };

    return (
        <Sidebar collapsible="offcanvas" variant="inset" className="w-64 shrink-0">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex w-full items-center align-middle">
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                        {state === 'expanded' && <SidebarTrigger className="ml-auto" />}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0 pr-4">
                {mainNavItems.map((item) => (
                    <SidebarMenu key={item.uri} className="">
                        {item.items && item.items.length > 0 && (
                            <Collapsible
                                key={item.uri}
                                title={item.title}
                                className="group/collapsible"
                                defaultOpen={true}
                            >
                                <SidebarGroup className="px-0">
                                <SidebarGroupLabel asChild className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                    <CollapsibleTrigger>
                                        <div className="flex items-center font-bold">
                                            <span className="flex-auto">{item.icon && <Icon iconNode={item.icon} className="mr-2 w-4" />}</span>
                                            {item.title}
                                        </div>
                                        <ChevronUp className="ml-auto transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                    <CollapsibleContent>
                                        <SidebarGroupContent className="mt-2 space-y-2 ml-4 border-l-3">
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuItem
                                                key={subItem.uri}
                                                className="pr-4 pl-1.5"
                                            >
                                                <SidebarMenuButton asChild isActive={subItemIsActive([subItem])}>
                                                        <Link href={route(subItem.href)} className='flex-auto text-xs' prefetch={false}>
                                                            {subItem.title}
                                                        </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                        </SidebarGroupContent>

                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        )}

                        {item.items === undefined && <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={item.isActive} >
                                <Link href={route(item.href)} prefetch={false}>{item.title}</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>}
                    </SidebarMenu>
                ))}
            </SidebarContent>

            <SidebarFooter>
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
