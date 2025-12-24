import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, FileTextIcon, Download, Maximize2, Minimize2, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { Code as CodeIcon } from 'lucide-react';
import { TextShimmer } from '@/components/ui/text-shimmer';

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

interface Project {
    id: number;
    name: string;
    prd: string;
    prd_is_synced: boolean;
    prd_last_synced_at: string | null;
    status: string;
    user: User;
}

interface Props {
    project: Project;
    featuresMarkdown?: string;
}

// Utility function to convert escaped Mermaid strings
const convertEscapedMermaid = (escapedString: string): string => {
    let cleaned = escapedString.replace(/```mermaid\s*/g, '').replace(/```\s*$/g, '');
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\(?!n)/g, '');
    cleaned = cleaned
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');
    cleaned = cleaned.replace(/(\w+)\s*\[\[([^\]]*)\]\]/g, (match, nodeId, content) => {
        const escapedContent = content.replace(/"/g, '&quot;');
        return `${nodeId}["${escapedContent}"]`;
    });
    cleaned = cleaned.replace(/\[([^\]]*)\]/g, (match, content) => {
        if (content.includes('"')) {
            return match;
        }
        const escapedContent = content.replace(/"/g, '&quot;');
        return `["${escapedContent}"]`;
    });
    cleaned = cleaned.replace(/\((\s*[^()]+?\s*)\)/g, (match, content) => {
        if (content.includes('"')) {
            return match;
        }
        const escapedContent = content.trim().replace(/"/g, '&quot;');
        return `("${escapedContent}")`;
    });
    const lines = cleaned.split('\n');
    const newLines: string[] = [];
    const seenNodes = new Set<string>();
    const subgraphs = new Set<string>();
    for (const line of lines) {
        const nodeMatch = line.match(/^(\w+)\[/);
        if (nodeMatch) {
            seenNodes.add(nodeMatch[1]);
        }
        const subgraphMatch = line.match(/^subgraph\s+([^\s[{]+)/);
        if (subgraphMatch) {
            subgraphs.add(subgraphMatch[1]);
        }
    }
    for (let line of lines) {
        const edgeLabelMatch = line.match(/(\w+)\s*--\s*([^|>~\-*\s"][^|>~\-*\n]*?)\s*-->\s*(\w+)/);
        if (edgeLabelMatch) {
            const [, source, label, target] = edgeLabelMatch;
            const trimmedLabel = label.trim();
            if (!trimmedLabel.match(/^".*"$/)) {
                const escapedLabel = trimmedLabel.replace(/"/g, '&quot;');
                line = `${source} -- "${escapedLabel}" --> ${target}`;
            }
        }
        newLines.push(line);
    }
    cleaned = newLines.join('\n');
    cleaned = cleaned.replace(/subgraph\s+([^\s[{]+)\s*\[\s*([^\]]*?)\s*\]/g, 'subgraph $1 [$2]');
    cleaned = cleaned.replace(/subgraph\s+([^\s[{]+)/g, (match, name) => {
        return `subgraph ${name.replace(/_/g, ' ')}`;
    });
    return cleaned.trim();
};

export default function ProjectPRD({ project, featuresMarkdown = '' }: Props) {
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
            title: 'PRD',
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
        const blob = new Blob([project.prd], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name.toLowerCase().replace(/[^a-z0-9-]+/gi, '-')}-prd.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('PRD downloaded successfully!');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(project.prd);
            toast.success('PRD copied to clipboard!');
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const openInNewTab = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/projects/${project.id}/prd/preview`;
        form.target = '_blank';

        const csrfToken =
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
            document.querySelector('meta[name="_token"]')?.getAttribute('content');

        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        const contentInput = document.createElement('input');
        contentInput.type = 'hidden';
        contentInput.name = 'content';
        contentInput.value = project.prd;
        form.appendChild(contentInput);

        const titleInput = document.createElement('input');
        titleInput.type = 'hidden';
        titleInput.name = 'title';
        titleInput.value = 'PRD';
        form.appendChild(titleInput);

        const projectNameInput = document.createElement('input');
        projectNameInput.type = 'hidden';
        projectNameInput.name = 'projectName';
        projectNameInput.value = project.name;
        form.appendChild(projectNameInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    // Mermaid Diagram Component
    const MermaidDiagram = ({ children }: { children: string }) => {
        const [svg, setSvg] = useState<string>('');
        const [error, setError] = useState<string>('');
        const [showCode, setShowCode] = useState(false);
        const [copied, setCopied] = useState(false);

        useEffect(() => {
            const renderDiagram = async () => {
                try {
                    setError('');
                    const cleanChildren = convertEscapedMermaid(children);
                    const { svg: renderedSvg } = await mermaid.render(`mermaid${Date.now()}${Math.random().toString(36).substring(2, 9)}`, cleanChildren);
                    setSvg(renderedSvg);
                } catch (err) {
                    console.error('Mermaid rendering error:', err);
                    setError(err instanceof Error ? err.message : 'Failed to render diagram');
                }
            };

            if (children.trim()) {
                renderDiagram();
            }
        }, [children]);

        const copyCode = async () => {
            try {
                const cleanCode = convertEscapedMermaid(children);
                await navigator.clipboard.writeText(cleanCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
            } catch {
                toast.error('Failed to copy code');
            }
        };

        const openDiagramInNewTab = () => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/admin/projects/${project.id}/prd/preview`;
            form.target = '_blank';

            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content');

            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            const contentInput = document.createElement('input');
            contentInput.type = 'hidden';
            contentInput.name = 'content';
            contentInput.value = children;
            form.appendChild(contentInput);

            const titleInput = document.createElement('input');
            titleInput.type = 'hidden';
            titleInput.name = 'title';
            titleInput.value = 'Mermaid Diagram';
            form.appendChild(titleInput);

            const projectNameInput = document.createElement('input');
            projectNameInput.type = 'hidden';
            projectNameInput.name = 'projectName';
            projectNameInput.value = project.name;
            form.appendChild(projectNameInput);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        };

        if (error) {
            return (
                <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <div className="mb-2">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            <strong>Mermaid Diagram Error</strong>
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                    <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-red-500 hover:underline dark:text-red-400">Show code</summary>
                        <pre className="mt-2 overflow-x-auto rounded bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {children}
                        </pre>
                    </details>
                </div>
            );
        }

        if (!svg) {
            return (
                <div className="my-4 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-800">
                    <TextShimmer className="text-sm text-slate-500 dark:text-slate-400">Rendering diagram...</TextShimmer>
                </div>
            );
        }

        return (
            <div className="my-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)} className="h-8 text-xs">
                            <CodeIcon className="mr-1 h-3 w-3" />
                            {showCode ? 'Show Diagram' : 'Show Code'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyCode} className="h-8 text-xs">
                            <Copy className="mr-1 h-3 w-3" />
                            {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={openDiagramInNewTab} className="h-8 text-xs">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Open Diagram
                        </Button>
                    </div>
                </div>
                {showCode ? (
                    <pre className="overflow-x-auto rounded-lg border bg-slate-50 p-4 text-xs dark:bg-slate-900">
                        <code>{convertEscapedMermaid(children)}</code>
                    </pre>
                ) : (
                    <div
                        className="overflow-auto rounded-lg border bg-white p-4 dark:bg-slate-900"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                )}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`PRD - ${project.name}`} />

            <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full flex-1 gap-6 rounded-xl'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between gap-4 ${isFullscreen ? 'border-b p-4' : 'p-4'}`}>
                    <div className="flex items-center gap-4 min-w-0">
                        {!isFullscreen && (
                            <Link href={`/admin/projects/${project.id}`}>
                                <Button variant="outline" size="sm" className="whitespace-nowrap">
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Back to Project
                                </Button>
                            </Link>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold">Product Requirements Document</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground truncate">{project.name}</p>
                                {!project.prd_is_synced && (
                                    <Badge variant="destructive" className="text-xs">
                                        Out of Sync
                                    </Badge>
                                )}
                            </div>
                            {project.prd_last_synced_at && (
                                <p className="text-xs text-muted-foreground">
                                    Last synced: {new Date(project.prd_last_synced_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {!project.prd_is_synced && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                    if (confirm('Synchronize PRD with current modules and features? This will update the PRD to reflect all recent changes.')) {
                                        router.post(`/admin/projects/${project.id}/prd/sync`);
                                    }
                                }}
                                className="whitespace-nowrap"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sync PRD
                            </Button>
                        )}
                        <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="outline" size="sm" onClick={openInNewTab} className="whitespace-nowrap">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in New Tab
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="whitespace-nowrap">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="whitespace-nowrap">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={toggleFullscreen} className="whitespace-nowrap">
                            {isFullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                            {isFullscreen ? 'Exit' : 'Fullscreen'}
                        </Button>
                    </div>
                </div>

                {/* PRD Content */}
                <div className={`${isFullscreen ? 'flex-1 overflow-auto p-4' : 'flex-1 overflow-auto px-4 pb-4'}`}>
                    <Card className={isFullscreen ? 'h-full' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileTextIcon className="h-5 w-5" />
                                Document Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className={isFullscreen ? 'h-[calc(100%-5rem)] overflow-auto' : ''}>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code: ({ className, children }) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : '';

                                            if (language === 'mermaid') {
                                                return <MermaidDiagram>{String(children).replace(/\n$/, '')}</MermaidDiagram>;
                                            }

                                            return <code className={className}>{children}</code>;
                                        },
                                    }}
                                >
                                    {project.prd}
                                </ReactMarkdown>
                                {featuresMarkdown && (
                                    <div className="mt-8">
                                        <h2 className="mb-4 text-2xl font-bold">Features</h2>
                                        <ReactMarkdown
                                            components={{
                                                code: ({ className, children }) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const language = match ? match[1] : '';

                                                    if (language === 'mermaid') {
                                                        return <MermaidDiagram>{String(children).replace(/\n$/, '')}</MermaidDiagram>;
                                                    }

                                                    return <code className={className}>{children}</code>;
                                                },
                                            }}
                                        >
                                            {featuresMarkdown}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
