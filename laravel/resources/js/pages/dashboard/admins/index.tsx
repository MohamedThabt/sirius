import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ClientDateTime } from '@/components/ClientDateTime';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon, ShieldIcon, ShieldCheckIcon, AlertCircleIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { createAdminSchema, updateAdminSchema } from '@/lib/validations';

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

interface Role {
    value: string;
    label: string;
}

interface Summary {
    total: number;
    super_admins: number;
    admins: number;
}

interface Props {
    admins: {
        data: Admin[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        role?: string;
    };
    roles: Role[];
    summary: Summary;
}

interface AdminFormData {
    name: string;
    email: string;
    password: string;
    role: string;
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

export default function AdminsIndex({ admins, filters, roles, summary }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    // Create form
    const createForm = useForm<AdminFormData>({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    // Edit form
    const editForm = useForm<AdminFormData>({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    // Frontend validation errors
    const [createValidationErrors, setCreateValidationErrors] = useState<{ [key: string]: string }>({});
    const [editValidationErrors, setEditValidationErrors] = useState<{ [key: string]: string }>({});

    // Debounced filter function
    const debouncedFilter = useDebouncedCallback((searchValue: string, roleValue: string) => {
        const filterData: { search?: string; role?: string } = {};
        if (searchValue) filterData.search = searchValue;
        if (roleValue && roleValue !== 'all') filterData.role = roleValue;

        router.get('/admin/admins', filterData, { preserveState: true });
    }, 300);

    // Handle search change with debounce
    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedFilter(value, roleFilter);
    };

    // Handle role filter change - instant apply
    const handleRoleChange = (value: string) => {
        setRoleFilter(value);
        const filterData: { search?: string; role?: string } = {};
        if (search) filterData.search = search;
        if (value && value !== 'all') filterData.role = value;
        router.get('/admin/admins', filterData, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('all');
        router.get('/admin/admins');
    };

    const handleDelete = (admin: Admin, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${admin.name}?`)) {
            router.delete(`/admin/admins/${admin.id}`);
        }
    };

    const handleRowClick = (admin: Admin) => {
        setSelectedAdmin(admin);
        editForm.setData({
            name: admin.name,
            email: admin.email,
            password: '',
            role: admin.role,
        });
        setEditValidationErrors({});
        setIsEditModalOpen(true);
    };

    const handleEditClick = (admin: Admin, e: React.MouseEvent) => {
        e.stopPropagation();
        handleRowClick(admin);
    };

    const openCreateModal = () => {
        createForm.reset();
        setCreateValidationErrors({});
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate with Zod
        const result = createAdminSchema.safeParse(createForm.data);
        if (!result.success) {
            const errors: { [key: string]: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    errors[err.path[0] as string] = err.message;
                }
            });
            setCreateValidationErrors(errors);
            return;
        }
        setCreateValidationErrors({});

        createForm.post('/admin/admins', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                setCreateValidationErrors({});
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAdmin) {
            // Validate with Zod
            const result = updateAdminSchema.safeParse(editForm.data);
            if (!result.success) {
                const errors: { [key: string]: string } = {};
                result.error.errors.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0] as string] = err.message;
                    }
                });
                setEditValidationErrors(errors);
                return;
            }
            setEditValidationErrors({});

            editForm.put(`/admin/admins/${selectedAdmin.id}`, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedAdmin(null);
                    setEditValidationErrors({});
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Admin Management</h1>
                    <Button onClick={openCreateModal}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Admin
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                            <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.super_admins}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Regular Admins</CardTitle>
                            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.admins}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={roleFilter} onValueChange={handleRoleChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(search || (roleFilter && roleFilter !== 'all')) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear
                        </Button>
                    )}
                </div>

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
                                <TableRow 
                                    key={admin.id} 
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleRowClick(admin)}
                                >
                                    <TableCell className="font-medium">{admin.name}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{admin.creator ? admin.creator.name : 'System'}</TableCell>
                                    <TableCell><ClientDateTime value={admin.created_at} dateStyle="short" /></TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={(e) => handleEditClick(admin, e)}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => handleDelete(admin, e)}
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

                {admins.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium text-muted-foreground">No admins found</p>
                        {(search || (roleFilter && roleFilter !== 'all')) && (
                            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                        )}
                    </div>
                )}

                {/* Pagination info */}
                <div className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Showing {admins.data.length} of {admins.meta?.total || 0} admins
                    </p>
                </div>

                {/* Create Admin Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Admin</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">Name</Label>
                                <Input
                                    id="create-name"
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => {
                                        createForm.setData('name', e.target.value);
                                        if (createValidationErrors.name) {
                                            setCreateValidationErrors(prev => ({ ...prev, name: '' }));
                                        }
                                    }}
                                    className={createValidationErrors.name || createForm.errors.name ? 'border-red-500' : ''}
                                    maxLength={255}
                                    required
                                />
                                {(createValidationErrors.name || createForm.errors.name) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {createValidationErrors.name || createForm.errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-email">Email</Label>
                                <Input
                                    id="create-email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => {
                                        createForm.setData('email', e.target.value);
                                        if (createValidationErrors.email) {
                                            setCreateValidationErrors(prev => ({ ...prev, email: '' }));
                                        }
                                    }}
                                    className={createValidationErrors.email || createForm.errors.email ? 'border-red-500' : ''}
                                    maxLength={255}
                                    required
                                />
                                {(createValidationErrors.email || createForm.errors.email) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {createValidationErrors.email || createForm.errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-password">Password</Label>
                                <Input
                                    id="create-password"
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) => {
                                        createForm.setData('password', e.target.value);
                                        if (createValidationErrors.password) {
                                            setCreateValidationErrors(prev => ({ ...prev, password: '' }));
                                        }
                                    }}
                                    className={createValidationErrors.password || createForm.errors.password ? 'border-red-500' : ''}
                                    required
                                />
                                {(createValidationErrors.password || createForm.errors.password) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {createValidationErrors.password || createForm.errors.password}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-role">Role</Label>
                                <Select
                                    value={createForm.data.role}
                                    onValueChange={(value) => {
                                        createForm.setData('role', value);
                                        if (createValidationErrors.role) {
                                            setCreateValidationErrors(prev => ({ ...prev, role: '' }));
                                        }
                                    }}
                                >
                                    <SelectTrigger className={createValidationErrors.role || createForm.errors.role ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(createValidationErrors.role || createForm.errors.role) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {createValidationErrors.role || createForm.errors.role}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? 'Creating...' : 'Create Admin'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Admin Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Admin - {selectedAdmin?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => {
                                        editForm.setData('name', e.target.value);
                                        if (editValidationErrors.name) {
                                            setEditValidationErrors(prev => ({ ...prev, name: '' }));
                                        }
                                    }}
                                    className={editValidationErrors.name || editForm.errors.name ? 'border-red-500' : ''}
                                    maxLength={255}
                                    required
                                />
                                {(editValidationErrors.name || editForm.errors.name) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {editValidationErrors.name || editForm.errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => {
                                        editForm.setData('email', e.target.value);
                                        if (editValidationErrors.email) {
                                            setEditValidationErrors(prev => ({ ...prev, email: '' }));
                                        }
                                    }}
                                    className={editValidationErrors.email || editForm.errors.email ? 'border-red-500' : ''}
                                    maxLength={255}
                                    required
                                />
                                {(editValidationErrors.email || editForm.errors.email) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {editValidationErrors.email || editForm.errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Password</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) => {
                                        editForm.setData('password', e.target.value);
                                        if (editValidationErrors.password) {
                                            setEditValidationErrors(prev => ({ ...prev, password: '' }));
                                        }
                                    }}
                                    className={editValidationErrors.password || editForm.errors.password ? 'border-red-500' : ''}
                                    placeholder="Leave blank to keep current password"
                                />
                                {(editValidationErrors.password || editForm.errors.password) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {editValidationErrors.password || editForm.errors.password}
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Leave blank to keep the current password
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    value={editForm.data.role}
                                    onValueChange={(value) => {
                                        editForm.setData('role', value);
                                        if (editValidationErrors.role) {
                                            setEditValidationErrors(prev => ({ ...prev, role: '' }));
                                        }
                                    }}
                                >
                                    <SelectTrigger className={editValidationErrors.role || editForm.errors.role ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(editValidationErrors.role || editForm.errors.role) && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircleIcon className="h-4 w-4" />
                                        {editValidationErrors.role || editForm.errors.role}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Updating...' : 'Update Admin'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
