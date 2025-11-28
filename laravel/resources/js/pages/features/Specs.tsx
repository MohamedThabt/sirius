import FeatureSidebar from '@/components/Features/FeatureSidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, usePage } from '@inertiajs/react';
import { CheckIcon, CopyIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface Project {
    id: number;
    name: string;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string | null;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
}

interface Props {
    project: Project;
    feature: FeatureItem;
    specsMarkdown: string;
}

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
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return `${nodeId}[${fixedContent || 'Unnamed'}]`;
    });

    cleaned = cleaned.replace(/\[([^\]]*)\]/g, (match, content) => {
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return `[${fixedContent}]`;
    });

    return cleaned;
};

export default function Specs({ project, feature, specsMarkdown }: Props) {
    useFlashToasts();
    const { auth } = usePage().props as any;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const MermaidCode = ({ children, id }: { children: string; id: string }) => {
        const [copied, setCopied] = useState(false);

        const copyCode = async () => {
            try {
                const cleanCode = convertEscapedMermaid(children);
                await navigator.clipboard.writeText(cleanCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        };

        return (
            <div className="my-4">
                <div className="mb-3 flex items-center justify-end">
                    <Button variant="outline" size="sm" onClick={copyCode} className="h-8 text-xs" aria-live="polite">
                        {copied ? (
                            <>
                                <CheckIcon className="mr-1 h-3 w-3 text-emerald-600" />
                                Copied
                            </>
                        ) : (
                            <>
                                <CopyIcon className="mr-1 h-3 w-3" />
                                Copy Code
                            </>
                        )}
                    </Button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <pre className="text-sm text-slate-700 dark:text-slate-300">
                        <code>{convertEscapedMermaid(children)}</code>
                    </pre>
                </div>
            </div>
        );
    };

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: feature.name, href: `/features/${feature.id}` },
        { title: 'Specifications', href: `/features/${feature.id}/specs` },
    ];

    return (
        <>
            <Head title={`Specs: ${feature.name}`} />
            <div className="min-h-screen bg-background">
                <div className="flex">
                    <FeatureSidebar
                        project={project}
                        feature={feature}
                        activeSection="specs"
                        auth={auth}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    />
                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-6 flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    title={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
                                >
                                    {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                                </Button>
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            <header className="mb-8">
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Feature Specifications</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">{feature.name}</p>
                                </div>
                            </header>

                            <div className="space-y-6">
                                <div className="rounded border bg-background p-6">
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
                                                        const codeId = `mermaid-${Date.now()}-${Math.random()}`;
                                                        return <MermaidCode id={codeId}>{String(children).replace(/\n$/, '')}</MermaidCode>;
                                                    }

                                                    return (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        >
                                            {specsMarkdown}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
