import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from 'lucide-react';
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
        <Card className="border border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground/80">
                    <div className={cn("rounded-lg p-1.5", iconBgClassName || "bg-primary/10")}>
                        <Icon className={cn("h-4 w-4", iconClassName || "text-primary")} />
                    </div>
                    {title}
                </CardTitle>
                <Link href={viewAllHref}>
                    <Button variant="ghost" size="sm" className="group h-8 text-xs text-muted-foreground/70 hover:text-foreground/80">
                        View All
                        <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="scrollbar-thin max-h-[280px] space-y-1 overflow-y-auto">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="block">
                            {renderItem(item)}
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                        No recent items found
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
