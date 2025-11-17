import { Badge } from '@/components/ui/badge';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    items: NavItem[];
    title?: string;
    collapsible?: boolean;
}

interface ExtendedNavItem extends NavItem {
    items?: NavItem[];
    badge?: string;
    status?: 'completed' | 'pending' | 'in_progress';
    StatusIcon?: React.ComponentType<{ className?: string }>;
}

export function NavMain({ items = [], title, collapsible = false }: NavMainProps) {
    const page = usePage();

    const isItemActive = (item: ExtendedNavItem): boolean => {
        const itemHref = typeof item.href === 'string' ? item.href : item.href.url;
        return page.url.startsWith(itemHref);
    };

    const hasActiveChild = (item: ExtendedNavItem): boolean => {
        if (!item.items) return false;
        return item.items.some((child) => {
            const childHref = typeof child.href === 'string' ? child.href : child.href.url;
            return page.url.startsWith(childHref);
        });
    };

    const renderStatusBadge = (item: ExtendedNavItem) => {
        if (item.badge) {
            return (
                <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1 text-xs">
                    {item.badge}
                </Badge>
            );
        }

        if (item.status && item.StatusIcon) {
            return (
                <item.StatusIcon
                    className={cn(
                        'ml-auto h-3.5 w-3.5 transition-colors duration-200',
                        item.status === 'completed' && 'text-emerald-500 dark:text-emerald-400',
                        item.status === 'in_progress' && 'animate-spin text-blue-500 dark:text-blue-400',
                        item.status === 'pending' && 'text-muted-foreground/40'
                    )}
                />
            );
        }

        return null;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item: ExtendedNavItem) => {
                    const hasChildren = item.items && item.items.length > 0;
                    const isActive = isItemActive(item);

                    return (
                        <SidebarMenuItem key={item.title}>
                            {hasChildren ? (
                                <>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive || hasActiveChild(item)}
                                        tooltip={{ children: item.title }}
                                        className="transition-all duration-200 ease-out hover:translate-x-0.5"
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon className="transition-transform duration-200" />}
                                            <span>{item.title}</span>
                                            {renderStatusBadge(item)}
                                        </Link>
                                    </SidebarMenuButton>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem: ExtendedNavItem) => {
                                            const subIsActive = isItemActive(subItem);
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subIsActive}
                                                        className="transition-all duration-200 ease-out hover:translate-x-0.5"
                                                    >
                                                        <Link href={subItem.href} prefetch>
                                                            {subItem.icon && (
                                                                <subItem.icon className="h-4 w-4 transition-transform duration-200" />
                                                            )}
                                                            <span>{subItem.title}</span>
                                                            {renderStatusBadge(subItem)}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: item.title }}
                                    className="transition-all duration-200 ease-out hover:translate-x-0.5"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="transition-transform duration-200" />}
                                        <span>{item.title}</span>
                                        {renderStatusBadge(item)}
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
