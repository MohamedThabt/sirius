import { MermaidDiagram } from '@/components/MermaidDiagram';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeftIcon, CodeIcon, CopyIcon } from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
    status: string;
    user: User;
}

interface Props {
    content: string;
    title: string;
    projectName: string;
    project: Project;
}

// Mermaid initialization with theme awareness
const initializeMermaid = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    mermaid.initialize({
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    });
};

export default function OverviewPreview({ content, title, projectName, project }: Props) {
    const [showCode, setShowCode] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Projects',
            href: '/admin/projects',
        },
        {
            title: projectName,
            href: `/admin/projects/${project.id}`,
        },
        {
            title: title,
            href: '#',
        },
    ];

    // Initialize mermaid on mount
    useEffect(() => {
        initializeMermaid();

        // Re-initialize on theme change
        const observer = new MutationObserver(() => {
            initializeMermaid();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success('Content copied to clipboard!');
        } catch {
            toast.error('Failed to copy content');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${title} - ${projectName}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <a href={`/admin/projects/${project.id}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Back to Project
                                </Button>
                            </a>
                            <div>
                                <h1 className="text-lg font-semibold">{title}</h1>
                                <p className="text-sm text-muted-foreground">{projectName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
                                <CodeIcon className="mr-2 h-4 w-4" />
                                {showCode ? 'Show Preview' : 'Show Markdown'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={copyCode}>
                                <CopyIcon className="mr-2 h-4 w-4" />
                                Copy Content
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[100vh] flex-1 overflow-auto rounded-xl border border-sidebar-border/70 bg-card p-4 sm:p-6 md:min-h-min dark:border-sidebar-border">
                    {showCode ? (
                        <div className="mx-auto max-w-6xl">
                            <pre className="overflow-x-auto text-sm whitespace-pre-wrap">
                                <code>{content}</code>
                            </pre>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert mx-auto max-w-4xl">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    code({ className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const language = match ? match[1] : '';
                                        const isInline = !className?.includes('language-');

                                        if (language === 'mermaid' && !isInline) {
                                            return (
                                                <MermaidDiagram projectId={project.id} previewTitle={title}>
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
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
