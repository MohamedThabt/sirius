import { Breadcrumbs } from '@/components/breadcrumbs';
import { ClientDateTime } from '@/components/ClientDateTime';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useInitials } from '@/hooks/use-initials';
import { type Invitation, type SharedData } from '@/types';
import { getRoleBadgeColor } from '@/utils/role-colors';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, Clock, Mail, MenuIcon, XCircle } from 'lucide-react';
import { useState } from 'react';

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
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 border border-border/50 bg-background p-0 hover:bg-muted lg:hidden"
                                        >
                                            <MenuIcon className="h-4 w-4" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-64 border-none bg-transparent p-0">
                                        <ProjectsIndexSidebar
                                            auth={auth}
                                            isSidebarCollapsed={false}
                                            onCreateProject={() => router.visit('/projects')}
                                            projectCount={0}
                                            invitationsCount={invitations.length}
                                            currentPage="invitations"
                                            isMobileSheet={true}
                                        />
                                    </SheetContent>
                                </Sheet>
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            <PageHeader title="Project Invitations" description="Review and respond to your pending project invitations" />

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
                                                                                <ClientDateTime value={invitation.invited_at} dateStyle="short" />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDeny(invitation.id)}
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Decline
                                                                </Button>
                                                                <Button size="sm" onClick={() => handleApprove(invitation.id)}>
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
