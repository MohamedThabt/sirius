import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    CodeIcon,
    CopyIcon,
    DatabaseIcon,
    DownloadIcon,
    FileIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    PanelLeftClose,
    PanelLeftOpen,
    TrendingUpIcon,
    ZapIcon,
    ZoomInIcon,
    ZoomOutIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import mermaid from 'mermaid';

interface Project {
    id: number;
    name: string;
    status: string;
    c4: string | null;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    non_functional_requirements: string | null;
}

interface Props {
    content: string;
    title?: string;
    projectName?: string;
    project?: Project;
    sections?: Sections;
}

// Utility function to convert escaped Mermaid strings
const convertEscapedMermaid = (escapedString: string): string => {
    // Remove markdown code block markers
    let cleaned = escapedString.replace(/```mermaid\s*/g, '').replace(/```\s*$/g, '');

    // Convert escaped newlines to actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');

    // Clean up any remaining escape characters
    cleaned = cleaned.replace(/\\/g, '');

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
};

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

export default function MermaidPreview({
    content,
    title = 'Mermaid Diagram',
    projectName,
    project,
    sections,
}: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showCode, setShowCode] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = project
        ? [
              { title: project.name, href: `/projects/${project.id}` },
              { title: title, href: '#' },
          ]
        : [{ title: title, href: '#' }];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <CircleIcon className="h-3 w-3" />;
            case 'in_progress':
                return <ClockIcon className="h-3 w-3" />;
            case 'completed':
                return <CheckCircleIcon className="h-3 w-3" />;
            default:
                return <AlertCircleIcon className="h-3 w-3" />;
        }
    };

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
                          onClick: () =>
                              project.c4 ? router.get(`/projects/${project.id}/c4`) : router.post(`/projects/${project.id}/c4/generate`),
                      },
                      { key: 'technology', icon: CodeIcon, label: 'Technology Stack', onClick: () => router.get(`/projects/${project.id}/technology`) },
                  ],
              },
          ]
        : [];

    // Sync theme with application's global theme
    useEffect(() => {
        const detectTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        // Initial detection
        detectTheme();

        // Watch for theme changes
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
                        <aside
                            className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}
                        >
                            <div
                                className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                            >
                                <div className="overflow-y-auto scrollbar-hide">
                                    {/* Logo/Brand */}
                                <div className="mb-6 border-b pb-4">
                                    <a href="/" className="flex items-center text-lg font-bold text-foreground transition-opacity hover:opacity-80">
                                        Sirius
                                    </a>
                                </div>

                                    <div className="mb-6">
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h1 className="text-sm font-semibold truncate">{project.name}</h1>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-medium">{completionPercentage}%</span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary transition-all" style={{ width: `${completionPercentage}%` }} />
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px]">
                                                    {getHealthIcon()}
                                                    <span className="text-muted-foreground">{getHealthStatus()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <nav className="space-y-6">
                                        {navGroups.map((group) => (
                                            <div key={group.label} className="space-y-2">
                                                <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {group.label}
                                                </div>
                                                <ul className="space-y-1">
                                                    {group.items.map((item) => (
                                                        <li key={item.key}>
                                                            <button
                                                                onClick={item.disabled ? undefined : item.onClick}
                                                                disabled={item.disabled}
                                                                className={[
                                                                    'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                                    item.disabled
                                                                        ? 'cursor-not-allowed opacity-50'
                                                                        : item.active
                                                                            ? 'bg-muted font-medium text-foreground'
                                                                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                                    item.emphasize && !item.disabled ? 'font-medium text-foreground' : '',
                                                                ].join(' ')}
                                                                title={item.disabled ? 'Not available yet' : item.label}
                                                            >
                                                                <item.icon className="h-4 w-4 shrink-0" />
                                                                <span className={item.muted ? 'opacity-70' : ''}>{item.label}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </nav>
                                </div>

                                <div className="shrink-0 border-t pt-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                                                <Avatar className="h-5 w-5 shrink-0">
                                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                    <AvatarFallback className="text-[10px] bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                        {getInitials(auth.user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-xs font-medium text-foreground">{auth.user.name}</div>
                                                    <div className="truncate text-[10px] text-muted-foreground">{auth.user.email}</div>
                                                </div>
                                                <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <UserMenuContent user={auth.user} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </aside>

                        <main className="min-w-0 flex-1">
                            <div className="flex h-screen flex-col">
                                <div className="border-b px-4 py-3 sm:pl-6 lg:pl-6">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
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
