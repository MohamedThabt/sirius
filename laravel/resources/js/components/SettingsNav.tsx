import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
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
    {
        key: 'projects',
        icon: FolderKanbanIcon,
        label: 'Projects',
        href: '/projects',
    },
    {
        key: 'profile',
        icon: UserIcon,
        label: 'Profile',
        href: '/settings/profile',
    },
    {
        key: 'password',
        icon: LockIcon,
        label: 'Password',
        href: '/settings/password',
    },
    {
        key: 'usage',
        icon: ActivityIcon,
        label: 'Usage',
        href: '/settings/usage',
    },
];

export function SettingsNav({ currentPath }: SettingsNavProps) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {settingsNavItems.map((item) => (
                        <SidebarMenuItem key={item.key}>
                            <SidebarMenuButton
                                asChild
                                isActive={currentPath === item.href}
                                tooltip={item.label}
                            >
                                <Link href={item.href} prefetch>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
