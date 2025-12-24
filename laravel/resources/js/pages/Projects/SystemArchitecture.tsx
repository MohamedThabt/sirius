import { Breadcrumbs } from '@/components/breadcrumbs';
import JsonEditor from '@/components/c4-diagram/JsonEditor';
import ReactFlowDiagram from '@/components/c4-diagram/ReactFlowDiagram';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useC4Parser } from '@/hooks/useC4Parser';
import { type User } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { getCompletionPercentage, getHealthStatus } from '@/utils/project-status';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Code,
    Download,
    Layout,
    Maximize2,
    Minimize2,
    PanelLeftClose,
    PanelLeftOpen,
    Save,
    Settings,
    Share2,
    Sparkles,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useIsDarkMode } from '@/hooks/use-theme-detection';
import { useResizablePanel } from '@/hooks/use-resizable-panel';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    c4: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    non_functional_requirements: string | null;
}

interface Props {
    project: Project;
    errorMessage?: string;
    isGenerating?: boolean;
    sections?: Sections;
}

// Empty C4 template
const emptyC4Template = `{
  "title": "",
  "description": "",
  "type": "system-context",
  "version": "1.0.0",
  "metadata": {
    "author": "",
    "created": "${new Date().toISOString().split('T')[0]}",
    "updated": "${new Date().toISOString().split('T')[0]}",
    "tags": []
  },
  "elements": [],
  "relationships": [],
  "layout": {
    "type": "hierarchical",
    "direction": "TB"
  }
}`;

