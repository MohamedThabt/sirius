import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { router } from '@inertiajs/react';
import {
    ChevronDownIcon,
    CreditCardIcon,
    FolderKanbanIcon,
    LockIcon,
    UserIcon,
} from 'lucide-react';

interface Props {
    auth: { user: User };
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    currentPath: string;
}

export default function SettingsSidebar({ auth, isSidebarCollapsed, currentPath }: Props) {
    const getInitials = useInitials();
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
            key: 'billing',
            icon: CreditCardIcon,
            label: 'Billing',
            href: '/settings/billing',
        },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 scrollbar-hide ${
                isSidebarCollapsed ? 'w-0 -translate-x-full lg:w-16 lg:translate-x-0' : 'w-64'
            }`}
        >
            <div className="flex h-full flex-col overflow-y-auto">
                {/* Logo */}
                <div className={`flex h-16 items-center border-b px-4 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    {!isSidebarCollapsed && (
                        <a href="/" className="flex items-center text-lg font-semibold text-foreground">
                            <AppLogo />
                        </a>
                    )}
                </div>

                {/* User Info */}
                {!isSidebarCollapsed && (
                    <div className="border-b p-4">
                        <div className="text-sm font-medium text-foreground">Settings</div>
                        <div className="mt-1 text-xs text-muted-foreground">Manage your account</div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => router.get(item.href)}
                            className={[
                                'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                currentPath === item.href
                                    ? 'bg-muted font-medium text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                isSidebarCollapsed ? 'justify-center' : '',
                            ].join(' ')}
                            title={item.label}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* User Menu */}
                <div className="border-t p-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground ${
                                    isSidebarCollapsed ? 'justify-center' : ''
                                }`}
                            >
                                <Avatar className="h-5 w-5 shrink-0">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="text-[10px] bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                {!isSidebarCollapsed && (
                                    <>
                                        <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                                            <span className="truncate text-xs font-medium text-foreground">{auth.user.name}</span>
                                            <span className="truncate text-[10px] text-muted-foreground">{auth.user.email}</span>
                                        </div>
                                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </aside>
    );
}
