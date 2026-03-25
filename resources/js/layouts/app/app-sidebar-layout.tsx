import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden rounded-2xl border border-white/20 bg-white/60 shadow-2xl backdrop-blur-lg m-4">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="p-6">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
