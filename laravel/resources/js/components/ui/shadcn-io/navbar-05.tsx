'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { BellIcon, ChevronDownIcon, HelpCircleIcon, Moon, Sun } from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
    return (
        <svg width="1em" height="1em" viewBox="0 0 324 323" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect
                x="88.1023"
                y="144.792"
                width="151.802"
                height="36.5788"
                rx="18.2894"
                transform="rotate(-38.5799 88.1023 144.792)"
                fill="currentColor"
            />
            <rect
                x="85.3459"
                y="244.537"
                width="151.802"
                height="36.5788"
                rx="18.2894"
                transform="rotate(-38.5799 85.3459 244.537)"
                fill="currentColor"
            />
        </svg>
    );
};

// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
    <svg
        className={cn('pointer-events-none', className)}
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M4 12L20 12"
            className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
        />
        <path d="M4 12H20" className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45" />
        <path
            d="M4 12H20"
            className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
        />
    </svg>
);

// Info Menu Component
const InfoMenu = ({ onItemClick }: { onItemClick?: (item: string) => void }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <HelpCircleIcon className="h-4 w-4" />
                <span className="sr-only">Help and Information</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onItemClick?.('help')}>Help Center</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemClick?.('documentation')}>Documentation</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemClick?.('contact')}>Contact Support</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemClick?.('feedback')}>Send Feedback</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

// Notification Menu Component
const NotificationMenu = ({ notificationCount = 3, onItemClick }: { notificationCount?: number; onItemClick?: (item: string) => void }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <BellIcon className="h-4 w-4" />
                {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                )}
                <span className="sr-only">Notifications</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onItemClick?.('notification1')}>
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">New message received</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemClick?.('notification2')}>
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">System update available</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onItemClick?.('notification3')}>
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Weekly report ready</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onItemClick?.('view-all')}>View all notifications</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

// Theme Toggle Component
const ThemeToggle = ({ onToggle }: { onToggle?: () => void }) => {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        // Simple toggle between light and dark (no system mode in toggle)
        const isDarkMode = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const nextAppearance = isDarkMode ? 'light' : 'dark';
        updateAppearance(nextAppearance);
        onToggle?.();
    };

    const getIcon = () => {
        // Show icon based on current effective theme (considering system preference)
        const isDarkMode = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        return isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
    };

    return (
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            {getIcon()}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};

// User Menu Component
const UserMenu = ({
    userName = 'John Doe',
    userEmail = 'john@example.com',
    userAvatar,
    onItemClick,
}: {
    userName?: string;
    userEmail?: string;
    userAvatar?: string | null;
    onItemClick?: (item: string) => void;
}) => {
    // Generate initials from user name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground">
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={userAvatar || undefined} alt={userName} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <ChevronDownIcon className="ml-1 h-3 w-3" />
                    <span className="sr-only">User menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={userAvatar || undefined} alt={userName} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{getInitials(userName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm leading-none font-medium">{userName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onItemClick?.('settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onItemClick?.('logout')}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Types
export interface Navbar05NavItem {
    href?: string;
    label: string;
}

export interface Navbar05Props extends React.HTMLAttributes<HTMLElement> {
    logo?: React.ReactNode;
    logoHref?: string;
    navigationLinks?: Navbar05NavItem[];
    userName?: string;
    userEmail?: string;
    userAvatar?: string | null;
    notificationCount?: number;
    onNavItemClick?: (href: string) => void;
    onInfoItemClick?: (item: string) => void;
    onNotificationItemClick?: (item: string) => void;
    onUserItemClick?: (item: string) => void;
    onThemeToggle?: () => void;
}

// Default navigation links
const defaultNavigationLinks: Navbar05NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
];

export const Navbar05 = React.forwardRef<HTMLElement, Navbar05Props>(
    (
        {
            className,
            logo = <Logo />,
            logoHref = '/',
            navigationLinks = defaultNavigationLinks,
            userName = 'User',
            userEmail = 'user@example.com',
            userAvatar,
            notificationCount = 0,
            onNavItemClick,
            onInfoItemClick,
            onNotificationItemClick,
            onUserItemClick,
            onThemeToggle,
            ...props
        },
        ref,
    ) => {
        const [isMobile, setIsMobile] = useState(false);
        const containerRef = useRef<HTMLElement>(null);

        useEffect(() => {
            const checkWidth = () => {
                if (containerRef.current) {
                    const width = containerRef.current.offsetWidth;
                    setIsMobile(width < 768); // 768px is md breakpoint
                }
            };

            checkWidth();

            const resizeObserver = new ResizeObserver(checkWidth);
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            return () => {
                resizeObserver.disconnect();
            };
        }, []);

        // Combine refs
        const combinedRef = React.useCallback(
            (node: HTMLElement | null) => {
                containerRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            [ref],
        );

        return (
            <header
                ref={combinedRef}
                className={cn(
                    'sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 [&_*]:no-underline',
                    className,
                )}
                {...props}
            >
                <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-center gap-2">
                        {/* Mobile menu trigger */}
                        {isMobile && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground" variant="ghost" size="icon">
                                        <HamburgerIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-64 p-1">
                                    <NavigationMenu className="max-w-none">
                                        <NavigationMenuList className="flex-col items-start gap-0">
                                            {navigationLinks.map((link, index) => (
                                                <NavigationMenuItem key={index} className="w-full">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (onNavItemClick && link.href) onNavItemClick(link.href);
                                                        }}
                                                        className="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                    >
                                                        {link.label}
                                                    </button>
                                                </NavigationMenuItem>
                                            ))}
                                        </NavigationMenuList>
                                    </NavigationMenu>
                                </PopoverContent>
                            </Popover>
                        )}
                        {/* Main nav */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={(e) => e.preventDefault()}
                                className="flex cursor-pointer items-center space-x-2 text-primary transition-colors hover:text-primary/90"
                            >
                                <div className="text-2xl">{logo}</div>
                                <span className="hidden text-xl font-bold sm:inline-block">Dev Mind</span>
                            </button>
                            {/* Navigation menu */}
                            {!isMobile && (
                                <NavigationMenu className="flex">
                                    <NavigationMenuList className="gap-1">
                                        {navigationLinks.map((link, index) => (
                                            <NavigationMenuItem key={index}>
                                                <NavigationMenuLink
                                                    href={link.href}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (onNavItemClick && link.href) onNavItemClick(link.href);
                                                    }}
                                                    className="group inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-md bg-background px-4 py-1.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    {link.label}
                                                </NavigationMenuLink>
                                            </NavigationMenuItem>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            )}
                        </div>
                    </div>
                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {/* Theme toggle */}
                            <ThemeToggle onToggle={onThemeToggle} />
                            {/* Info menu */}
                            <InfoMenu onItemClick={onInfoItemClick} />
                            {/* Notification */}
                            <NotificationMenu notificationCount={notificationCount} onItemClick={onNotificationItemClick} />
                        </div>
                        {/* User menu */}
                        <UserMenu userName={userName} userEmail={userEmail} userAvatar={userAvatar} onItemClick={onUserItemClick} />
                    </div>
                </div>
            </header>
        );
    },
);

Navbar05.displayName = 'Navbar05';

export { HamburgerIcon, InfoMenu, Logo, NotificationMenu, ThemeToggle, UserMenu };