export default function SystemArchitecture({ project, errorMessage, isGenerating: initialIsGenerating = false, sections }: Props) {
    useFlashToasts();
    const { auth, flash } = usePage<{ auth: { user: User }; flash: { updatedC4?: string } }>().props;
    const [content, setContent] = useState(project.c4 || emptyC4Template);
    const [lastSavedContent, setLastSavedContent] = useState(project.c4 || emptyC4Template);
    const [prompt, setPrompt] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(initialIsGenerating);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    // Handle flash data from AI edit
    useEffect(() => {
        if (flash?.updatedC4) {
            setContent(flash.updatedC4);
            setIsDirty(true);
            toast.success('C4 diagram updated successfully! Click Save to persist changes.');
        }
    }, [flash?.updatedC4]);
    
    // Track content changes for isDirty state
    useEffect(() => {
        setIsDirty(content !== lastSavedContent);
    }, [content, lastSavedContent]);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { c4Diagram, error, isLoading, warnings } = useC4Parser(content);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showGenerationMode, setShowGenerationMode] = useState(!project.c4 && !initialIsGenerating);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // WHY: Replaced ~20 lines of MutationObserver logic with shared hook
    const isDarkMode = useIsDarkMode();

    // WHY: Replaced ~60 lines of resize logic with shared hook
    const { width: leftWidth, isResizing, handleMouseDown, containerRef } = useResizablePanel({
        initialWidth: 50,
        minWidth: 20,
        maxWidth: 80,
    });

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'System Architecture', href: `/projects/${project.id}/c4` },
    ];

    const completionPercentage = useMemo(() => {
        return getCompletionPercentage(sections, [], project);
    }, [sections, project]);

    const health = useMemo(() => {
        return getHealthStatus(completionPercentage);
    }, [completionPercentage]);

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'c4',
            }),
        [project],
    );

    // Resize logic now handled by useResizablePanel hook

    // Theme detection now handled by useIsDarkMode hook

    // Show error toast if errorMessage prop is provided
    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    // Handle initial generation trigger
    useEffect(() => {
        if (initialIsGenerating && project) {
            triggerAsyncGeneration();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIsGenerating, project]);

    // Handle initial async generation
    const triggerAsyncGeneration = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/projects/${project.id}/c4/generate-async`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success && data.c4) {
                    setContent(data.c4);
                    setShowGenerationMode(false);
                    toast.success('C4 diagram generated successfully!');
                } else {
                    toast.error(data.message || 'Failed to generate C4 diagram');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to generate C4 diagram. Please try again.');
            }
        } catch (error) {
            console.error('Error generating C4 diagram:', error);
            toast.error('An error occurred while generating the C4 diagram.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Theme toggle removed - use navbar theme toggle instead

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsConverting(true);
        
        router.post(
            `/projects/${project.id}/c4/ai-edit`,
            { engineer_notes: prompt },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowGenerationMode(false);
                    setPrompt('');
                },
                onError: () => {
                    toast.error('Failed to generate diagram. Please try again.');
                },
                onFinish: () => {
                    setIsConverting(false);
                },
            }
        );
    };

    const handleSave = async () => {
        setIsConverting(true);
        
        router.post(
            `/projects/${project.id}/c4/save`,
            { c4_content: content },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLastSavedContent(content);
                    setIsDirty(false);
                },
                onError: () => {
                    toast.error('Failed to save diagram. Please try again.');
                },
                onFinish: () => {
                    setIsConverting(false);
                },
            }
        );
    };

    return (
        <>
            <Head title={`System Architecture - ${project.name}`} />

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
                                <div className="border-b px-4 py-3 sm:pl-6 lg:pl-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                                    </div>
                                </div>

                                <div className={`flex flex-1 flex-col overflow-hidden bg-background text-foreground`}>
                                    {/* Generation Mode - Show when no C4 exists or isGenerating */}
                                    {(showGenerationMode && !project.c4) || isGenerating ? (
                                        <div className="flex flex-1 items-center justify-center">
                                            {isGenerating ? (
                                                <div className="flex flex-col items-center justify-center p-8">
                                                    <TextShimmer className="text-2xl font-semibold">Generating C4 Diagram...</TextShimmer>
                                                    <p className="mt-4 text-muted-foreground">This may take a moment</p>
                                                </div>
                                            ) : (
                                                <div className="mx-auto max-w-2xl px-4 text-center">
                                                    <div className="mb-8">
                                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                            <Sparkles className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                                                            Generate C4 Architecture Diagram
                                                        </h1>
                                                        <p className="text-sm text-muted-foreground">
                                                            Create a comprehensive C4 model diagram for your project using AI. Describe your system
                                                            architecture and we'll generate a detailed diagram.
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="rounded border p-6">
                                                            <Input
                                                                type="text"
                                                                placeholder="Describe your system architecture (e.g., 'E-commerce platform with microservices, API gateway, and database')"
                                                                value={prompt}
                                                                onChange={(e) => setPrompt(e.target.value)}
                                                                className="mb-4 text-base"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !isConverting) {
                                                                        handleGenerate();
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                onClick={handleGenerate}
                                                                disabled={!prompt.trim() || isConverting}
                                                                className="w-full"
                                                                size="lg"
                                                            >
                                                                {isConverting ? (
                                                                    <TextShimmer>Generating C4 Diagram...</TextShimmer>
                                                                ) : (
                                                                    <>
                                                                        <Sparkles className="mr-2 h-5 w-5" />
                                                                        Generate C4 Diagram
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>

                                                        <div className="text-sm text-muted-foreground">
                                                            <p>
                                                                💡 <strong>Tip:</strong> Be specific about your system components, technologies, and
                                                                relationships for better results.
                                                            </p>
                                                        </div>

                                                        <Button variant="outline" onClick={() => setShowGenerationMode(false)} className="mt-4">
                                                            Skip and Use Template
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative flex min-h-0 flex-1 overflow-hidden" ref={containerRef}>
                                            {/* Toggle Editor Button - Vertical Center Between Sections */}
                                            {!isFullScreen && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                                                    className={`absolute top-1/2 z-20 h-12 w-6 -translate-y-1/2 rounded-l-none rounded-r-md border border-border bg-background/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted ${isEditorCollapsed ? 'left-0' : ''}`}
                                                    style={!isEditorCollapsed ? { left: `${leftWidth}%`, transform: 'translate(-50%, -50%)' } : {}}
                                                    title={isEditorCollapsed ? 'Show Editor Panel' : 'Hide Editor Panel'}
                                                >
                                                    {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                                    <span className="sr-only">{isEditorCollapsed ? 'Show Editor' : 'Hide Editor'}</span>
                                                </Button>
                                            )}

                                            {/* Left Panel - Editor - Hidden in full screen */}
                                            {!isFullScreen && (
                                                <div 
                                                    className={`flex min-h-0 min-w-0 flex-col overflow-hidden transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'} ${isResizing ? 'pointer-events-none' : ''}`}
                                                    style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
                                                >
                                                    <div className="relative flex-1 overflow-hidden">
                                                        {/* Editor Header with Save Button */}
                                                        {isDirty && (
                                                            <div className="absolute top-2 right-2 z-50">
                                                                <Button 
                                                                    onClick={handleSave} 
                                                                    disabled={isConverting || !!error}
                                                                    className="bg-primary px-4 text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                                                                >
                                                                    {isConverting ? (
                                                                        <TextShimmer className="text-primary-foreground">Saving...</TextShimmer>
                                                                    ) : (
                                                                        'Save'
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        )}

                                                        <div className="h-full overflow-auto pb-24">
                                                            <JsonEditor value={content} onChange={setContent} error={error ?? undefined} />
                                                        </div>

                                                        {/* AI Prompt Section - Floating Bottom */}
                                                        <div className="absolute right-2 bottom-4 left-2 z-50 rounded-lg border border-border bg-background/95 p-3 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-background/98 hover:shadow-2xl">
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="text"
                                                                    placeholder="e.g., 'E-commerce system with users, products, orders' or 'Microservices architecture'"
                                                                    value={prompt}
                                                                    onChange={(e) => setPrompt(e.target.value)}
                                                                    className="flex-1"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleGenerate();
                                                                        }
                                                                    }}
                                                                />
                                                                <Button onClick={handleGenerate} disabled={!prompt.trim() || isConverting}>
                                                                    {isConverting ? (
                                                                        <TextShimmer>Generating...</TextShimmer>
                                                                    ) : (
                                                                        <>
                                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                                            Generate
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                            <p className="mt-2 text-xs text-muted-foreground">
                                                                Describe your system architecture and click Generate to create C4 diagram
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Resize Handle - Hidden in full screen and when editor is collapsed */}
                                            {!isFullScreen && !isEditorCollapsed && (
                                                <div
                                                    className="group relative z-10 w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/50"
                                                    onMouseDown={handleMouseDown}
                                                >
                                                    <div className="absolute inset-y-0 -left-1 -right-1" />
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <div className="h-8 w-1 rounded-full bg-primary" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Right Panel - Diagram */}
                                            <div
                                                className={`relative flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isFullScreen ? 'w-full border-l-0' : isEditorCollapsed ? 'w-full border-l-0' : 'border-l border-border'} ${isResizing ? 'pointer-events-none' : ''}`}
                                                style={{
                                                    width: isFullScreen || isEditorCollapsed ? '100%' : `${100 - leftWidth}%`,
                                                }}
                                            >
                                                {/* Full Screen Button - Top Right */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={toggleFullScreen}
                                                    className="absolute top-4 right-4 z-10 h-8 w-8 rounded border"
                                                    title="Enter Full Screen"
                                                >
                                                    <Maximize2 className="h-4 w-4" />
                                                    <span className="sr-only">Enter Full Screen</span>
                                                </Button>

                                                <div className="min-h-0 flex-1" ref={canvasRef}>
                                                    {isGenerating ? (
                                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                                            <div className="text-center">
                                                                <TextShimmer className="text-2xl font-semibold">
                                                                    Generating C4 Architecture...
                                                                </TextShimmer>
                                                                <p className="mt-4 text-sm text-muted-foreground">
                                                                    Please wait while we create your system diagram
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : isLoading ? (
                                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                                            <div className="text-center">
                                                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                                                                <TextShimmer className="text-2xl font-semibold">Loading Diagram...</TextShimmer>
                                                                <p className="mt-4 text-sm text-muted-foreground">
                                                                    Parsing and rendering your C4 architecture
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <ReactFlowDiagram c4Diagram={c4Diagram || undefined} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Error and Warning Display */}
                                            {!isFullScreen && error && (
                                                <div className="absolute right-4 bottom-4 left-4 z-30 rounded border border-destructive bg-destructive/10 p-4">
                                                    <p className="text-sm text-destructive-foreground">
                                                        <strong>Parse Error:</strong> {error ?? 'Unknown error'}
                                                    </p>
                                                </div>
                                            )}

                                            {!isFullScreen && warnings && warnings.length > 0 && (
                                                <div className="absolute right-4 bottom-16 left-4 z-30 rounded border p-4">
                                                    <p className="text-sm text-foreground">
                                                        <strong>Warnings:</strong>
                                                    </p>
                                                    <ul className="mt-1 text-xs text-muted-foreground">
                                                        {warnings.map((warning, index) => (
                                                            <li key={index}>• {warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                )}

                {/* Fullscreen Mode */}
                {isFullScreen && (
                    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">
                        <div className="relative flex min-h-0 flex-1 overflow-hidden" ref={containerRef}>
                            {/* Right Panel - Diagram Only */}
                            <div className="relative flex min-h-0 min-w-0 flex-col" style={{ width: '100%' }}>
                                {/* Full Screen Button - Top Right */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleFullScreen}
                                    className="absolute top-4 right-4 z-10 h-8 w-8 rounded border"
                                    title="Exit Full Screen"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                    <span className="sr-only">Exit Full Screen</span>
                                </Button>

                                <div className="min-h-0 flex-1" ref={canvasRef}>
                                    {isGenerating ? (
                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                            <div className="text-center">
                                                <TextShimmer className="text-2xl font-semibold">Generating C4 Architecture...</TextShimmer>
                                                <p className="mt-4 text-sm text-muted-foreground">Please wait while we create your system diagram</p>
                                            </div>
                                        </div>
                                    ) : isLoading ? (
                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                            <div className="text-center">
                                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                                                <TextShimmer className="text-2xl font-semibold">Loading Diagram...</TextShimmer>
                                                <p className="mt-4 text-sm text-muted-foreground">Parsing and rendering your C4 architecture</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <ReactFlowDiagram c4Diagram={c4Diagram || undefined} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <div className="rounded-lg border bg-card p-6 shadow-lg">
                            <div className="flex flex-col items-center space-y-3">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                                <TextShimmer className="text-card-foreground">Parsing schema...</TextShimmer>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Toaster />
        </>
    );
}
