import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircleIcon,
    ClockIcon,
    MailIcon,
    ShieldIcon,
    UsersIcon,
} from 'lucide-react';

interface Invitation {
    id: number;
    email: string;
    role: string;
    token: string;
    expires_at: string;
}

interface Project {
    id: number;
    name: string;
    brief: string;
}

interface Props {
    invitation: Invitation;
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

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30';
            case 'admin':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30';
            case 'developer':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30';
            case 'viewer':
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title="Accept Project Invitation" />

            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Logo/Brand */}
                    <div className="mb-8 text-center">
                        <a href="/" className="inline-flex items-center text-2xl font-bold text-foreground transition-opacity hover:opacity-80">
                            <AppLogo />
                        </a>
                    </div>

                    {/* Main Card */}
                    <Card className="p-8 shadow-lg">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <MailIcon className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                You've been invited!
                            </h1>
                            <p className="text-muted-foreground">You've been invited to join a project on Sirius</p>
                        </div>

                        {/* Project Info */}
                        <div className="bg-muted/50 rounded-lg p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 shrink-0">
                                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                        {getInitials(project.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-semibold text-foreground mb-1">
                                        {project.name}
                                    </h2>
                                    {project.brief && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {project.brief}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Invitation Details */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between py-3 border-b">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MailIcon className="h-4 w-4" />
                                    <span>Invited Email</span>
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {invitation.email}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b">
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
                                    {formatDate(invitation.expires_at)}
                                </span>
                            </div>
                        </div>

                        {/* Role Permissions Info */}
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                As a {invitation.role}, you will be able to:
                            </h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
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
                            <Button
                                onClick={handleAccept}
                                className="flex-1"
                                size="lg"
                            >
                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                Accept Invitation
                            </Button>
                            <Button
                                onClick={handleDecline}
                                variant="outline"
                                size="lg"
                            >
                                Decline
                            </Button>
                        </div>
                    </Card>

                    {/* Footer Text */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        By accepting this invitation, you agree to collaborate on this project.
                    </p>
                </div>
            </div>
        </>
    );
}
