import { Breadcrumbs } from '@/components/breadcrumbs';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import SettingsSidebar from '@/components/Settings/SettingsSidebar';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren, useState } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const breadcrumbs = [{ title: 'Settings', href: '/settings/profile' }];

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SettingsSidebar
                auth={auth}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                currentPath={currentPath}
            />

            <main className="flex w-full flex-1 flex-col transition-all duration-300">
                <div className="shrink-0 border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
}
