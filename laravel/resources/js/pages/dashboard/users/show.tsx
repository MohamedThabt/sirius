import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, MailIcon, UserIcon } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    brief: string;
    status: string;
    created_at: string;
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
}

interface Props {
    user: User;
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

export default function UserShow({ user }: Props) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User Details - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="outline" size="sm">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Users
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">User Details</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* User Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold">{user.name}</h3>
                                    <p className="text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MailIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Email {user.email_verified_at ? 'verified' : 'not verified'}</span>
                                    <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                                        {user.email_verified_at ? 'Verified' : 'Unverified'}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                </div>

                                {user.provider && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Login method:</span>
                                        <Badge variant="outline" className="capitalize">
                                            {user.provider}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{user.projects.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Projects</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{user.projects.filter((p) => p.status === 'completed').length}</p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{user.projects.filter((p) => p.status === 'in_progress').length}</p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{user.projects.filter((p) => p.status === 'draft').length}</p>
                                    <p className="text-sm text-muted-foreground">Draft</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.projects.length > 0 ? (
                            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Name</TableHead>
                                            <TableHead>Brief</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.projects.map((project) => (
                                            <TableRow key={project.id}>
                                                <TableCell className="font-medium">{project.name}</TableCell>
                                                <TableCell className="max-w-md truncate">{project.brief}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <p className="text-lg font-medium text-muted-foreground">No projects yet</p>
                                <p className="text-sm text-muted-foreground">This user hasn't created any projects</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
