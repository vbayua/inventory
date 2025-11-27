import { NavFooter } from '@/components/nav-footer';
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
} from '@/components/ui/sidebar';
import { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Box, Boxes, Building, Building2, ChartBar, CheckCheck, ChevronRight, Cog, Folder, MapPin } from 'lucide-react';
import AppLogo from './app-logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Icon } from './ui/icon';

const productNavItems: NavItem[] = [
    {
        title: 'Product Master',
        href: '/products',
        icon: Box,
    },

    {
        title: 'Categories',
        href: '/categories',
        icon: Boxes,
    },
    {
        title: 'Unit',
        href: '/units',
        icon: Cog,
    },
    {
        title: 'Product Types',
        href: '/product-types',
        icon: Box,
    },
];

const warehouseNavItems: NavItem[] = [
    {
        title: 'Warehouse',
        href: '/warehouse',
        icon: Building2,
    },
    {
        title: 'Location',
        href: '/location',
        icon: MapPin,
    },
];

const stockNavItems: NavItem[] = [
    {
        title: 'Stock',
        href: '/stocks',
        icon: ChartBar,
    },
    {
        title: 'Batches',
        href: '/batches',
        icon: Boxes,
    },
    {
        title: 'Operations',
        href: '/operations',
        icon: Cog,
    },
    {
        title: 'Stock Adjustments',
        href: '/stock-adjustments',
        icon: CheckCheck,
    },
];

const supplierNavItem: NavItem[] = [
    {
        title: 'Partners / Companies',
        href: '/partners',
        icon: Building,
    },
    {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Building,
    },
];

const mainNavItems: NavItem[] = [
    {
        title: 'Products',
        href: '/products',
        icon: Box,
        items: productNavItems,
    },
    {
        title: 'Warehouse',
        href: '/warehouse',
        icon: Building2,
        items: warehouseNavItems,
    },
    {
        title: 'Stock',
        href: '/stocks',
        icon: ChartBar,
        items: stockNavItems,
    },
    {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Building,
        items: supplierNavItem,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage();
    const url = page.url.search(/\?.*$/) ? page.url.replace(/\?.*$/, '') : page.url;
    return (
        <Sidebar collapsible="offcanvas" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {mainNavItems
                    .filter((item) => !item.items || item.items.length === 0)
                    .map((item) => (
                        <SidebarMenu key={item.title}>
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
                {/*Collapsible SidebarGroup for each parent*/}
                {mainNavItems.map(
                    (item) =>
                        item.items !== undefined && (
                            <Collapsible
                                key={item.title}
                                title={item.title}
                                className="group/collapsible"
                                defaultOpen={item.items.some((subItem) => subItem.href === url)}
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
                                                        <SidebarMenuButton asChild isActive={item.href === page.url}>
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
