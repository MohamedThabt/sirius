import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRightIcon, InboxIcon } from 'lucide-react';
import React from 'react';

interface RecentActivityCardProps<T> {
    title: string;
    icon: React.ElementType;
    viewAllHref: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    iconClassName?: string;
    iconBgClassName?: string;
}

export function RecentActivityCard<T extends { id: number }>({
    title,
    icon: Icon,
    viewAllHref,
    items,
    renderItem,
    iconClassName,
    iconBgClassName
}: RecentActivityCardProps<T>) {
    return (
        <Card className="border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2.5 text-base font-medium text-foreground">
                    <div className={cn("rounded-lg p-2", iconBgClassName || "bg-primary/10")}>
                        <Icon className={cn("h-4 w-4", iconClassName || "text-primary")} />
                    </div>
                    {title}
                    {items.length > 0 && (
                        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                            {items.length}
                        </span>
                    )}
                </CardTitle>
                <Link href={viewAllHref}>
                    <Button variant="ghost" size="sm" className="group h-8 text-xs text-muted-foreground hover:text-foreground">
                        View All
                        <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="scrollbar-thin max-h-[300px] space-y-1 overflow-y-auto">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="block">
                            {renderItem(item)}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 py-8">
                        <InboxIcon className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No recent items</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
