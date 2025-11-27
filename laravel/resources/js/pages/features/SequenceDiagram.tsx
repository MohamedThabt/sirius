import FeatureSidebar from '@/components/Features/FeatureSidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import EditorPanel from '@/components/database-designer/EditorPanel';
import { MermaidViewerPane } from '@/components/database-designer/MermaidViewerPane';
// Removed local generation; we now post to backend AI edit route

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string | null;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
    progress?: number | null;
    description?: string | null;
    acceptance_criteria?: string | null;
    user_flows?: string | null;
    metrics?: string | null;
    erd?: string | null;
    sequence_diagram?: string | null;
    wireframe?: string | null;
}

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
    const { auth } = usePage().props as any;
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
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const rafIdRef = useRef<number | null>(null);

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
                    toast.success('Sequence diagram generated successfully!');
                } else {
                    toast.error(data.message || 'Failed to generate sequence diagram');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to generate sequence diagram. Please try again.');
            }
        } catch (error) {
            console.error('Error generating sequence diagram:', error);
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
            const container = document.getElementById('resizable-container');
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Limit width between 20% and 80%
            if (newWidth >= 20 && newWidth <= 80) {
                setLeftWidth(newWidth);
            }
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
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
        { title: feature?.name || 'Feature', href: `/features/${feature?.id}` },
        { title: 'Sequence Diagram', href: `/features/${feature?.id}/sequence-diagram` },
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
                            </div>
                        )}

                <div
                    id="resizable-container"
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
                            className={`flex h-full min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'}`}
                            style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
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
                                <div className="m-4 border-l-4 border-destructive bg-destructive/10 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-destructive-foreground">
                                                <strong>Parse Error:</strong> {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
                        className={`relative flex min-w-0 flex-col transition-all duration-300 ease-in-out overflow-hidden ${isFullScreen ? 'w-full border-l-0' : isEditorCollapsed ? 'w-full border-l-0' : 'border-l border-border'}`}
                        style={!isFullScreen && !isEditorCollapsed ? { width: `${100 - leftWidth}%` } : {}}
                    >
                        {isGenerating ? (
                            <div className="flex h-full items-center justify-center bg-muted/10">
                                <div className="text-center">
                                    <TextShimmer className="text-2xl font-semibold">Generating Sequence Diagram...</TextShimmer>
                                    <p className="mt-4 text-sm text-muted-foreground">Please wait while we create your diagram</p>
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
