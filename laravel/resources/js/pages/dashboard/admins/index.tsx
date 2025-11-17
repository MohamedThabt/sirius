import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface Admin {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    creator?: {
        id: number;
        name: string;
    };
}

interface Props {
    admins: {
        data: Admin[];
        links: any[];
        meta: any;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Admins',
        href: '/admin/admins',
    },
];

export default function AdminsIndex({ admins }: Props) {
    const [search, setSearch] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/admins', { search }, { preserveState: true });
    };

    const handleDelete = (admin: Admin) => {
        if (confirm(`Are you sure you want to delete ${admin.name}?`)) {
            router.delete(`/admin/admins/${admin.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Admin Management</h1>
                    <Link href="/admin/admins/create">
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Admin
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Search admins..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit">Search</Button>
                </form>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.data.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">{admin.name}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{admin.creator ? admin.creator.name : 'System'}</TableCell>
                                    <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/admins/${admin.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(admin)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination would go here if needed */}
                <div className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Showing {admins.data.length} of {admins.meta?.total || 0} admins
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
