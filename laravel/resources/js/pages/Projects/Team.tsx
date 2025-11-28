import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type User as AuthUser } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2,
    Mail,
    MoreVertical,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Shield,
    UserMinus,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface SearchedUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    user_id: number;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'developer' | 'viewer';
    joined_at: string;
}

interface PendingInvitation {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    role: 'admin' | 'developer' | 'viewer';
    invited_by: {
        id: number;
        name: string;
    } | null;
    invited_at: string;
}

interface UserInvitation {
    id: number;
    project: {
        id: number;
        name: string;
        brief: string;
    };
    role: 'admin' | 'developer' | 'viewer';
    invited_by: {
        id: number;
        name: string;
        avatar?: string;
    } | null;
    invited_at: string;
}

interface Props {
    project: Project;
    members: TeamMember[];
    invitations: PendingInvitation[];
    userInvitations: UserInvitation[];
    searchedUser: SearchedUser | null;
    userRole: string | null;
}

export default function Team({ project, members, invitations, userInvitations, userRole, searchedUser: initialSearchedUser }: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: AuthUser } }>().props;
    const getInitials = useInitials();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(initialSearchedUser);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('viewer');
    const [newRole, setNewRole] = useState<'admin' | 'developer' | 'viewer'>('viewer');
    const [memberSearch, setMemberSearch] = useState('');

    // Update local state when prop changes
    useMemo(() => {
        setSearchedUser(initialSearchedUser);
    }, [initialSearchedUser]);

    const filteredMembers = useMemo(() => {
        if (!memberSearch) return members;
        const lowerSearch = memberSearch.toLowerCase();
        return members.filter(
            (member) =>
                member.name.toLowerCase().includes(lowerSearch) ||
                member.email.toLowerCase().includes(lowerSearch)
        );
    }, [members, memberSearch]);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Team', href: `/projects/${project.id}/team` },
    ];

    const canManageTeam = userRole === 'owner' || userRole === 'admin';

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30';
            case 'admin':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'developer':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            case 'viewer':
                return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchedUser) return;

        router.post(
            `/projects/${project.id}/invitations`,
            { user_id: searchedUser.id, role: inviteRole },
            {
                onSuccess: () => {
                    setIsInviteModalOpen(false);
                    setSearchEmail('');
                    setSearchedUser(null);
                    setInviteRole('viewer');
                    setSearchError('');
                },
            },
        );
    };

    const handleSearchUser = () => {
        if (!searchEmail) return;

        setIsSearching(true);
        setSearchError('');
        setSearchedUser(null);

        router.get(
            `/projects/${project.id}/team`,
            { search_email: searchEmail },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['searchedUser'],
                onSuccess: () => {
                    setIsSearching(false);
                    // If no user found, searchedUser prop will be null (or whatever backend returns)
                    // We might want to check if it's null and set error
                    // But since we are using useMemo to sync prop to state, we can check state in useEffect or just rely on prop.
                    // However, onSuccess runs after props update.
                },
                onFinish: () => setIsSearching(false),
            }
        );
    };

    const handleUpdateRole = () => {
        if (!selectedMember) return;
        router.patch(
            `/projects/${project.id}/team/role`,
            { user_id: selectedMember.id, role: newRole },
            {
                onSuccess: () => {
                    setIsEditRoleModalOpen(false);
                    setSelectedMember(null);
                },
            },
        );
    };

    const handleRemoveMember = () => {
        if (!selectedMember) return;
        router.delete(`/projects/${project.id}/team/member/${selectedMember.id}`, {
            onSuccess: () => {
                setIsRemoveMemberModalOpen(false);
                setSelectedMember(null);
            },
        });
    };

    const handleCancelInvitation = (invitationId: number) => {
        router.delete(`/projects/${project.id}/team/invitations/${invitationId}`);
    };

    const handleApproveInvitation = (invitationId: number) => {
        router.post(`/invitations/${invitationId}/accept`);
    };

    const handleDenyInvitation = (invitationId: number) => {
        router.post(`/invitations/${invitationId}/decline`);
    };

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'team',
            }),
        [project],
    );

    return (
        <>
            <Head title={`Team - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel project={project} navGroups={navGroups} isCollapsed={isSidebarCollapsed} user={auth.user} />

                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-6 flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    title={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
                                >
                                    {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                                </Button>
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            <header className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Team Management</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">Manage team members and invitations</p>
                                </div>
                                {canManageTeam && (
                                    <Button onClick={() => setIsInviteModalOpen(true)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Invite Member
                                    </Button>
                                )}
                            </header>

                            <div className="space-y-6">
                                {/* My Invitations (for current user) */}
                                {userInvitations && userInvitations.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="h-5 w-5" />
                                                My Invitations ({userInvitations.length})
                                            </CardTitle>
                                            <CardDescription>Project invitations you've received</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {userInvitations.map((invitation) => (
                                                    <div key={invitation.id} className="rounded-lg border p-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="mb-3 flex items-start gap-3">
                                                                    {invitation.invited_by && (
                                                                        <Avatar className="h-10 w-10 shrink-0">
                                                                            <AvatarImage
                                                                                src={invitation.invited_by.avatar}
                                                                                alt={invitation.invited_by.name}
                                                                            />
                                                                            <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                                                {getInitials(invitation.invited_by.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <h3 className="mb-1 text-lg font-semibold text-foreground">
                                                                            {invitation.project.name}
                                                                        </h3>
                                                                        {invitation.invited_by && (
                                                                            <p className="mb-2 text-sm text-muted-foreground">
                                                                                <span className="font-medium">{invitation.invited_by.name}</span>{' '}
                                                                                invited you to join this project
                                                                            </p>
                                                                        )}
                                                                        {invitation.project.brief && (
                                                                            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                                                                {invitation.project.brief}
                                                                            </p>
                                                                        )}
                                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                            <Badge
                                                                                className={`border text-xs capitalize ${getRoleBadgeColor(invitation.role)}`}
                                                                            >
                                                                                {invitation.role}
                                                                            </Badge>
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                {new Date(invitation.invited_at).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDenyInvitation(invitation.id)}
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Decline
                                                                </Button>
                                                                <Button size="sm" onClick={() => handleApproveInvitation(invitation.id)}>
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Accept
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Team Members */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Users className="h-5 w-5" />
                                                    Team Members ({filteredMembers.length})
                                                </CardTitle>
                                                <CardDescription>Manage roles and permissions for your team</CardDescription>
                                            </div>
                                            <div className="w-64">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search members..."
                                                        value={memberSearch}
                                                        onChange={(e) => setMemberSearch(e.target.value)}
                                                        className="pl-8"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {filteredMembers.length === 0 ? (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    No team members found matching "{memberSearch}"
                                                </div>
                                            ) : (
                                                filteredMembers.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className={`flex items-center justify-between rounded border p-4 ${
                                                            member.role === 'owner' ? 'border-muted-foreground/20 bg-muted/30' : ''
                                                        }`}
                                                    >
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={member.avatar} alt={member.name} />
                                                            <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                                {getInitials(member.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-foreground">
                                                                {member.name}
                                                                {member.id === auth.user.id && (
                                                                    <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">{member.email}</div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                {member.role === 'owner'
                                                                    ? 'Project Owner'
                                                                    : `Joined ${new Date(member.joined_at).toLocaleDateString()}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={`border text-xs capitalize ${getRoleBadgeColor(member.role)}`}>
                                                            {member.role}
                                                        </Badge>
                                                        {canManageTeam && member.role !== 'owner' && member.id !== auth.user.id && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedMember(member);
                                                                            setNewRole(member.role as 'admin' | 'developer' | 'viewer');
                                                                            setIsEditRoleModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <Shield className="mr-2 h-4 w-4" />
                                                                        Edit Role
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => {
                                                                            setSelectedMember(member);
                                                                            setIsRemoveMemberModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <UserMinus className="mr-2 h-4 w-4" />
                                                                        Remove Member
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                </div>
                                            )))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Pending Invitations */}
                                {canManageTeam && invitations.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="h-5 w-5" />
                                                Pending Invitations ({invitations.length})
                                            </CardTitle>
                                            <CardDescription>Users who haven't accepted their invitation yet</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {invitations.map((invitation) => (
                                                    <div key={invitation.id} className="flex items-center justify-between rounded border p-4">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={invitation.user.avatar} alt={invitation.user.name} />
                                                                <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                                    {getInitials(invitation.user.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium text-foreground">{invitation.user.name}</div>
                                                                <div className="text-sm text-muted-foreground">{invitation.user.email}</div>
                                                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Clock className="h-3 w-3" />
                                                                    Invited {new Date(invitation.invited_at).toLocaleDateString()}
                                                                    {invitation.invited_by && <span>by {invitation.invited_by.name}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={`border text-xs capitalize ${getRoleBadgeColor(invitation.role)}`}>
                                                                {invitation.role}
                                                            </Badge>
                                                            <Button variant="ghost" size="sm" onClick={() => handleCancelInvitation(invitation.id)}>
                                                                <XCircle className="mr-2 h-3 w-3" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Invite Member Modal */}
            <Dialog
                open={isInviteModalOpen}
                onOpenChange={(open) => {
                    setIsInviteModalOpen(open);
                    if (!open) {
                        setSearchEmail('');
                        setSearchedUser(null);
                        setSearchError('');
                        setInviteRole('viewer');
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>Search for a user by email to invite them to this project</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInviteMember}>
                        <div className="space-y-4">
                            {/* Search User */}
                            <div>
                                <Label htmlFor="search-email">User Email</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="search-email"
                                        type="email"
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        required
                                    />
                                    <Button type="button" variant="secondary" onClick={handleSearchUser} disabled={isSearching || !searchEmail}>
                                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {searchError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{searchError}</p>}
                            </div>

                            {/* Display Found User */}
                            {searchedUser && (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={searchedUser.avatar} alt={searchedUser.name} />
                                            <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(searchedUser.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground">{searchedUser.name}</div>
                                            <div className="text-sm text-muted-foreground">{searchedUser.email}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Role Selection */}
                            {searchedUser && (
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={inviteRole} onValueChange={(value: 'admin' | 'developer' | 'viewer') => setInviteRole(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">Viewer - Can view project</SelectItem>
                                            <SelectItem value="developer">Developer - Can edit project</SelectItem>
                                            <SelectItem value="admin">Admin - Can manage team</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!searchedUser}>
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Role Modal */}
            <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Member Role</DialogTitle>
                        <DialogDescription>Change the role for {selectedMember?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="newRole">Role</Label>
                            <Select value={newRole} onValueChange={(value: 'admin' | 'developer' | 'viewer') => setNewRole(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="developer">Developer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsEditRoleModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRole}>Update Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Member Modal */}
            <Dialog open={isRemoveMemberModalOpen} onOpenChange={setIsRemoveMemberModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Team Member</DialogTitle>
                        <DialogDescription>Are you sure you want to remove {selectedMember?.name} from this project?</DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <div className="text-sm text-red-800 dark:text-red-300">
                                This action cannot be undone. The member will lose access to this project immediately.
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsRemoveMemberModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRemoveMember}>
                            Remove Member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
