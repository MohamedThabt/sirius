import { Breadcrumbs } from '@/components/breadcrumbs';
import DiagramCanvas from '@/components/database-designer/DiagramCanvas';
import EditorPanel from '@/components/database-designer/EditorPanel';
import FormatSelector from '@/components/database-designer/FormatSelector';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useDBMLParser } from '@/hooks/useDBMLParser';
import { type User, type Project, type Sections } from '@/types';
import { exportAsSQL } from '@/utils/exportUtils';
import { convertFormat, detectFormat, DiagramFormat } from '@/utils/formatConverters';
import { getHealthStatus } from '@/utils/project-status';
import { Head, router, usePage } from '@inertiajs/react';
import { BackgroundVariant } from '@xyflow/react';
import { ChevronLeft, ChevronRight, CodeIcon, Database as DatabaseIcon, Download, FileCode, FileIcon, FileText, Grid3X3, Layers, Maximize2, MenuIcon, Palette, Plus, Search, Snowflake, TreePine } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useIsDarkMode } from '@/hooks/use-theme-detection';
import { useResizablePanel } from '@/hooks/use-resizable-panel';

// WHY: Removed ~25 lines of duplicate interface definitions.
// Types now imported from '@/types'

interface Props {
    project: Project;
    initialContent?: string;
    sections?: Sections;
}

