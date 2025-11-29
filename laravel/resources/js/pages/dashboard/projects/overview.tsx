import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, FileTextIcon, Download, Maximize2, Minimize2, Copy, EyeIcon, CodeIcon, HistoryIcon, UserIcon, CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

interface User {
    id: number;
    name: string;
    email: string;
}

interface OverviewVersion {
    id: number;
    version_number: number;
    overview: string;
    is_base_version: boolean;
    user_prompt: string | null;
    created_at: string;
}

interface Project {
    id: number;
    name: string;
    overview: string;
    status: string;
    user: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    project: Project;
    overviewVersions?: OverviewVersion[];
}

export default function ProjectOverview({ project, overviewVersions = [] }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
    const [selectedVersion, setSelectedVersion] = useState<OverviewVersion | null>(null);
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Overview', href: '#' },
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

    const currentContent = selectedVersion?.overview || project.overview;

    const handleDownload = () => {
        const blob = new Blob([currentContent], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name.toLowerCase().replace(/[^a-z0-9-]+/gi, '-')}-overview.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Overview downloaded successfully!');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentContent);
            toast.success('Overview copied to clipboard!');
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    useEffect(() => {
        if (viewMode === 'preview') {
            mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
        }
    }, [viewMode, currentContent]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Overview - ${project.name}`} />

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
                            <h1 className="text-2xl font-bold">System Overview</h1>
                            <p className="text-sm text-muted-foreground">{project.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex flex-1 gap-4 ${isFullscreen ? 'overflow-hidden p-4' : ''}`}>
                    {/* Overview Content */}
                    <Card className={`flex-1 ${isFullscreen ? 'h-full overflow-auto' : ''}`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5" />
                                    {selectedVersion ? `Version ${selectedVersion.version_number}` : 'Current Overview'}
                                    {selectedVersion?.is_base_version && (
                                        <Badge variant="outline" className="ml-2">Base</Badge>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'preview' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('preview')}
                                    >
                                        <EyeIcon className="mr-2 h-4 w-4" />
                                        Preview
                                    </Button>
                                    <Button
                                        variant={viewMode === 'source' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('source')}
                                    >
                                        <CodeIcon className="mr-2 h-4 w-4" />
                                        Source
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className={isFullscreen ? 'h-[calc(100%-5rem)] overflow-auto' : ''}>
                            {viewMode === 'preview' ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            code({ node, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const language = match ? match[1] : '';
                                                if (language === 'mermaid') {
                                                    return <div className="mermaid">{String(children).replace(/\n$/, '')}</div>;
                                                }
                                                return (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {currentContent}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed font-mono overflow-auto">
                                    {currentContent}
                                </pre>
                            )}
                        </CardContent>
                    </Card>

                    {/* Version History Sidebar */}
                    {overviewVersions.length > 0 && !isFullscreen && (
                        <Card className="w-80 shrink-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <HistoryIcon className="h-4 w-4" />
                                    Version History ({overviewVersions.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-[500px] overflow-auto">
                                <Button
                                    variant={selectedVersion === null ? 'default' : 'ghost'}
                                    className="w-full justify-start text-left h-auto py-2"
                                    onClick={() => setSelectedVersion(null)}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Current</span>
                                        <span className="text-xs text-muted-foreground">
                                            Updated {new Date(project.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Button>
                                {overviewVersions.map((version) => (
                                    <Button
                                        key={version.id}
                                        variant={selectedVersion?.id === version.id ? 'default' : 'ghost'}
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => setSelectedVersion(version)}
                                    >
                                        <div className="flex flex-col items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Version {version.version_number}</span>
                                                {version.is_base_version && (
                                                    <Badge variant="outline" className="text-xs">Base</Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(version.created_at).toLocaleDateString()}
                                            </span>
                                            {version.user_prompt && (
                                                <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                    "{version.user_prompt}"
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Project Info Footer */}
                {!isFullscreen && (
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <UserIcon className="h-4 w-4" />
                                        <span>Owner: {project.user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {overviewVersions.length > 0 && (
                                    <span>{overviewVersions.length} version{overviewVersions.length !== 1 ? 's' : ''}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
