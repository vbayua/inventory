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
import { useState } from 'react';

const productNavItems: NavItem[] = [
    {
        title: 'Product Master',
        href: '/products',
        icon: Box,
        uri: 'product',
    },

    {
        title: 'Kategori Produk',
        href: '/categories',
        icon: Boxes,
        uri: 'category',
    },
    {
        title: 'Data Unit',
        href: '/units',
        icon: Cog,
        uri: 'unit',
    },
    {
        title: 'Jenis Produk',
        href: '/product-types',
        icon: Box,
        uri: 'productType',
    },
];

const warehouseNavItems: NavItem[] = [
    {
        title: 'Gudang',
        href: '/warehouse',
        icon: Building2,
        uri: 'warehouse',
    },
    {
        title: 'Lokasi',
        href: '/location',
        icon: MapPin,
        uri: 'location',
    },
];

const stockNavItems: NavItem[] = [
    {
        title: 'Stock List',
        href: '/stocks',
        icon: ChartBar,
        uri: 'stock',
    },
    {
        title: 'Batch',
        href: '/batches',
        icon: Boxes,
    },
    {
        title: 'Operasi Stock',
        href: '/operations',
        icon: Cog,
        uri: 'operation',
    },
    {
        title: 'Adjustment Stock',
        href: '/stock-adjustments',
        icon: CheckCheck,
        uri: 'adjustment',
    },
];

const supplierNavItem: NavItem[] = [
    {
        title: 'Mitra / Perusahaan',
        href: '/partners',
        icon: Building,
        uri: 'partner',
    },
    {
        title: 'Approved Supplier List',
        href: '/suppliers',
        icon: Building,
        uri: 'supplier',
    },
];

const qcNavItems: NavItem[] = [
    {
        title: 'QC Inspections',
        href: '/qc/inspections',
        icon: ClipboardCheck,
        uri: 'qc_inspection',
    },
    {
        title: 'QC Checklists',
        href: '/qc/checklists',
        icon: ClipboardList,
        uri: 'qc_checklist',
    },
];

const purchaseOrderNavItems: NavItem[] = [
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
        icon: Box,
        uri: 'purchase_orders',
    },
    {
        title: 'Receive Orders',
        href: '/receive-orders',
        icon: Box,
        uri: 'receive_orders',
    },
];

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: ChartBar,
        uri: 'dashboard',
    },
    {
        title: 'Data Produk',
        href: '/products',
        icon: Box,
        items: productNavItems,
        uri: 'product',
    },
    {
        title: 'Data Gudang',
        href: '/warehouse',
        icon: Building2,
        items: warehouseNavItems,
        uri: 'warehouse',
    },
    {
        title: 'Data Stock',
        href: '/stocks',
        icon: ChartBar,
        items: stockNavItems,
        uri: 'stock',
    },
    {
        title: 'Data Supplier',
        href: '/suppliers',
        icon: Building,
        items: supplierNavItem,
        uri: 'supplier',
    },
    {
        title: 'Purchasing',
        href: '/purchase-orders',
        icon: Box,
        items: purchaseOrderNavItems,
        uri: 'purchase-orders',
    },
    {
        title: 'Quality Control',
        href: '/qc/inspections',
        icon: ShieldCheck,
        items: qcNavItems,
        uri: 'qc',
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { state } = useSidebar();
    const viewPermissions: Record<string, boolean> = page.props.auth?.viewPermissions ?? {};
    const permissions = Object.keys(viewPermissions).filter((key) => viewPermissions[key] === true);
    // const cleanUrl = page.url.startsWith('/') ? page.url.slice(1) : page.url;
    console.log(permissions);
    const filteredNavItems = mainNavItems.filter(
        (item) => !item.items || item.items.length === 0 || item.items.some((subItem) => !subItem.uri || permissions.includes(subItem.uri)),
    );

    const subItemIsActive = (item: NavItem[]): boolean => {
        return item.some((subItem) => page.url.includes(subItem.href))
    };
    return (
        <Sidebar collapsible="offcanvas" variant="inset" className="w-64 shrink-0">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex w-full items-center align-middle">
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                        {state === 'expanded' && <SidebarTrigger className="ml-auto" />}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {mainNavItems.map((item) => (
                    <SidebarMenu key={item.title} className="">
                        {item.items && item.items.length > 0 && (
                            <Collapsible
                                key={item.title.toLowerCase().replace(' ', '-')}
                                title={item.title}
                                className="group/collapsible"
                                defaultOpen={subItemIsActive(item.items!)}
                            >
                                <SidebarGroup className="px-0">
                                <SidebarGroupLabel asChild className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                    <CollapsibleTrigger>
                                        <div className="flex items-center text-sm">
                                            <span className="flex-auto">{item.icon && <Icon iconNode={item.icon} className="mr-3 h-4 w-4" />}</span>
                                            {item.title}
                                        </div>
                                        <ChevronDown className="ml-auto transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                    <CollapsibleContent>
                                        <SidebarGroupContent className="mt-2 space-y-2 ml-4 border-l-3 bg-gray-100">
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuItem
                                                key={subItem.title.toLowerCase().replace(' ', '-')}
                                                className="px-4"
                                            >
                                                <SidebarMenuButton asChild isActive={subItemIsActive([subItem])}>
                                                    <div className="flex items-center text-sm">
                                                        <Link href={subItem.href} className='flex-auto'>
                                                            {subItem.title}
                                                        </Link>
                                                    </div>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                        </SidebarGroupContent>

                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        )}

                        {item.items === undefined && <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={item.isActive}>
                                <Link href={item.href}>{item.title}</Link>
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
