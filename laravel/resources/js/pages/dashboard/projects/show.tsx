import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, ClipboardListIcon, FileTextIcon, SettingsIcon, UserIcon } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    status: string;
    non_functional_requirements?: string;
    technical_details?: string;
    created_at: string;
    updated_at: string;
    user: User;
}

interface Props {
    project: Project;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Projects',
        href: '/admin/projects',
    },
    {
        title: 'Project Details',
        href: '#',
    },
];

export default function ProjectShow({ project }: Props) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Project Details - ${project.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/projects">
                        <Button variant="outline" size="sm">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Project Details</h1>
                </div>

                {/* Project Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl">{project.name}</CardTitle>
                                <p className="mt-1 text-muted-foreground">{project.brief}</p>
                            </div>
                            <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Owner:</span>
                                <span className="font-medium">{project.user.name}</span>
                                <span className="text-sm text-muted-foreground">({project.user.email})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Created:</span>
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {/* Project Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileTextIcon className="h-5 w-5" />
                                Project Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.overview}</p>
                        </CardContent>
                    </Card>

                    {/* Non-Functional Requirements */}
                    {project.non_functional_requirements && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardListIcon className="h-5 w-5" />
                                    Non-Functional Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.non_functional_requirements}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Technical Details */}
                {project.technical_details && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                Technical Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.technical_details}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Project Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium">Project ID</p>
                                <p className="text-sm text-muted-foreground">#{project.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm text-muted-foreground">{new Date(project.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Last Updated</p>
                                <p className="text-sm text-muted-foreground">{new Date(project.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
