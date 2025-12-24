import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Mail, 
    CheckCircle, 
    XCircle, 
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { useInitials } from "@/hooks/use-initials";
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { getRoleBadgeColor } from '@/utils/role-colors';
import { type SharedData, type Invitation } from '@/types';

// Invitation type now imported from @/types

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

    const handleApprove = (invitationId: number) => {
        router.post(`/invitations/${invitationId}/accept`);
    };

    // getRoleBadgeColor now imported from '@/utils/role-colors' - removed ~12 lines of duplication

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
                                <SidebarToggle
                                    isCollapsed={isSidebarCollapsed}
                                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            <PageHeader
                                title="Project Invitations"
                                description="Review and respond to your pending project invitations"
                            />

                            <div className="space-y-6">
                                {invitations.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-0">
                                            <EmptyState
                                                icon={Mail}
                                                title="No pending invitations"
                                                description="You don't have any pending project invitations at the moment."
                                                action={{
                                                    label: 'Go to Projects',
                                                    onClick: () => router.visit('/projects'),
                                                }}
                                            />
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
