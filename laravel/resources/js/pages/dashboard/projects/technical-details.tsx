import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, SettingsIcon } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
    technical_details: string;
    status: string;
    user: User;
}

interface Props {
    project: Project;
}

export default function ProjectTechnicalDetails({ project }: Props) {
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
            title: project.name,
            href: `/admin/projects/${project.id}`,
        },
        {
            title: 'Technical Details',
            href: '#',
        },
    ];

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
            <Head title={`Technical Details - ${project.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Project
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Technical Details</h1>
                            <p className="text-sm text-muted-foreground">{project.name}</p>
                        </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                </div>

                {/* Technical Details Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5" />
                            Implementation Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{project.technical_details}</pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
