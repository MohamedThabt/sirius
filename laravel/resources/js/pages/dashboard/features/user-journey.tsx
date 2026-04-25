import { MermaidViewerPane } from '@/components/database-designer/MermaidViewerPane';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Project {
    id: number;
    name: string;
}

interface Feature {
    id: number;
    name: string;
    project_id: number;
    user_journey?: string | null;
}

interface Props {
    project: Project;
    feature: Feature;
    initialContent?: string;
}

export default function UserJourney({ project, feature, initialContent }: Props) {
    const [content] = useState(initialContent ?? '');
    const [error, setError] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Features', href: `/admin/projects/${project.id}` },
        { title: feature.name, href: `/admin/features/${feature.id}` },
        { title: 'User Journey', href: '#' },
    ];

    const handleExport = () => {
        if (!content) {
            toast.error('No user journey to export');
            return;
        }
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${feature.name}-user-journey.mermaid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('User journey exported successfully!');
    };

    if (!isFullScreen) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`User Journey - ${feature.name}`} />

                <div className="mx-auto w-full max-w-7xl space-y-4 rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">User Journey</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Read-only view of {feature.name} user journey</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {content && (
                                <Button variant="outline" size="sm" onClick={handleExport}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setIsFullScreen(true)}>
                                <Maximize2 className="mr-2 h-4 w-4" />
                                Fullscreen
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card">
                        {content ? (
                            <div className="min-h-[600px]">
                                <MermaidViewerPane
                                    code={content}
                                    error={error}
                                    setError={setError}
                                    isFullScreen={false}
                                    onToggleFullScreen={() => setIsFullScreen(true)}
                                />
                            </div>
                        ) : (
                            <div className="flex min-h-[600px] items-center justify-center p-12">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-foreground">No User Journey</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        A user journey diagram has not been created for this feature yet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Fullscreen mode
    return (
        <>
            <Head title={`User Journey - ${feature.name}`} />
            <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">
                <div className="border-b bg-background px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">User Journey</h2>
                            <p className="text-xs text-muted-foreground">{feature.name}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsFullScreen(false)}>
                            <Minimize2 className="mr-2 h-4 w-4" />
                            Exit Fullscreen
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {content ? (
                        <MermaidViewerPane
                            code={content}
                            error={error}
                            setError={setError}
                            isFullScreen={true}
                            onToggleFullScreen={() => setIsFullScreen(false)}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No user journey available</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
