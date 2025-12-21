import { Breadcrumbs } from '@/components/breadcrumbs';
import SettingsSidebar from '@/components/Settings/SettingsSidebar';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { type PropsWithChildren, useState } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    const breadcrumbs = [
        { title: 'Settings', href: '/settings/profile' },
    ];

    return (
        <div className="flex h-screen w-full bg-background">
            <SettingsSidebar
                auth={auth}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                currentPath={currentPath}
            />

            <main className="min-w-0 flex-1 transition-all duration-300">
                <div className="flex h-full w-full flex-col overflow-hidden">
                    <div className="flex items-center gap-3 border-b bg-background px-4 py-4 sm:px-6 lg:px-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden h-8 w-8 p-0 lg:flex"
                            title={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                        </Button>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
