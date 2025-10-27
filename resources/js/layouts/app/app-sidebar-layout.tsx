import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Toaster } from '@/components/ui/sonner';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';
import { toast } from 'sonner';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string; } }
    const success = flash?.success?.trim()
    const error = flash?.error?.trim()

    useEffect(() => {
        if (success) {
            toast.success(success, { id: 'flash-success' })
        } else if (error) {
            toast.error(error, { id: 'flash-error' })
        }
    }, [success, error])
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <Toaster position={'bottom-right'} richColors closeButton />
        </AppShell>
    );
}
