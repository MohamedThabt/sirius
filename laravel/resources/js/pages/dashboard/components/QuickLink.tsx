import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from 'lucide-react';
import React from 'react';

interface QuickLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
    badge?: number;
    iconClassName?: string;
}

export function QuickLink({
    href,
    icon: Icon,
    label,
    badge,
    iconClassName
}: QuickLinkProps) {
    return (
        <Link href={href}>
            <Button
                variant="outline"
                size="sm"
                className="group relative h-9 gap-2 border-border bg-card text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
            >
                <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", iconClassName)} />
                <span>{label}</span>
                {badge !== undefined && badge !== null && badge > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm">
                        {badge}
                    </span>
                )}
                <ArrowRightIcon className="ml-0 h-3 w-0 opacity-0 transition-all duration-200 group-hover:ml-0.5 group-hover:w-3 group-hover:opacity-70" />
            </Button>
        </Link>
    );
}
