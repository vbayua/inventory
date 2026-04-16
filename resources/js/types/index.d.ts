import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    viewPermissions?: Record<string, boolean>;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: SubItems[];
    uri?: string | undefined;
}
export interface MainNavItem {
    title: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    subItems?: SubItems[];
}

export interface SubItems {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    uri?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    permissions: Permission;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Permission {
    viewAny: boolean;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    restore: boolean;
    forceDelete: boolean;
    isAdmin: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Product {
    id: number;
    name: string;
    brand_name?: string;
    scientific_name?: string;
    sku: string;
    unit: string;
    price: number;
    category_id?: number;
    supplier_id?: number;
    created_at: string;
    updated_at: string;
}

export interface ProductIndex {
    id: number;
    name: string;
    sku: string;
    unit: string;
    price: number;
    category: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}
