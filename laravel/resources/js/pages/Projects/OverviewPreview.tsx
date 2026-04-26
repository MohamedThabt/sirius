import { Breadcrumbs } from '@/components/breadcrumbs';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type Sections, type User } from '@/types';
import { getHealthStatus } from '@/utils/project-status';
import { Head, usePage } from '@inertiajs/react';
import { CodeIcon, CopyIcon, DownloadIcon, MenuIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface Props {
    content: string;
    title?: string;
    projectName?: string;
    project?: Project;
    sections?: Sections;
}

export default function OverviewPreview({ content, title = 'System Overview', projectName, project }: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [showCode, setShowCode] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = project
        ? [
              { title: project.name, href: `/projects/${project.id}` },
              { title: 'System Overview', href: `/projects/${project.id}/system-overview` },
              { title: 'Preview', href: '#' },
          ]
        : [{ title: title, href: '#' }];

    const completionPercentage = useMemo(() => {
        return project?.progress ?? 0;
    }, [project]);

    const health = useMemo(() => {
        return getHealthStatus(completionPercentage);
    }, [completionPercentage]);

    const navGroups = useMemo(() => {
        if (!project) {
            return [];
        }

        return buildProjectNavGroups({
            project,
            currentPage: 'overview',
        });
    }, [project]);

    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText(content);
        } catch (err) {
            console.error('Failed to copy content:', err);
        }
    };

    const downloadMarkdown = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName ? projectName + '-' : ''}system-overview.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

    return (
        <>
            <Head title={`${title} - ${projectName || 'Preview'}`} />

            <div className="min-h-screen bg-background">
                {project ? (
                    <div className="flex">
                        <ProjectSidebarPanel
                            project={project}
                            navGroups={navGroups}
                            completionPercentage={completionPercentage}
                            health={health}
                            isCollapsed={isSidebarCollapsed}
                            user={auth.user}
                        />

                        <main className="min-w-0 flex-1">
                            <div className="flex h-screen flex-col">
                                <div className="border-b px-4 py-3 sm:pl-6 lg:pl-6">
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
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
                                                    <ProjectSidebarPanel
                                                        project={project}
                                                        navGroups={navGroups}
                                                        completionPercentage={completionPercentage}
                                                        health={health}
                                                        isCollapsed={false}
                                                        user={auth.user}
                                                        isMobileSheet={true}
                                                    />
                                                </SheetContent>
                                            </Sheet>
                                            <SidebarToggle
                                                isCollapsed={isSidebarCollapsed}
                                                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                            />
                                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
                                                <CodeIcon className="mr-2 h-4 w-4" />
                                                <span className="hidden sm:inline">{showCode ? 'Show Preview' : 'Show Markdown'}</span>
                                                <span className="sm:hidden">{showCode ? 'Preview' : 'MD'}</span>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={copyContent}>
                                                <CopyIcon className="mr-2 h-4 w-4" />
                                                <span className="hidden sm:inline">Copy</span>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                                                <DownloadIcon className="mr-2 h-4 w-4" />
                                                <span className="hidden sm:inline">Download</span>
                                            </Button>
                                            <div className="flex items-center gap-1 border-l pl-2">
                                                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                                                    <ZoomOutIcon className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm font-medium">{zoom}%</span>
                                                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                                                    <ZoomInIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-4 sm:p-6 lg:p-8">
                                    {showCode ? (
                                        <div className="mx-auto max-w-6xl rounded border p-6">
                                            <pre className="overflow-x-auto text-sm whitespace-pre-wrap">
                                                <code>{content}</code>
                                            </pre>
                                        </div>
                                    ) : (
                                        <div
                                            className="mx-auto max-w-4xl rounded border bg-background p-8 transition-transform"
                                            style={{
                                                transform: `scale(${zoom / 100})`,
                                                transformOrigin: 'top center',
                                            }}
                                        >
                                            <div className="prose prose-slate dark:prose-invert prose-table-bordered max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw]}
                                                    components={{
                                                        code: ({ className, children, ...props }) => {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const language = match ? match[1] : '';
                                                            const isInline = !className?.includes('language-');

                                                            if (language === 'mermaid' && !isInline) {
                                                                return (
                                                                    <MermaidDiagram projectId={project?.id} previewTitle="System Overview Diagram">
                                                                        {String(children).replace(/\n$/, '')}
                                                                    </MermaidDiagram>
                                                                );
                                                            }

                                                            return (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                    }}
                                                >
                                                    {content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </main>
                    </div>
                ) : (
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-2xl font-semibold">{title}</h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
                                    <CodeIcon className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{showCode ? 'Show Preview' : 'Show Markdown'}</span>
                                    <span className="sm:hidden">{showCode ? 'Preview' : 'MD'}</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={copyContent}>
                                    <CopyIcon className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Copy</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Download</span>
                                </Button>
                                <div className="flex items-center gap-1 border-l pl-2">
                                    <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                                        <ZoomOutIcon className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium">{zoom}%</span>
                                    <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                                        <ZoomInIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {showCode ? (
                            <div className="mx-auto max-w-6xl rounded border p-6">
                                <pre className="overflow-x-auto text-sm whitespace-pre-wrap">
                                    <code>{content}</code>
                                </pre>
                            </div>
                        ) : (
                            <div
                                className="mx-auto max-w-4xl rounded border bg-background p-8 transition-transform"
                                style={{
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                <div className="prose prose-slate dark:prose-invert prose-table-bordered max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            code: ({ className, children, ...props }) => {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const language = match ? match[1] : '';
                                                const isInline = !className?.includes('language-');

                                                if (language === 'mermaid' && !isInline) {
                                                    return (
                                                        <MermaidDiagram previewTitle="System Overview Diagram">
                                                            {String(children).replace(/\n$/, '')}
                                                        </MermaidDiagram>
                                                    );
                                                }

                                                return (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