export default function DatabaseDesigner({ project, initialContent, sections }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [content, setContent] = useState(initialContent ?? '');
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
    const [backgroundOptions, setBackgroundOptions] = useState({
        gap: 20,
        size: 1,
    });
    const [isConverting, setIsConverting] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { nodes, edges, error, isLoading } = useDBMLParser(content);
    const [layoutTrigger, setLayoutTrigger] = useState<{ algorithm: string; timestamp: number } | null>(null);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // WHY: Replaced ~20 lines of MutationObserver logic with shared hook
    const isDarkMode = useIsDarkMode();

    // WHY: Replaced ~50 lines of resize logic with shared hook
    const { width: leftWidth, isResizing, handleMouseDown, containerRef } = useResizablePanel({
        initialWidth: 50,
        minWidth: 20,
        maxWidth: 80,
    });

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Database Designer', href: `/projects/${project.id}/erd` },
    ];

    const completionPercentage = useMemo(() => {
        return project?.progress ?? 0;
    }, [project]);

    const health = useMemo(() => {
        return getHealthStatus(completionPercentage);
    }, [completionPercentage]);

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'erd',
            }),
        [project],
    );

    // Theme detection now handled by useIsDarkMode hook

    // Sync editor content when initialContent changes
    useEffect(() => {
        if (typeof initialContent === 'string' && initialContent.trim()) {
            setContent(initialContent);
        }
    }, [initialContent]);

    // Theme toggle removed - use navbar theme toggle instead

    const toggleFullScreen = () => {
        const newFullScreenState = !isFullScreen;
        setIsFullScreen(newFullScreenState);
        if (newFullScreenState) {
            setIsEditorCollapsed(true); // Auto-collapse editor in full screen
        } else {
            setIsEditorCollapsed(false); // Auto-expand editor when exiting full screen
        }
    };

    const handleExportMermaid = () => {
        try {
            const currentFormat = detectFormat(content);
            const mermaidContent = currentFormat === 'dbml' ? convertFormat(content, 'dbml', 'mermaid') : content;
            const blob = new Blob([mermaidContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}-er-diagram.mermaid`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Mermaid schema exported successfully!');
        } catch (error) {
            toast.error('Failed to export Mermaid. Please check your schema.');
        }
    };

    const handleExportSQL = () => {
        try {
            const currentFormat = detectFormat(content);
            const dbmlContent = currentFormat === 'mermaid' ? convertFormat(content, 'mermaid', 'dbml') : content;
            exportAsSQL(dbmlContent, 'postgresql');
            toast.success('SQL schema exported successfully!');
        } catch (error) {
            toast.error('Failed to export SQL. Please check your schema.');
        }
    };

    const handleConvert = async () => {
        setIsConverting(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const currentFormat = detectFormat(content);
            const targetFormat: DiagramFormat = currentFormat === 'dbml' ? 'mermaid' : 'dbml';
            const convertedContent = convertFormat(content, currentFormat, targetFormat);

            setContent(convertedContent);
            toast.success(`Converted to ${targetFormat.toUpperCase()} format.`);
        } catch (error) {
            toast.error('Failed to convert format. Please check your schema.');
        } finally {
            setIsConverting(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleArrange = (algorithm: string) => {
        if (!canvasRef.current) return;

        // Trigger layout in DiagramCanvas
        setLayoutTrigger({ algorithm, timestamp: Date.now() });
        toast.success(`Applied ${algorithm} layout algorithm.`);
    };

    const handleBackgroundChange = (variant: BackgroundVariant, options?: any) => {
        setBackgroundVariant(variant);
        if (options) {
            setBackgroundOptions(options);
        }
        toast.success('Canvas background style changed.');
    };

    // Resize logic now handled by useResizablePanel hook

    return (
        <>
            <Head title={`Database Designer - ${project.name}`} />

            <div className="min-h-screen bg-background">
                {!isFullScreen && (
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
                                <div className="border-b bg-background">
                                    {/* Breadcrumbs Row */}
                                    <div className="px-4 py-3 sm:pl-6 lg:pl-6">
                                        <div className="flex items-center gap-3">
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0 border border-border/50 bg-background hover:bg-muted">
                                                        <MenuIcon className="h-4 w-4" />
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent side="left" className="w-64 p-0 border-none bg-transparent">
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
                                    </div>

                                    {/* Tools Row */}
                                    {!isFullScreen && (
                                        <div className="border-t px-4 py-3 sm:pl-6 lg:pl-6">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                {/* Search */}
                                                <div className="relative max-w-md min-w-[200px] flex-1">
                                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search tables and fields..."
                                                        value={localSearch}
                                                        onChange={(e) => {
                                                            setLocalSearch(e.target.value);
                                                            handleSearch(e.target.value);
                                                        }}
                                                        className="pl-10"
                                                    />
                                                </div>

                                                {/* Toolbar Actions */}
                                                <div className="flex items-center gap-2">
                                                    {/* Arrange Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <TreePine className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">Arrange</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Layout Algorithms</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleArrange('grid')}>
                                                                <Grid3X3 className="mr-2 h-4 w-4" />
                                                                Grid Layout
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleArrange('dagre')}>
                                                                <TreePine className="mr-2 h-4 w-4" />
                                                                Hierarchical (Dagre)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleArrange('snowflake')}>
                                                                <Snowflake className="mr-2 h-4 w-4" />
                                                                Snowflake
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    {/* Background Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Palette className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">Background</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Background Style</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange(BackgroundVariant.Dots)}>
                                                                <Grid3X3 className="mr-2 h-4 w-4" />
                                                                Dots
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange(BackgroundVariant.Lines)}>
                                                                <Layers className="mr-2 h-4 w-4" />
                                                                Lines
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange(BackgroundVariant.Cross)}>
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Cross
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange('none' as any)}>
                                                                None
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Separator orientation="vertical" className="h-6" />

                                                    {/* Export Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">Export</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={handleExportMermaid}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">Mermaid ERD</span>
                                                                    <span className="text-xs text-muted-foreground">Export as .mermaid file</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={handleExportSQL}>
                                                                <FileCode className="mr-2 h-4 w-4" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">SQL Script</span>
                                                                    <span className="text-xs text-muted-foreground">Export as .sql file</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Separator orientation="vertical" className="h-6" />

                                                    {/* Fullscreen Button */}
                                                    <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                                                        <Maximize2 className="mr-2 h-4 w-4" />
                                                        <span className="hidden sm:inline">Fullscreen</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col overflow-hidden bg-background text-foreground">
                                    <div
                                        id="resizable-container"
                                        className={`relative flex min-h-0 flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
                                    >
                                        {/* Toggle Editor Button - Vertical Center Between Sections */}
                                        {!isFullScreen && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                                                className={`absolute top-1/2 z-20 h-12 w-6 -translate-y-1/2 rounded-l-none rounded-r-md border border-border bg-background/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted ${isEditorCollapsed ? 'left-0' : 'left-[calc(var(--left-width)-12px)]'}`}
                                                style={{ '--left-width': `${leftWidth}%` } as React.CSSProperties}
                                                title={isEditorCollapsed ? 'Show Editor Panel' : 'Hide Editor Panel'}
                                            >
                                                {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                                <span className="sr-only">{isEditorCollapsed ? 'Show Editor' : 'Hide Editor'}</span>
                                            </Button>
                                        )}

                                        {/* Collapsible Left Panel - Editor - Hidden in full screen */}
                                        {!isFullScreen && (
                                            <div
                                                className={`flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'}`}
                                                style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
                                            >
                                                <FormatSelector content={content} />

                                                {/* Informational Note */}
                                                <div className="mx-4 mb-4 rounded border p-4">
                                                    <h3 className="text-sm font-medium text-foreground">Project ERD Overview</h3>
                                                    <div className="mt-2 text-sm text-muted-foreground">
                                                        <p>This is a consolidated view of all your feature database schemas.</p>
                                                        <p className="mt-1">
                                                            To create or edit tables, please go to the <strong>Feature ERD</strong> section for each
                                                            individual feature.
                                                        </p>
                                                        {!content && (
                                                            <p className="mt-2 font-medium text-foreground">
                                                                No feature diagrams have been created yet. Start by creating a feature and designing
                                                                its database schema.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-hidden">
                                                    {content ? (
                                                        <EditorPanel
                                                            value={content}
                                                            onChange={() => {}} // Read-only
                                                            readOnly={true}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center p-8">
                                                            <div className="text-center">
                                                                <p className="text-lg font-medium text-muted-foreground">
                                                                    No feature diagrams available
                                                                </p>
                                                                <p className="mt-2 text-sm text-muted-foreground">
                                                                    Create features and their ERD schemas to see the consolidated diagram here.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {error && (
                                                    <div className="m-4 rounded border border-destructive bg-destructive/10 p-4">
                                                        <p className="text-sm text-destructive-foreground">
                                                            <strong>Parse Error:</strong> {error}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Resize Handle */}
                                        {!isFullScreen && !isEditorCollapsed && (
                                            <div
                                                className="group relative w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/50"
                                                onMouseDown={handleMouseDown}
                                            >
                                                <div className="absolute inset-y-0 -right-1 -left-1" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <div className="flex h-12 w-1 items-center justify-center rounded-full bg-primary/20">
                                                        <div className="h-8 w-0.5 bg-primary"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Right Panel - Diagram */}
                                        <div
                                            className={`relative flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isFullScreen ? 'w-full border-l-0' : isEditorCollapsed ? 'w-full border-l-0' : 'border-l-0'}`}
                                            style={{ width: isFullScreen || isEditorCollapsed ? '100%' : `${100 - leftWidth}%` }}
                                        >
                                            <div className="min-h-0 flex-1">
                                                {content ? (
                                                    <DiagramCanvas
                                                        ref={canvasRef}
                                                        nodes={nodes}
                                                        edges={edges}
                                                        searchQuery={searchQuery}
                                                        backgroundVariant={backgroundVariant}
                                                        backgroundOptions={backgroundOptions}
                                                        layoutTrigger={layoutTrigger}
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-muted/10">
                                                        <div className="max-w-md p-8 text-center">
                                                            <div className="mb-4 text-muted-foreground">
                                                                <svg
                                                                    className="mx-auto h-24 w-24 opacity-20"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={1}
                                                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <h3 className="mb-2 text-xl font-semibold text-foreground">
                                                                No Database Schema Available
                                                            </h3>
                                                            <p className="mb-4 text-muted-foreground">No feature diagrams have been created yet.</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Start by creating features and designing their database schemas. All feature ERDs will
                                                                be consolidated and displayed here.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                )}

                {/* Fullscreen Mode */}
                {isFullScreen && (
                    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">
                        <div className="border-b bg-background px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                                        <DatabaseIcon className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Database Designer</h2>
                                        <p className="text-xs text-muted-foreground">{project.name}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                                    <Maximize2 className="mr-2 h-4 w-4" />
                                    Exit Fullscreen
                                </Button>
                            </div>
                        </div>
                        <div id="resizable-container" className="relative flex min-h-0 flex-1 overflow-hidden">
                            {/* Diagram Panel in Fullscreen */}
                            <div className="relative flex min-h-0 min-w-0 flex-col w-full">
                                <div className="min-h-0 flex-1">
                                    {content ? (
                                        <DiagramCanvas
                                            ref={canvasRef}
                                            nodes={nodes}
                                            edges={edges}
                                            searchQuery={searchQuery}
                                            backgroundVariant={backgroundVariant}
                                            backgroundOptions={backgroundOptions}
                                            layoutTrigger={layoutTrigger}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                            <div className="max-w-md p-8 text-center">
                                                <div className="mb-4 text-muted-foreground">
                                                    <svg
                                                        className="mx-auto h-24 w-24 opacity-20"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                                                        />
                                                    </svg>
                                                </div>
                                                <h3 className="mb-2 text-xl font-semibold text-foreground">No Database Schema Available</h3>
                                                <p className="mb-4 text-muted-foreground">No feature diagrams have been created yet.</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Start by creating features and designing their database schemas. All feature ERDs will be
                                                    consolidated and displayed here.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50">
                        <div className="rounded border bg-card p-6">
                            <TextShimmer className="text-card-foreground">Parsing schema...</TextShimmer>
                        </div>
                    </div>
                )}
            </div>
            <Toaster />
        </>
    );
}
