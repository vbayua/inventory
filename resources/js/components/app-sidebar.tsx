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

    const filteredNavItems = mainNavItems.filter(
        (item) => !item.items || item.items.length === 0 || item.items.some((subItem) => !subItem.uri || permissions.includes(subItem.uri)),
    );
    return (
        <Sidebar collapsible="offcanvas" variant="inset" className="w-64 flex-shrink-0">
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
                {mainNavItems
                    .filter((item) => !item.items || item.items?.length === 0)
                    .map((item) => (
                        <SidebarMenu key={item.title} className="p-2.5">
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={item.isActive}>
                                    <Link href={item.href}>
                                        {item.icon && <Icon iconNode={item.icon} className="mr-3 h-4 w-4" />}
                                        {item.title}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    ))}
                <Separator className="border-sidebar-border/50 my-2" />
                {/*Collapsible SidebarGroup for each parent*/}
                {filteredNavItems.map(
                    (item) =>
                        item.items !== undefined && (
                            <Collapsible
                                key={item.title}
                                title={item.title}
                                className="group/collapsible"
                                defaultOpen={item.items.some((subItem) => page.url.startsWith(subItem.href))}
                            >
                                <SidebarGroup>
                                    <SidebarGroupLabel
                                        asChild
                                        className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                                    >
                                        <CollapsibleTrigger>
                                            <span className="flex items-center">
                                                {item.icon && <Icon iconNode={item.icon} className="mr-3 h-4 w-4" />}
                                                {item.title}
                                            </span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                                        </CollapsibleTrigger>
                                    </SidebarGroupLabel>
                                    <CollapsibleContent className="mt-1">
                                        <SidebarGroupContent className="px-2 py-2">
                                            <SidebarMenu>
                                                {item.items?.map((item) => (
                                                    <SidebarMenuItem key={item.title}>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={item.href === page.url}
                                                            className={
                                                                page.url.startsWith(item.href)
                                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                                    : ''
                                                            }
                                                        >
                                                            <Link href={item.href}>{item.title}</Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        ),
                )}
            </SidebarContent>

            <SidebarFooter>
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
