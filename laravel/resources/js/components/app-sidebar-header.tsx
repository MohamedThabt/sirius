import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className={cn(
            'flex h-16 w-full shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-background px-4 transition-[width,height] ease-linear',
            'group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
            'md:px-6'
        )}>
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <div className="flex-1 overflow-hidden">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
        </header>
    );
}
