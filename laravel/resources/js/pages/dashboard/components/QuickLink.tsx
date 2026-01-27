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
                className="group relative overflow-hidden border-border/40 bg-gradient-to-r from-card/60 to-card/30 text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:bg-card/80 hover:text-foreground hover:shadow-md"
            >
                <Icon className={cn("mr-2 h-4 w-4 transition-all duration-300 group-hover:scale-110", iconClassName || "opacity-70 group-hover:opacity-100")} />
                <span className="transition-all duration-200 group-hover:mr-1">{label}</span>
                {badge !== undefined && badge !== null && badge > 0 && (
                    <span 
                        className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums text-white shadow-md"
                        style={{ 
                            backgroundColor: 'rgb(236, 72, 153)',
                            boxShadow: '0 2px 4px rgba(236, 72, 153, 0.4)'
                        }}
                    >
                        {badge}
                    </span>
                )}
                <ArrowRightIcon className="ml-0 h-3 w-0 opacity-0 transition-all duration-200 group-hover:ml-1 group-hover:w-3 group-hover:opacity-70" />
            </Button>
        </Link>
    );
}
