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
        <div className="min-h-screen bg-background">
            <div className="flex">
                <SettingsSidebar
                    auth={auth}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    currentPath={currentPath}
                />

                <main className="min-w-0 flex-1">
                    <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                        <div className="mb-6 flex items-center gap-3">
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

                        <div className="mx-auto max-w-3xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
