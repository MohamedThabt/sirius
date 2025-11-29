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
        return page.url === itemHref || page.url.startsWith(itemHref + '/');
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
                <Badge variant="secondary" className="ml-auto h-5 min-w-5 rounded-full px-1.5 text-[10px] font-medium">
                    {item.badge}
                </Badge>
            );
        }

        if (item.status && item.StatusIcon) {
            return (
                <item.StatusIcon
                    className={cn(
                        'ml-auto h-3 w-3 transition-all duration-300',
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
        <SidebarGroup className="px-1 py-0">
            {title && (
                <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {title}
                </SidebarGroupLabel>
            )}
            <SidebarMenu className="gap-0.5">
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
                                        className={cn(
                                            "group/btn relative rounded-lg transition-all duration-200",
                                            "hover:bg-primary/5",
                                            isActive && "bg-primary/10 text-primary font-medium"
                                        )}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && (
                                                <item.icon className={cn(
                                                    "h-4 w-4 transition-all duration-200",
                                                    isActive ? "text-primary" : "text-muted-foreground group-hover/btn:text-foreground"
                                                )} />
                                            )}
                                            <span className="text-sm">{item.title}</span>
                                            {renderStatusBadge(item)}
                                        </Link>
                                    </SidebarMenuButton>
                                    <SidebarMenuSub className="ml-3 border-l border-border/40 pl-2">
                                        {item.items.map((subItem: ExtendedNavItem) => {
                                            const subIsActive = isItemActive(subItem);
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subIsActive}
                                                        className={cn(
                                                            "rounded-md transition-all duration-200",
                                                            "hover:bg-primary/5",
                                                            subIsActive && "bg-primary/10 text-primary font-medium"
                                                        )}
                                                    >
                                                        <Link href={subItem.href} prefetch>
                                                            {subItem.icon && (
                                                                <subItem.icon className={cn(
                                                                    "h-3.5 w-3.5 transition-all duration-200",
                                                                    subIsActive ? "text-primary" : "text-muted-foreground"
                                                                )} />
                                                            )}
                                                            <span className="text-sm">{subItem.title}</span>
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
                                    className={cn(
                                        "group/btn relative rounded-lg transition-all duration-200",
                                        "hover:bg-primary/5",
                                        isActive && "bg-primary/10 text-primary font-medium"
                                    )}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && (
                                            <item.icon className={cn(
                                                "h-4 w-4 transition-all duration-200",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover/btn:text-foreground"
                                            )} />
                                        )}
                                        <span className="text-sm">{item.title}</span>
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
