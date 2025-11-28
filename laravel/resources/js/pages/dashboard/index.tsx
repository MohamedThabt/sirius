import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head } from '@inertiajs/react';

interface Stats {
    total_users: number;
    total_projects: number;
    total_admins: number;
    recent_users: Array<{
        id: number;
        name: string;
        email: string;
        created_at: string;
    }>;
    recent_projects: Array<{
        id: number;
        name: string;
        user_id: number;
        status: string;
        created_at: string;
        user: {
            id: number;
            name: string;
        };
    }>;
}

interface Props {
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard({ stats }: Props) {
    useFlashToasts();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <div className="flex h-full flex-col justify-center">
                            <h3 className="text-center text-2xl font-bold">{stats.total_users}</h3>
                            <p className="text-center text-muted-foreground">Total Users</p>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <div className="flex h-full flex-col justify-center">
                            <h3 className="text-center text-2xl font-bold">{stats.total_projects}</h3>
                            <p className="text-center text-muted-foreground">Total Projects</p>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <div className="flex h-full flex-col justify-center">
                            <h3 className="text-center text-2xl font-bold">{stats.total_admins}</h3>
                            <p className="text-center text-muted-foreground">Total Admins</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Users */}
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-semibold">Recent Users</h3>
                        <div className="space-y-3">
                            {stats.recent_users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-semibold">Recent Projects</h3>
                        <div className="space-y-3">
                            {stats.recent_projects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{project.name}</p>
                                        <p className="text-sm text-muted-foreground">by {project.user.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm capitalize">{project.status}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
