import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, DatabaseIcon, Download, Maximize2, Minimize2, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
    erd: string;
    status: string;
    user: User;
}

interface Props {
    project: Project;
}

export default function ProjectERD({ project }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
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
            title: 'ERD',
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

    const handleDownload = () => {
        const blob = new Blob([project.erd], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name.toLowerCase().replace(/[^a-z0-9-]+/gi, '-')}-erd.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('ERD downloaded successfully!');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(project.erd);
            toast.success('ERD copied to clipboard!');
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`ERD - ${project.name}`} />

            <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full flex-1 gap-6 overflow-x-auto rounded-xl p-4'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between ${isFullscreen ? 'border-b p-4' : ''}`}>
                    <div className="flex items-center gap-4">
                        {!isFullscreen && (
                            <Link href={`/admin/projects/${project.id}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Back to Project
                                </Button>
                            </Link>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold">Entity Relationship Diagram</h1>
                            <p className="text-sm text-muted-foreground">{project.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                            {isFullscreen ? 'Exit' : 'Fullscreen'}
                        </Button>
                    </div>
                </div>

                {/* ERD Content */}
                <div className={`${isFullscreen ? 'flex-1 overflow-auto p-4' : ''}`}>
                    <Card className={isFullscreen ? 'h-full' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DatabaseIcon className="h-5 w-5" />
                                Database Schema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className={isFullscreen ? 'h-[calc(100%-5rem)] overflow-auto' : ''}>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <ReactMarkdown>{project.erd}</ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
