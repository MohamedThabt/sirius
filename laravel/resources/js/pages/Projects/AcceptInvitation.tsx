import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useInitials } from '@/hooks/use-initials';
import { type AcceptableInvitation, type Project } from '@/types';
import { getRoleBadgeColor } from '@/utils/role-colors';
import { Head, router } from '@inertiajs/react';
import { CheckCircleIcon, ClockIcon, MailIcon, ShieldIcon, UsersIcon } from 'lucide-react';

// AcceptableInvitation and Project types now imported from '@/types'

interface Props {
    invitation: AcceptableInvitation;
    project: Project;
}

export default function AcceptInvitation({ invitation, project }: Props) {
    useFlashToasts();
    const getInitials = useInitials();

    const handleAccept = () => {
        router.post(`/invite/${invitation.token}/accept`);
    };

    const handleDecline = () => {
        router.get('/projects');
    };

    // getRoleBadgeColor now imported from '@/utils/role-colors'

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
            case 'admin':
                return <ShieldIcon className="h-4 w-4" />;
            case 'developer':
                return <UsersIcon className="h-4 w-4" />;
            case 'viewer':
                return <UsersIcon className="h-4 w-4" />;
            default:
                return <UsersIcon className="h-4 w-4" />;
        }
    };

    return (
        <>
            <Head title="Accept Project Invitation" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
                <div className="w-full max-w-2xl">
                    {/* Logo/Brand */}
                    <div className="mb-8 text-center">
                        <a href="/" className="inline-flex items-center text-2xl font-bold text-foreground transition-opacity hover:opacity-80">
                            <AppLogo />
                        </a>
                    </div>

                    {/* Main Card */}
                    <Card className="p-8 shadow-lg">
                        <div className="mb-6 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <MailIcon className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="mb-2 text-2xl font-bold text-foreground">You've been invited!</h1>
                            <p className="text-muted-foreground">You've been invited to join a project on Sirius</p>
                        </div>

                        {/* Project Info */}
                        <div className="mb-6 rounded-lg bg-muted/50 p-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-lg text-primary">{getInitials(project.name)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <h2 className="mb-1 text-xl font-semibold text-foreground">{project.name}</h2>
                                    {project.brief && <p className="line-clamp-2 text-sm text-muted-foreground">{project.brief}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Invitation Details */}
                        <div className="mb-6 space-y-4">
                            <div className="flex items-center justify-between border-b py-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MailIcon className="h-4 w-4" />
                                    <span>Invited Email</span>
                                </div>
                                <span className="text-sm font-medium text-foreground">{invitation.email}</span>
                            </div>

                            <div className="flex items-center justify-between border-b py-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ShieldIcon className="h-4 w-4" />
                                    <span>Role</span>
                                </div>
                                <Badge className={getRoleBadgeColor(invitation.role)}>
                                    <span className="inline-flex items-center gap-1">
                                        {getRoleIcon(invitation.role)}
                                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                                    </span>
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>Expires</span>
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    <ClientDateTime value={invitation.expires_at} dateStyle="long" />
                                </span>
                            </div>
                        </div>

                        {/* Role Permissions Info */}
                        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                                As a {invitation.role}, you will be able to:
                            </h3>
                            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                                {invitation.role === 'admin' && (
                                    <>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            Manage team members and invitations
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            Edit project details and features
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            Access all project resources
                                        </li>
                                    </>
                                )}
                                {invitation.role === 'developer' && (
                                    <>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            View and edit project features
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            Access project documentation
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            Collaborate with team members
                                        </li>
                                    </>
                                )}
                                {invitation.role === 'viewer' && (
                                    <>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            View project details and documentation
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            See project progress and features
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                            Read-only access to project resources
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button onClick={handleAccept} className="flex-1" size="lg">
                                <CheckCircleIcon className="mr-2 h-4 w-4" />
                                Accept Invitation
                            </Button>
                            <Button onClick={handleDecline} variant="outline" size="lg">
                                Decline
                            </Button>
                        </div>
                    </Card>

                    {/* Footer Text */}
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        By accepting this invitation, you agree to collaborate on this project.
                    </p>
                </div>
            </div>
        </>
    );
}
