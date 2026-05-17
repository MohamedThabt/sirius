import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header
            className={cn(
                'sticky top-0 z-10 flex h-14 w-full shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md transition-[width,height] ease-linear',
                'group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
                'md:px-6',
            )}
        >
            <div className="flex w-full items-center gap-3">
                <SidebarTrigger className="-ml-1 shrink-0 rounded-lg transition-colors duration-200 hover:bg-primary/5" />
                <div className="flex-1 overflow-hidden">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
        </header>
    );
}
