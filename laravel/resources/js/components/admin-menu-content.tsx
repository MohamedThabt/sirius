import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type Admin } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

interface AdminMenuContentProps {
    admin: Admin;
}

export function AdminMenuContent({ admin }: AdminMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                    <UserInfo user={admin as any} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuGroup className="p-1">
                <DropdownMenuItem asChild className="rounded-lg transition-colors duration-150 focus:bg-primary/5">
                    <Link className="block w-full" href="/admin/profile" as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="p-1">
                <DropdownMenuItem
                    asChild
                    className="rounded-lg text-red-600 transition-colors duration-150 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                    <Link className="block w-full" href="/admin/logout" as="button" method="post" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Link>
                </DropdownMenuItem>
            </div>
        </>
    );
}
