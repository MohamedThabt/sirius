import FeatureSidebar from '@/components/Features/FeatureSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import EditorPanel from '@/components/database-designer/EditorPanel';
import { MermaidViewerPane } from '@/components/database-designer/MermaidViewerPane';
import { DiagramErrorPanel } from '@/components/diagram/DiagramErrorPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type SharedData } from '@/types';
import { type FeatureItem } from '@/types/modules';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    project: Project;
    feature?: FeatureItem;
    featureId: number;
    initialContent?: string;
    isGenerating?: boolean;
}

// Sample Mermaid Sequence Diagram
const sampleMermaidSequence = `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: User action
    Frontend->>Backend: Process request
    Backend->>Database: Query data
    Database-->>Backend: Data result
    Backend-->>Frontend: Response
    Frontend-->>User: Update UI`;

export default function SequenceDiagram({ project, feature, featureId, initialContent, isGenerating: initialIsGenerating = false }: Props) {
    useFlashToasts();
    const { auth, flash } = usePage<SharedData>().props;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [content, setContent] = useState(initialContent ?? sampleMermaidSequence);
    const [lastSavedContent, setLastSavedContent] = useState(initialContent ?? sampleMermaidSequence);
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(initialIsGenerating);
    const [generationFailed, setGenerationFailed] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const rafIdRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentWidthRef = useRef(50);

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


    // Keep content in sync when server sends updated initialContent after AI edit
    useEffect(() => {
        if (typeof initialContent === 'string' && initialContent !== '') {
            setContent(initialContent);
            setLastSavedContent(initialContent);
            setIsDirty(false);
        }
         
    }, [initialContent]);

    // Handle new sequence from flash messages (AI edit or manual save)
    useEffect(() => {
        if (flash?.newSequence && typeof flash.newSequence === 'string') {
            setContent(flash.newSequence);
            setLastSavedContent(flash.newSequence);
            setIsDirty(false);
        }
    }, [flash?.newSequence]);

    // Handle initial generation trigger
    useEffect(() => {
        if (initialIsGenerating && featureId) {
            triggerAsyncGeneration();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIsGenerating, featureId]);

    // Handle initial async generation
    const triggerAsyncGeneration = async () => {
        setIsGenerating(true);
        setGenerationFailed(false);
        try {
            const response = await fetch(`/features/${featureId}/sequence-diagram/generate-async`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.sequence) {
                    setContent(data.sequence);
                    setLastSavedContent(data.sequence);
                    setIsDirty(false);
                    setGenerationFailed(false);
                    toast.success('Sequence diagram generated successfully!');
                } else {
                    setGenerationFailed(true);
                    setContent('');
                    toast.error(data.message || 'Failed to generate sequence diagram');
                }
            } else {
                const errorData = await response.json();
                setGenerationFailed(true);
                setContent('');
                toast.error(errorData.message || 'Failed to generate sequence diagram. Please try again.');
            }
        } catch (error) {
            console.error('Error generating sequence diagram:', error);
            setGenerationFailed(true);
            setContent('');
            toast.error('An error occurred while generating the sequence diagram.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        router.post(
            `/features/${featureId}/sequence-diagram/ai-edit`,
            { engineer_notes: prompt },
            {
                preserveScroll: true,
                onStart: () => {
                    setError(null);
                    setIsSubmitting(true);
                },
                onSuccess: () => {
                    setPrompt('');
                    toast.success('Sequence diagram updated by AI');
                },
                onError: (errors: any) => {
                    const first = (errors && Object.values(errors)[0]) as any;
                    setError(typeof first === 'string' ? first : 'Request failed');
                    toast.error('Failed to update sequence diagram');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const handleSave = () => {
        if (isSaving || !isDirty) return;
        setIsSaving(true);
        router.post(
            `/features/${featureId}/sequence-diagram/edit`,
            { sequence: content },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLastSavedContent(content);
                    setIsDirty(false);
                    toast.success('Sequence diagram saved');
                },
                onError: () => {
                    toast.error('Failed to save sequence diagram');
                },
                onFinish: () => setIsSaving(false),
            },
        );
    };

    const handleExportMermaid = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}-sequence-diagram.mermaid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Mermaid schema exported successfully!');
    };

    // Handle fix error request - pre-populate prompt
    const handleFixError = useCallback((errorPrompt: string) => {
        setPrompt(errorPrompt);
    }, []);

    // Handle resize of panels
    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        // Use requestAnimationFrame to throttle updates to 60fps
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
            const container = containerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Limit width between 20% and 80%
            if (newWidth >= 20 && newWidth <= 80) {
                // Directly update the CSS variable to avoid re-renders
                container.style.setProperty('--left-width', `${newWidth}%`);
                currentWidthRef.current = newWidth;
            }
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        // Sync the state with the final width
        setLeftWidth(currentWidthRef.current);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Modules', href: `/projects/${project.id}/modules` },
        { title: feature?.module?.name || 'Module', href: `/projects/${project.id}/modules/${feature?.module?.id}` },
        { title: feature?.name || 'Feature', href: `/projects/${project.id}/modules/${feature?.module?.id}/features/${feature?.id}` },
        { title: 'Sequence Diagram', href: `/features/${featureId}/sequence-diagram` },
    ];

    if (!feature) {
        return <div>Feature not found</div>;
    }

    return (
        <>
            <Head title={`Sequence Diagram - ${feature.name}`} />
            <div className="h-screen bg-background overflow-hidden">
                <div className="flex h-full">
                    {!isFullScreen && (
                        <FeatureSidebar
                            project={project}
                            feature={feature}
                            activeSection="sequence"
                            auth={auth}
                            isSidebarCollapsed={isSidebarCollapsed}
                            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        />
                    )}

                    <div
                        className={`flex flex-col bg-background text-foreground ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-full' : 'h-full min-w-0 flex-1'}`}
                    >
                        {/* Toolbar - Hidden in full screen */}
                        {!isFullScreen && (
                            <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-3">
                                <div className="flex items-center space-x-4">
                                    <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                                </div>
                            </div>
                        )}

                <div
                    id="resizable-container"
                    ref={containerRef}
                    className={`relative flex flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
                    style={{ '--left-width': `${leftWidth}%` } as React.CSSProperties}
                >
                    {/* Toggle Editor Button - Vertical Center Between Sections */}
                    {!isFullScreen && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                            className={`absolute top-1/2 z-20 h-12 w-6 -translate-y-1/2 rounded-l-none rounded-r-md border border-border bg-background/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted ${isEditorCollapsed ? 'left-0' : ''}`}
                            style={!isEditorCollapsed ? { left: `calc(var(--left-width) - 12px)` } : {}}
                            title={isEditorCollapsed ? 'Show Editor Panel' : 'Hide Editor Panel'}
                        >
                            {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            <span className="sr-only">{isEditorCollapsed ? 'Show Editor' : 'Hide Editor'}</span>
                        </Button>
                    )}

                    {/* Collapsible Left Panel - Editor - Hidden in full screen */}
                    {!isFullScreen && (
                        <div
                            className={`flex h-full min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'} ${isResizing ? 'pointer-events-none' : ''}`}
                            style={{ width: isEditorCollapsed ? '0' : 'var(--left-width)' }}
                        >
                            <div className="relative flex-1 overflow-hidden">
                                {/* Top toolbar with Save button */}
                                {isDirty && (
                                    <div className="absolute top-2 right-2 z-50">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="bg-primary px-4 text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                                        >
                                            {isSaving ? <TextShimmer className="text-primary-foreground">Saving...</TextShimmer> : 'Save'}
                                        </Button>
                                    </div>
                                )}

                                <div className="h-full overflow-auto pb-24">
                                    <EditorPanel
                                        value={content}
                                        onChange={(val) => {
                                            setContent(val);
                                            setIsDirty(val !== lastSavedContent);
                                        }}
                                        isResizing={isResizing}
                                    />
                                </div>

                                {/* AI Prompt Section - Floating Bottom (Optimal Position) */}
                                <div className="absolute right-2 bottom-4 left-2 z-50 rounded-lg border border-border bg-background/95 p-3 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-background/98 hover:shadow-2xl">
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="e.g., 'Login flow from user to API' or 'Payment processing sequence'"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleGenerate();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={!prompt.trim() || isSubmitting}
                                            className="bg-primary px-4 text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/25"
                                        >
                                            {isSubmitting ? (
                                                <TextShimmer className="text-primary-foreground">Generating...</TextShimmer>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Generate
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Describe your sequence diagram and click Generate to create Mermaid code
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <DiagramErrorPanel
                                    error={error}
                                    onFixRequest={handleFixError}
                                    className="m-4"
                                />
                            )}
                        </div>
                    )}

                    {/* Resize Handle */}
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
                        className={`relative flex flex-1 min-w-0 flex-col transition-all duration-300 ease-in-out overflow-hidden ${isFullScreen ? 'w-full border-l-0' : isEditorCollapsed ? 'w-full border-l-0' : 'border-l border-border'} ${isResizing ? 'pointer-events-none' : ''}`}
                    >
                        {isGenerating ? (
                            <div className="flex h-full items-center justify-center bg-muted/10">
                                <div className="text-center">
                                    <TextShimmer className="text-2xl font-semibold">Generating Sequence Diagram...</TextShimmer>
                                    <p className="mt-4 text-sm text-muted-foreground">Please wait while we create your diagram</p>
                                </div>
                            </div>
                        ) : generationFailed && !content ? (
                            <div className="flex h-full items-center justify-center bg-muted/10">
                                <div className="max-w-md text-center">
                                    <div className="mb-4 text-destructive">
                                        <svg
                                            className="mx-auto h-16 w-16 opacity-50"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-foreground">Generation Failed</h3>
                                    <p className="mb-6 text-sm text-muted-foreground">Failed to generate the sequence diagram. Please try again.</p>
                                    <Button
                                        onClick={() => {
                                            setIsRetrying(true);
                                            triggerAsyncGeneration().finally(() => setIsRetrying(false));
                                        }}
                                        disabled={isRetrying}
                                        className="bg-primary text-primary-foreground"
                                    >
                                        {isRetrying ? (
                                            <TextShimmer className="text-white">Retrying...</TextShimmer>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Try Again
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full overflow-auto">
                                <MermaidViewerPane
                                    code={content}
                                    error={error}
                                    setError={setError}
                                    isFullScreen={isFullScreen}
                                    onToggleFullScreen={toggleFullScreen}
                                />
                            </div>
                        )}
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </>
    );
}
