import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
    };

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error for debugging/monitoring
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen w-full flex-col items-center justify-center p-6">
                    <div className="bg-card max-w-lg rounded border p-6 shadow">
                        <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
                        <p className="text-muted-foreground mb-4 text-sm">
                            An unexpected error occurred while rendering this page. Try reloading. If the problem persists, contact support.
                        </p>
                        {process.env.NODE_ENV !== 'production' && this.state.error && (
                            <pre className="bg-muted max-h-48 overflow-auto rounded p-3 text-xs">
                                {this.state.error.toString()}
                                {this.state.errorInfo && '\n' + this.state.errorInfo.componentStack}
                            </pre>
                        )}
                        <button
                            type="button"
                            className="bg-primary text-primary-foreground mt-4 inline-flex items-center rounded px-3 py-2 text-sm"
                            onClick={() => {
                                // Attempt a soft recovery by resetting error state
                                this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
