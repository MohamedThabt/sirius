import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, MailIcon, UserIcon, FolderIcon, UsersIcon, ZapIcon, GitBranchIcon, ClockIcon } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    brief: string;
    status: string;
    created_at: string;
    features_count?: number;
}

interface TeamProject {
    id: number;
    name: string;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    pivot: {
        role: string;
        joined_at?: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
    email_verified_at?: string;
    provider?: string;
    projects: Project[];
    team_projects?: TeamProject[];
    github_token?: any;
}

interface UserStats {
    total_owned_projects: number;
    total_team_projects: number;
    total_features_created: number;
    projects_by_status: Record<string, number>;
    has_github: boolean;
    pending_invitations: number;
}

interface Props {
    user: User;
    userStats: UserStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'User Details',
        href: '#',
    },
];

export default function UserShow({ user, userStats }: Props) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'draft':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'owner':
                return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            case 'admin':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'developer':
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'viewer':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User Details - ${user.name}`} />

            <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/users">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">User Details</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Owned Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{userStats.total_owned_projects}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Team Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{userStats.total_team_projects}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Features Created
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{userStats.total_features_created}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                GitHub
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="outline" className={userStats.has_github ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'}>
                                {userStats.has_github ? 'Connected' : 'Not Connected'}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Pending Invites
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">{userStats.pending_invitations}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* User Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <UserIcon className="h-4 w-4" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-medium">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MailIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Email Status</span>
                                    </div>
                                    <Badge variant="outline" className={user.email_verified_at ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'}>
                                        {user.email_verified_at ? 'Verified' : 'Unverified'}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                </div>

                                {user.provider && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Login method</span>
                                        <Badge variant="outline" className="capitalize">
                                            {user.provider}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects by Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Projects by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(userStats.projects_by_status).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <Badge variant="outline" className={getStatusColor(status)}>{status.replace('_', ' ')}</Badge>
                                        <span className="text-2xl font-semibold">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(userStats.projects_by_status).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Owned Projects */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Owned Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.projects.length > 0 ? (
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Name</TableHead>
                                            <TableHead>Brief</TableHead>
                                            <TableHead>Features</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.projects.map((project) => (
                                            <TableRow 
                                                key={project.id}
                                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                                onClick={() => window.location.href = `/admin/projects/${project.id}`}
                                            >
                                                <TableCell className="font-medium">{project.name}</TableCell>
                                                <TableCell className="max-w-md truncate text-sm text-muted-foreground">{project.brief}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{project.features_count || 0}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FolderIcon className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                <p className="text-sm font-medium">No owned projects</p>
                                <p className="text-xs text-muted-foreground mt-1">This user hasn't created any projects</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Team Projects */}
                {user.team_projects && user.team_projects.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Team Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Name</TableHead>
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Joined</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.team_projects.map((project) => (
                                            <TableRow 
                                                key={project.id}
                                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                                onClick={() => window.location.href = `/admin/projects/${project.id}`}
                                            >
                                                <TableCell className="font-medium">{project.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{project.user.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getRoleColor(project.pivot.role)}>{project.pivot.role}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {project.pivot.joined_at 
                                                        ? new Date(project.pivot.joined_at).toLocaleDateString()
                                                        : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
