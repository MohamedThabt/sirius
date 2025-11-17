import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Mail, 
    CheckCircle, 
    XCircle, 
    Clock,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import { useInitials } from "@/hooks/use-initials";
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData } from '@/types';

interface Invitation {
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
    invitations: Invitation[];
}

export default function ProjectInvitations({ invitations }: Props) {
    useFlashToasts();
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: 'Invitations', href: '/projects/invitations' },
    ];

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
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

    const handleApprove = (invitationId: number) => {
        router.post(`/invitations/${invitationId}/accept`);
    };

    const handleDeny = (invitationId: number) => {
        router.post(`/invitations/${invitationId}/decline`);
    };

    return (
        <>
            <Head title="Project Invitations" />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectsIndexSidebar
                        auth={auth}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        onCreateProject={() => router.visit('/projects')}
                        projectCount={0}
                        invitationsCount={invitations.length}
                        currentPage="invitations"
                    />

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

                            <header className="mb-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Project Invitations</h1>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Review and respond to your pending project invitations
                                        </p>
                                    </div>
                                </div>
                            </header>

                            <div className="space-y-6">
                                {invitations.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-12">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                                                    <Mail className="h-10 w-10 text-primary" />
                                                </div>
                                                <h3 className="text-lg font-medium text-foreground mb-2">No pending invitations</h3>
                                                <p className="text-sm text-muted-foreground max-w-md mb-6">
                                                    You don't have any pending project invitations at the moment.
                                                </p>
                                                <Button onClick={() => router.visit('/projects')}>
                                                    Go to Projects
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="h-5 w-5" />
                                                Pending Invitations ({invitations.length})
                                            </CardTitle>
                                            <CardDescription>Review and respond to your project invitations</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {invitations.map((invitation) => (
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
                                                                    onClick={() => handleDeny(invitation.id)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Decline
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApprove(invitation.id)}
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
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
