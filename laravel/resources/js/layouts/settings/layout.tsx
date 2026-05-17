import { Breadcrumbs } from '@/components/breadcrumbs';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
                <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
                    <div className="flex w-full items-center gap-3">
                        <SidebarTrigger className="-ml-1 shrink-0 rounded-lg transition-colors duration-200 hover:bg-primary/5" />
                        <div className="flex-1 overflow-hidden">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
