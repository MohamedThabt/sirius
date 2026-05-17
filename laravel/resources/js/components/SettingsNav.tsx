import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ActivityIcon, FolderKanbanIcon, LockIcon, UserIcon } from 'lucide-react';
import { ComponentType } from 'react';

interface SettingsNavItem {
    key: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
    href: string;
}

interface SettingsNavProps {
    currentPath: string;
}

const settingsNavItems: SettingsNavItem[] = [
    { key: 'projects', icon: FolderKanbanIcon, label: 'Projects', href: '/projects' },
    { key: 'profile', icon: UserIcon, label: 'Profile', href: '/settings/profile' },
    { key: 'password', icon: LockIcon, label: 'Password', href: '/settings/password' },
    { key: 'usage', icon: ActivityIcon, label: 'Usage', href: '/settings/usage' },
];

export function SettingsNav({ currentPath }: SettingsNavProps) {
    return (
        <SidebarGroup className="py-2">
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/50">
                Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    {settingsNavItems.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                            <SidebarMenuItem key={item.key}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.label}
                                    className={cn(
                                        'h-9 rounded-lg font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                                    )}
                                >
                                    <Link href={item.href} prefetch>
                                        <item.icon className="mr-2 h-4 w-4 opacity-70" />
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
