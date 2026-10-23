import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    useFlashToasts();
    const { sidebarOpen } = usePage<SharedData>().props;

    if (typeof window === 'undefined') {
        return null;
    }

    const breadcrumbs = [{ title: 'Settings', href: '/settings/profile' }];

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <AppSidebar />
            <SidebarInset>
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
