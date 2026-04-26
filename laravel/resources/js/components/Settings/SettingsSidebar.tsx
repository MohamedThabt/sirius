import AppLogo from '@/components/app-logo';
import { FeedbackModal } from '@/components/FeedbackWidget/FeedbackModal';
import { SidebarUsageBar } from '@/components/sidebar-usage-bar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { ActivityIcon, ChevronsUpDown, FolderKanbanIcon, LockIcon, MessageSquareText, UserIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    auth: { user: User };
    currentPath: string;
}

const navItems = [
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

export default function SettingsSidebar({ auth, currentPath }: Props) {
    const getInitials = useInitials();
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border/40 bg-gradient-to-b from-background to-muted/20">
            <SidebarHeader className="border-b border-border/40 px-2 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 hover:bg-primary/5"
                        >
                            <Link href="/projects" prefetch className="flex items-center gap-2">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
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

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Feedback</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Send Feedback" onClick={() => setFeedbackOpen(true)}>
                                    <MessageSquareText className="h-4 w-4" />
                                    <span>Send Feedback</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="mt-auto group-data-[collapsible=icon]:hidden">
                    <SidebarUsageBar />
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/40 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-sm text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{auth.user.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">{auth.user.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />

            <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </Sidebar>
    );
}
