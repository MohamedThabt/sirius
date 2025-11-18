import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { ArrowLeftIcon, CodeIcon, CopyIcon, DownloadIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
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

export default function PRDPreview({ content, title, projectName, project }: Props) {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showCode, setShowCode] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        mermaid.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            fontSize: 18,
            flowchart: {
                htmlLabels: true,
                curve: 'basis',
                padding: 20,
            },
            themeVariables: {
                fontSize: '18px',
            },
        });
    }, [isDarkMode]);

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                setError('');
                const cleanContent = convertEscapedMermaid(content);

                const { svg: renderedSvg } = await mermaid.render(`mermaid-preview-${Date.now()}`, cleanContent);
                setSvg(renderedSvg);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(err instanceof Error ? err.message : 'Failed to render diagram');
            }
        };

        if (content.trim()) {
            renderDiagram();
        }
    }, [content]);

    const copyCode = async () => {
        try {
            const cleanCode = convertEscapedMermaid(content);
            await navigator.clipboard.writeText(cleanCode);
            toast.success('Code copied to clipboard!');
        } catch {
            toast.error('Failed to copy code');
        }
    };

    const downloadSVG = () => {
        if (!svg) return;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName ? projectName + '-' : ''}mermaid-diagram.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Diagram downloaded!');
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

    return (
        <>
            <Head title={`${title} - ${projectName}`} />

            <div className="min-h-screen bg-background">
                <div className="flex h-screen flex-col">
                    {/* Header */}
                    <div className="border-b px-6 py-3">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <a href={`/admin/projects/${project.id}/prd`}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                        Back to PRD
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
                                    {showCode ? 'Show Diagram' : 'Show Code'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={copyCode}>
                                    <CopyIcon className="mr-2 h-4 w-4" />
                                    Copy Code
                                </Button>
                                {svg && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={downloadSVG}>
                                            <DownloadIcon className="mr-2 h-4 w-4" />
                                            Download SVG
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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                        {error ? (
                            <div className="mx-auto max-w-4xl rounded border border-destructive bg-destructive/10 p-6">
                                <h2 className="mb-2 text-lg font-semibold text-destructive-foreground">Mermaid Diagram Error</h2>
                                <p className="text-sm text-destructive-foreground">{error}</p>
                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-medium text-destructive-foreground hover:underline">
                                        Show debugging info
                                    </summary>
                                    <div className="mt-2 space-y-2">
                                        <div>
                                            <p className="text-xs font-medium text-destructive-foreground">Raw code:</p>
                                            <pre className="mt-1 overflow-x-auto rounded border bg-muted p-3 text-xs">
                                                {content}
                                            </pre>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-destructive-foreground">Cleaned code:</p>
                                            <pre className="mt-1 overflow-x-auto rounded border bg-muted p-3 text-xs">
                                                {convertEscapedMermaid(content)}
                                            </pre>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        ) : showCode ? (
                            <div className="mx-auto max-w-6xl rounded border p-6">
                                <pre className="overflow-x-auto text-sm">
                                    <code>{convertEscapedMermaid(content)}</code>
                                </pre>
                            </div>
                        ) : svg ? (
                            <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center overflow-auto">
                                <div
                                    className="inline-block rounded border bg-background p-12 transition-transform"
                                    style={{
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: 'center',
                                        minWidth: '60%',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-12">
                                <div className="text-center">
                                    <div className="mb-4 text-4xl">🔄</div>
                                    <p className="text-muted-foreground">Rendering diagram...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}