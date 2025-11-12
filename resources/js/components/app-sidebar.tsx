import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavItem, type MainNavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Boxes, Building2, Folder, LayoutGrid, Box, Building, TruckIcon, Cog, ChartBar, MapPin, BuildingIcon, CheckCheck, FileCheck } from 'lucide-react';
import AppLogo from './app-logo';
import { NavMainSingle } from './nav-main-single';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },

];

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
        icon: Box
    }
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
]

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
    }
]

const supplierNavItem: NavItem[] = [
    {
        title: 'Partners / Companies',
        href: '/partners',
        icon: Building
    },
    {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Building
    },
    {
        title: 'Manufacturers',
        href: '/manufacturers',
        icon: Building
    }
]
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
    return (
        <Sidebar collapsible="icon" variant="inset">
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

            <SidebarContent>
                <NavMainSingle items={mainNavItems} group='Menu' />
                <NavMainSingle items={warehouseNavItems} group="Warehouse" />
                <NavMainSingle items={supplierNavItem} group='Supplier & Vendor' />
                <NavMainSingle items={productNavItems} group="Product" />
                <NavMainSingle items={stockNavItems} group='Stock' />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

