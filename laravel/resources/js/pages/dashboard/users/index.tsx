import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ClientDateTime } from '@/components/ClientDateTime';
import { UsersIcon, FolderIcon, GitBranchIcon, TrendingUpIcon } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    projects_count: number;
    avatar?: string;
}

interface Summary {
    total: number;
    with_projects: number;
    this_month: number;
    with_github: number;
}

interface Props {
    users: {
        data: User[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
    };
    summary: Summary;
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
];

export default function UsersIndex({ users, filters, summary }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get('/admin/users', search ? { search } : {}, { preserveState: true });
        }
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/admin/users');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <Badge variant="outline">{users.meta?.total || 0} Total Users</Badge>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">With Projects</CardTitle>
                            <FolderIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.with_projects}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.this_month}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">With GitHub</CardTitle>
                            <GitBranchIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.with_github}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Search users by name or email... (Press Enter)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="max-w-sm"
                    />
                    {search && (
                        <Button variant="outline" onClick={clearSearch}>
                            Clear
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Projects</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user) => (
                                <TableRow 
                                    key={user.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => router.visit(`/admin/users/${user.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{user.projects_count} projects</Badge>
                                    </TableCell>
                                    <TableCell><ClientDateTime value={user.created_at} dateStyle="short" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {users.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium text-muted-foreground">No users found</p>
                        {search && <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>}
                    </div>
                )}

                {/* Pagination info */}
                <div className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Showing {users.data.length} of {users.meta?.total || 0} users
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
