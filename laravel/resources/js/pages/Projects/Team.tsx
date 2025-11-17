import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    Mail, 
    MoreVertical, 
    UserPlus, 
    UserMinus, 
    Shield, 
    Clock,
    XCircle,
    Search,
    AlertCircle,
    ChevronDown,
    Home as HomeIcon,
    File as FileIcon,
    Zap as ZapIcon,
    Lightbulb as LightbulbIcon,
    Database as DatabaseIcon,
    Layers as LayersIcon,
    Code as CodeIcon,
    PanelLeftClose,
    PanelLeftOpen,
    Loader2,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { UserMenuContent } from "@/components/user-menu-content";
import { useInitials } from "@/hooks/use-initials";

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

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
    userRole: string | null;
}

export default function Team({ project, members, invitations, userInvitations, userRole }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('viewer');
    const [newRole, setNewRole] = useState<'admin' | 'developer' | 'viewer'>('viewer');

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
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
            }
        );
    };

    const handleSearchUser = async () => {
        if (!searchEmail) return;
        
        setIsSearching(true);
        setSearchError('');
        setSearchedUser(null);

        try {
            const response = await fetch(`/team/search-users?email=${encodeURIComponent(searchEmail)}`);
            
            if (!response.ok) {
                const error = await response.json();
                setSearchError(error.error || 'User not found');
                return;
            }

            const user = await response.json();
            setSearchedUser(user);
        } catch {
            setSearchError('Failed to search user');
        } finally {
            setIsSearching(false);
        }
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
            }
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

    const navGroups = [
        {
            label: 'Plan',
            items: [
                {
                    key: 'home',
                    icon: HomeIcon,
                    label: 'Project Home',
                    active: false,
                    onClick: () => router.visit(`/projects/${project.id}`),
                },
                {
                    key: 'overview',
                    icon: FileIcon,
                    label: 'System Overview',
                    onClick: () => router.visit(`/projects/${project.id}/system-overview`),
                },
                {
                    key: 'prd',
                    icon: FileIcon,
                    label: 'PRD',
                    onClick: () => router.visit(`/projects/${project.id}/prd`),
                },
                {
                    key: 'features',
                    icon: ZapIcon,
                    label: 'Features',
                    onClick: () => {},
                },
            ],
        },
        {
            label: 'Design',
            items: [
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    onClick: () => router.visit(`/projects/${project.id}/brainstorming`),
                },
            ],
        },
        {
            label: 'Technical',
            items: [
                {
                    key: 'erd',
                    icon: DatabaseIcon,
                    label: 'Database Designer',
                    onClick: () => router.visit(`/projects/${project.id}/erd`),
                },
                {
                    key: 'c4',
                    icon: LayersIcon,
                    label: 'System Architecture',
                    onClick: () => router.visit(`/projects/${project.id}/c4`),
                },
                {
                    key: 'technology',
                    icon: CodeIcon,
                    label: 'Technology Stack',
                    onClick: () => router.visit(`/projects/${project.id}/technology`),
                },
            ],
        },
        {
            label: 'Collaboration',
            items: [
                {
                    key: 'team',
                    icon: Users,
                    label: 'Team',
                    active: true,
                    onClick: () => {},
                },
            ],
        },
    ];

    return (
        <>
            <Head title={`Team - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}>
                        <div
                            className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        >
                            <div className="overflow-y-auto scrollbar-hide">
                                {/* Logo/Brand */}
                                <div className="mb-6 border-b pb-4">
                                    <a href="/" className="flex items-center gap-2 text-lg font-bold text-foreground hover:opacity-80 transition-opacity">
                                        Sirius
                                    </a>
                                </div>

                                <div className="mb-6">
                                    <div className="mb-3">
                                        <div className="truncate text-sm font-medium text-foreground">{project.name}</div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${getStatusColor(project.status)}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <nav className="space-y-6">
                                    {navGroups.map((group) => (
                                        <div key={group.label} className="space-y-2">
                                            <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                {group.label}
                                            </div>
                                            <ul className="space-y-1">
                                                {group.items.map((item) => (
                                                    <li key={item.key}>
                                                        <button
                                                            onClick={item.onClick}
                                                            className={[
                                                                'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                                item.active
                                                                    ? 'bg-muted font-medium text-foreground'
                                                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                            ].join(' ')}
                                                        >
                                                            <item.icon className="h-4 w-4 shrink-0" />
                                                            <span>{item.label}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            <div className="shrink-0 border-t pt-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                                            <Avatar className="h-5 w-5 shrink-0">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                <AvatarFallback className="text-[10px] bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-xs font-medium text-foreground">{auth.user.name}</div>
                                                <div className="truncate text-[10px] text-muted-foreground">{auth.user.email}</div>
                                            </div>
                                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </aside>

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
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start gap-3 mb-3">
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
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="font-semibold text-foreground text-lg mb-1">
                                                                            {invitation.project.name}
                                                                        </h3>
                                                                        {invitation.invited_by && (
                                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                                <span className="font-medium">{invitation.invited_by.name}</span> invited you to join this project
                                                                            </p>
                                                                        )}
                                                                        {invitation.project.brief && (
                                                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                                                {invitation.project.brief}
                                                                            </p>
                                                                        )}
                                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                            <Badge className={`border text-xs capitalize ${getRoleBadgeColor(invitation.role)}`}>
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
                                                            <div className="flex gap-2 shrink-0">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDenyInvitation(invitation.id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Decline
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApproveInvitation(invitation.id)}
                                                                >
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
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Team Members ({members.length})
                                        </CardTitle>
                                        <CardDescription>Manage roles and permissions for your team</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {members.map((member) => (
                                                <div 
                                                    key={member.id} 
                                                    className={`flex items-center justify-between rounded border p-4 ${
                                                        member.role === 'owner' 
                                                            ? 'bg-muted/30 border-muted-foreground/20' 
                                                            : ''
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
                                                                {member.role === 'owner' ? 'Project Owner' : `Joined ${new Date(member.joined_at).toLocaleDateString()}`}
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
                                            ))}
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
                                                                    {invitation.invited_by && (
                                                                        <span>by {invitation.invited_by.name}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={`border text-xs capitalize ${getRoleBadgeColor(invitation.role)}`}>
                                                                {invitation.role}
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCancelInvitation(invitation.id)}
                                                            >
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
            <Dialog open={isInviteModalOpen} onOpenChange={(open) => {
                setIsInviteModalOpen(open);
                if (!open) {
                    setSearchEmail('');
                    setSearchedUser(null);
                    setSearchError('');
                    setInviteRole('viewer');
                }
            }}>
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
                                    <Button 
                                        type="button" 
                                        variant="secondary"
                                        onClick={handleSearchUser}
                                        disabled={isSearching || !searchEmail}
                                    >
                                        {isSearching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {searchError && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{searchError}</p>
                                )}
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
                            <Button type="submit" disabled={!searchedUser}>Send Invitation</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Role Modal */}
            <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Member Role</DialogTitle>
                        <DialogDescription>
                            Change the role for {selectedMember?.name}
                        </DialogDescription>
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
                        <DialogDescription>
                            Are you sure you want to remove {selectedMember?.name} from this project?
                        </DialogDescription>
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
