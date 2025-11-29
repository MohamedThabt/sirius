import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { ArrowLeftIcon, CodeIcon, CopyIcon, DownloadIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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

// Utility function to convert escaped Mermaid strings
const convertEscapedMermaid = (escapedString: string): string => {
    let cleaned = escapedString.replace(/```mermaid\s*/g, '').replace(/```\s*$/g, '');
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\/g, '');
    cleaned = cleaned.trim();
    return cleaned;
};

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

export default function OverviewPreview({ content, title, projectName, project }: Props) {
    const [showCode, setShowCode] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    // Sync theme with application's global theme
    useEffect(() => {
        const detectTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        detectTheme();

        const observer = new MutationObserver(detectTheme);
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
                    <div className="flex items-center justify-between gap-3">
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
                <div className="min-h-[100vh] flex-1 overflow-auto rounded-xl border border-sidebar-border/70 bg-card p-6 md:min-h-min dark:border-sidebar-border">
                    {showCode ? (
                        <div className="mx-auto max-w-6xl">
                            <pre className="overflow-x-auto text-sm whitespace-pre-wrap">
                                <code>{content}</code>
                            </pre>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-4xl prose dark:prose-invert">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
