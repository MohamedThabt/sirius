import { Breadcrumbs } from '@/components/breadcrumbs';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useInitials } from '@/hooks/use-initials';
import { useThemeDetection } from '@/hooks/use-theme-detection';
import { type Project, type Sections, type User } from '@/types';
import { convertEscapedMermaid } from '@/utils/mermaid';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    CodeIcon,
    CopyIcon,
    DatabaseIcon,
    DownloadIcon,
    FileIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    MenuIcon,
    TrendingUpIcon,
    ZapIcon,
    ZoomInIcon,
    ZoomOutIcon,
} from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useMemo, useState } from 'react';

// Project and Sections types now imported from @/types

interface Props {
    content: string;
    title?: string;
    projectName?: string;
    project?: Project;
    sections?: Sections;
}

// convertEscapedMermaid now imported from '@/utils/mermaid'

// Utility function to validate Mermaid syntax
// const validateMermaidSyntax = (code: string): { isValid: boolean; error?: string } => {
//     try {
//         if (!code.trim()) {
//             return { isValid: false, error: 'Empty diagram code' };
//         }
//
//         const diagramTypes = [
//             'graph',
//             'flowchart',
//             'sequenceDiagram',
//             'classDiagram',
//             'stateDiagram',
//             'erDiagram',
//             'journey',
//             'gantt',
//             'pie',
//             'gitgraph',
//         ];
//         const hasValidType = diagramTypes.some((type) => code.toLowerCase().includes(type.toLowerCase()));
//
//         if (!hasValidType) {
//             return {
//                 isValid: false,
//                 error: 'No valid Mermaid diagram type found.',
//             };
//         }
//
//         return { isValid: true };
//     } catch (error) {
//         return { isValid: false, error: 'Syntax validation failed' };
//     }
// };

// Minimal stub to keep calls working while the validator is commented out
const validateMermaidSyntax = (_code: string): { isValid: boolean; error?: string } => ({ isValid: true });

export default function MermaidPreview({ content, title = 'Mermaid Diagram', projectName, project, sections }: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showCode, setShowCode] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // WHY: Replaced ~20 lines of MutationObserver logic with shared hook
    const theme = useThemeDetection();
    const isDarkMode = theme === 'dark';

    const breadcrumbs = project
        ? [
              { title: project.name, href: `/projects/${project.id}` },
              { title: title, href: '#' },
          ]
        : [{ title: title, href: '#' }];

    // getStatusColor now imported from @/utils/status-colors

    interface NavItem {
        key: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        muted?: boolean;
        emphasize?: boolean;
        active?: boolean;
        disabled?: boolean;
        onClick: () => void;
    }

    interface NavGroup {
        label: string;
        items: NavItem[];
    }

    const completionPercentage = useMemo(() => {
        const total = 5;
        let done = 0;
        if (sections?.overview) done++;
        if (sections?.prd) done++;
        if (sections?.data_modeling) done++;
        if (project?.c4) done++;
        if (sections?.non_functional_requirements) done++;
        return Math.round((done / total) * 100);
    }, [sections, project?.c4]);

    const getHealthIcon = () => {
        if (completionPercentage >= 80) return <CheckCircleIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-300" />;
        if (completionPercentage >= 60) return <TrendingUpIcon className="h-3 w-3 text-blue-600 dark:text-blue-300" />;
        if (completionPercentage >= 40) return <AlertCircleIcon className="h-3 w-3 text-orange-600 dark:text-orange-300" />;
        return <AlertCircleIcon className="h-3 w-3 text-red-600 dark:text-red-300" />;
    };

    const getHealthStatus = () => {
        if (completionPercentage >= 80) return 'excellent';
        if (completionPercentage >= 60) return 'good';
        if (completionPercentage >= 40) return 'fair';
        return 'needs attention';
    };

    const navGroups: NavGroup[] = project
        ? [
              {
                  label: 'Plan',
                  items: [
                      { key: 'home', icon: HomeIcon, label: 'Project Home', onClick: () => router.visit(`/projects/${project.id}`) },
                      {
                          key: 'overview',
                          icon: FileIcon,
                          label: 'System Overview',
                          muted: !sections?.overview,
                          disabled: !sections?.overview,
                          onClick: () => sections?.overview && router.get(`/projects/${project.id}/system-overview`),
                      },
                      {
                          key: 'prd',
                          icon: FileIcon,
                          label: sections?.prd ? 'PRD' : 'Generate PRD',
                          emphasize: !sections?.prd,
                          disabled: !sections?.prd,
                          onClick: () =>
                              sections?.prd ? router.get(`/projects/${project.id}/prd`) : router.post(`/projects/${project.id}/prd/generate`),
                      },
                      { key: 'features', icon: ZapIcon, label: 'Features', onClick: () => router.visit(`/projects/${project.id}`) },
                  ],
              },
              {
                  label: 'Design',
                  items: [
                      {
                          key: 'brainstorming',
                          icon: LightbulbIcon,
                          label: 'Brainstorming',
                          onClick: () => router.get(`/projects/${project.id}/brainstorming`),
                      },
                  ],
              },
              {
                  label: 'Technical',
                  items: [
                      {
                          key: 'erd',
                          icon: DatabaseIcon,
                          label: 'Database Designer',
                          muted: !sections?.data_modeling,
                          disabled: !sections?.data_modeling,
                          onClick: () => sections?.data_modeling && router.get(`/projects/${project.id}/erd`),
                      },
                      {
                          key: 'c4',
                          icon: LayersIcon,
                          label: project.c4 ? 'System Architecture' : 'Generate C4',
                          emphasize: !project.c4,
                          disabled: !project.c4,
                          onClick: () => (project.c4 ? router.get(`/projects/${project.id}/c4`) : router.post(`/projects/${project.id}/c4/generate`)),
                      },
                      {
                          key: 'technology',
                          icon: CodeIcon,
                          label: 'Technology Stack',
                          onClick: () => router.get(`/projects/${project.id}/technology`),
                      },
                  ],
              },
          ]
        : [];

    // Theme detection now handled by useThemeDetection hook

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
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

                const validation = validateMermaidSyntax(cleanContent);
                if (!validation.isValid) {
                    setError(validation.error || 'Invalid Mermaid syntax');
                    return;
                }

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
        } catch (err) {
            console.error('Failed to copy code:', err);
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
                            health={getHealthStatus()}
                            isCollapsed={isSidebarCollapsed}
                            user={auth.user}
                        />

                        <main className="min-w-0 flex-1">
                            <div className="flex h-screen flex-col">
                                <div className="border-b px-4 py-3 sm:pl-6 lg:pl-6">
                                    <div className="mb-4 flex items-center justify-between gap-3">
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
                                                        health={getHealthStatus()}
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
                                                        <pre className="mt-1 overflow-x-auto rounded border bg-muted p-3 text-xs">{content}</pre>
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
                        </main>
                    </div>
                ) : (
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-2xl font-semibold">{title}</h1>
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

                        {error ? (
                            <div className="mx-auto max-w-4xl rounded border border-destructive bg-destructive/10 p-6">
                                <h2 className="mb-2 text-lg font-semibold text-destructive-foreground">Mermaid Diagram Error</h2>
                                <p className="text-sm text-destructive-foreground">{error}</p>
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
                )}
            </div>
        </>
    );
}
