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
        permission: 'product',
    },

    {
        title: 'Kategori Produk',
        href: 'categories.index',
        icon: Boxes,
        uri: 'categories',
        permission: 'category',
    },
    {
        title: 'Data Unit',
        href: 'units.index',
        icon: Cog,
        uri: 'units',
        permission: 'unit',
    },
    {
        title: 'Jenis Produk',
        href: 'product-types.index',
        icon: Box,
        uri: 'product-types',
        permission: 'productType',
    },
];

const warehouseNavItems: NavItem[] = [
    {
        title: 'Gudang',
        href: 'warehouse.index',
        icon: Building2,
        uri: 'warehouse',
        permission: 'warehouse',
    },
    {
        title: 'Lokasi',
        href: 'location.index',
        icon: MapPin,
        uri: 'location',
        permission: 'location',
    },
];

const stockNavItems: NavItem[] = [
    {
        title: 'Stock List',
        href: 'stocks.index',
        icon: ChartBar,
        uri: 'stocks',
        permission: 'stock',
    },
    {
        title: 'Batch',
        href: 'batch.index',
        icon: Boxes,
        uri: 'batches',
        permission: 'batch',
    },
    {
        title: 'Operasi Stock',
        href: 'operations.index',
        icon: Cog,
        uri: 'operations',
        permission: 'operation',
    },
    {
        title: 'Adjustment Stock',
        href: 'stock-adjustments.index',
        icon: CheckCheck,
        uri: 'stock-adjustments',
        permission: 'adjustment',
    },
];

const supplierNavItem: NavItem[] = [
    {
        title: 'Mitra / Perusahaan',
        href: 'partners.index',
        icon: Building,
        uri: 'partners',
        permission: 'partner',
    },
    {
        title: 'Approved Supplier List',
        href: 'supplier.index',
        icon: Building,
        uri: 'suppliers',
        permission: 'supplier',
    },
];

const qcNavItems: NavItem[] = [
    {
        title: 'QC Inspections',
        href: 'qc.inspections.index',
        icon: ClipboardCheck,
        uri: 'qc/inspections',
        permission: 'qc_inspection',
    },
    {
        title: 'QC Checklists',
        href: 'qc.checklists.index',
        icon: ClipboardList,
        uri: 'qc/checklists',
        permission: 'qc_checklist',
    },
];

const purchaseOrderNavItems: NavItem[] = [
    {
        title: 'Purchase Orders',
        href: 'purchase-orders.index',
        icon: Box,
        uri: 'purchase-orders',
        permission: 'purchase_order',
    },
    {
        title: 'Receive Orders',
        href: 'receive-orders.index',
        icon: Box,
        uri: 'receive-orders',
        permission: 'receive_order',
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
    const viewPermissions = page.props.auth?.viewPermissions ?? {};
    const canView = (permission?: string): boolean => {
        return permission == undefined || viewPermissions[permission] === true;
    }
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
                {mainNavItems.map((item) => {
                    const visibleSubItems = item.items?.filter((subItem) =>
                           canView(subItem.permission),
                       );
                    return(
                        <SidebarMenu key={item.uri} className="">
                            {visibleSubItems && visibleSubItems.length > 0 && (
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
                                            {visibleSubItems.map((subItem) => (
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

                            {item.items === undefined && canView(item.permission) &&  <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={item.isActive} >
                                    <Link href={route(item.href)} prefetch={false}>{item.title}</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>}
                        </SidebarMenu>
                    )
                })}
            </SidebarContent>

            <SidebarFooter>
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
