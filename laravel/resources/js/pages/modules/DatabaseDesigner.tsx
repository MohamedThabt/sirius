import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DiagramErrorPanel } from '@/components/diagram/DiagramErrorPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useErdOperations } from '@/hooks/useErdOperations';
import { type Project, type SharedData, type User } from '@/types';
import type { ModuleItem } from '@/types/modules';
import { Head, router, usePage } from '@inertiajs/react';
import { BackgroundVariant, Edge, Node } from '@xyflow/react';
import { ChevronLeft, ChevronRight, Loader2, PanelLeftClose, PanelLeftOpen, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import AddTableDialog from '@/components/database-designer/AddTableDialog';
import DiagramCanvas from '@/components/database-designer/DiagramCanvas';
import DiagramControls from '@/components/database-designer/DiagramControls';
import EditTableDialog from '@/components/database-designer/EditTableDialog';
import EditorPanel from '@/components/database-designer/EditorPanel';
import FormatSelector from '@/components/database-designer/FormatSelector';
import { useDBMLParser } from '@/hooks/useDBMLParser';
import { nodesToDBML, nodesToMermaid } from '@/utils/dbmlConverter';
import { exportAsSQL } from '@/utils/exportUtils';
import { convertFormat, detectFormat } from '@/utils/formatConverters';

interface Props {
    project: Project;
    module: ModuleItem;
    initialContent?: string;
    moduleId?: number;
    isGenerating?: boolean;
}

export default function ModuleDatabaseDesigner({ project, module, initialContent, moduleId, isGenerating: initialIsGenerating = false }: Props) {
    useFlashToasts();
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [content, setContent] = useState(initialContent ?? '');
    const [searchQuery, setSearchQuery] = useState('');
    const [prompt, setPrompt] = useState('');
    const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
    const [backgroundOptions, setBackgroundOptions] = useState({
        gap: 20,
        size: 1,
    });

    const [isGenerating, setIsGenerating] = useState(initialIsGenerating);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { nodes, edges, error, isLoading } = useDBMLParser(content);
    const [layoutTrigger, setLayoutTrigger] = useState<{ algorithm: string; timestamp: number } | null>(null);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const rafIdRef = useRef<number | null>(null);

    // Interactive editing states
    const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
    const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
    const [isAddTableOpen, setIsAddTableOpen] = useState(false);
    const [isEditTableOpen, setIsEditTableOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<Node | null>(null);

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'modules',
            }),
        [project],
    );

    // WHY: Hook encapsulates ERD sync logic, reducing duplication with ModuleShow.tsx
    // moduleId may be undefined during initial load, so we provide a fallback
    const { isSyncing, syncErd } = useErdOperations({ 
        projectId: project.id, 
        moduleId: moduleId ?? module.id 
    });

    // Sync editor content when server provides updated ERD after edits
    useEffect(() => {
        if (typeof initialContent === 'string' && initialContent.trim()) {
            setContent(initialContent);
            setIsDirty(false);
        }
    }, [initialContent]);

    // Sync editor content when module ERD is updated (e.g., after AI edit)
    useEffect(() => {
        if (module?.erd && typeof module.erd === 'string' && module.erd.trim()) {
            setContent(module.erd);
            setIsDirty(false);
        }
    }, [module?.erd]);

    // Sync editor content when AI edit returns new ERD via flash
    useEffect(() => {
        if (shared.flash?.erd && typeof shared.flash.erd === 'string') {
            setContent(shared.flash.erd);
            setIsDirty(false);
        }
    }, [shared.flash?.erd]);

    // Handle initial generation trigger
    useEffect(() => {
        if (initialIsGenerating && moduleId) {
            // Small delay to ensure session is set on the backend
            const timeoutId = setTimeout(() => {
                triggerAsyncGeneration();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIsGenerating, moduleId]);

    // WHY: Using native fetch() for async generation - consistent with other async endpoints (C4, SequenceDiagram)
    // The backend returns JsonResponse, not Inertia response
    const triggerAsyncGeneration = useCallback(async () => {
        setIsGenerating(true);
        setGenerationError(null);
        
        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch(
                `/projects/${project.id}/modules/${moduleId}/erd/generate-async`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({}),
                }
            );
            
            const data = await response.json();
            
            if (data.success && data.erd) {
                setContent(data.erd);
                setIsDirty(false);
                toast.success(data.message || 'ERD generated successfully!');
            } else {
                const errorMessage = data.message || 'Failed to generate ERD. Please try again.';
                setGenerationError(errorMessage);
                toast.error(errorMessage);
            }
        } catch {
            const errorMessage = 'Failed to generate ERD. Please try again.';
            setGenerationError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    }, [project.id, moduleId]);

    // Handler for regenerating ERD - sets up session and triggers generation
    const handleRegenerate = useCallback(() => {
        if (!moduleId) {
            toast.error('Module not found for generate route.');
            return;
        }
        // Set retrying state for button feedback - keep error visible to show shimmer
        setIsRetrying(true);
        router.post(
            `/projects/${project.id}/modules/${moduleId}/erd/generate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Clear error only on success - page will reload with isGenerating=true
                    setGenerationError(null);
                },
                onError: () => {
                    setIsRetrying(false);
                    setGenerationError('Failed to start ERD generation. Please try again.');
                    toast.error('Failed to start ERD generation. Please try again.');
                },
            },
        );
    }, [project.id, moduleId]);

    const toggleFullScreen = () => {
        const newFullScreenState = !isFullScreen;
        setIsFullScreen(newFullScreenState);
        if (newFullScreenState) {
            setIsEditorCollapsed(true);
        } else {
            setIsEditorCollapsed(false);
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        if (!moduleId) {
            toast.error('Module not found for AI edit route.');
            return;
        }
        router.post(
            `/projects/${project.id}/modules/${moduleId}/erd/ai-edit`,
            { engineer_notes: prompt },
            {
                onStart: () => setIsGenerating(true),
                onSuccess: () => {
                    setPrompt('');
                    // Visit the ERD page again to get fresh data with updated ERD
                    router.visit(`/projects/${project.id}/modules/${moduleId}/erd`, {
                        preserveScroll: true,
                        only: ['module', 'initialContent'],
                        onSuccess: () => {
                            // The useEffect hooks will handle updating the content
                            // from either flash.erd, module.erd, or initialContent
                        },
                    });
                },
                onError: () => {},
                onFinish: () => setIsGenerating(false),
            },
        );
    };

    const handleExportMermaid = () => {
        try {
            const currentFormat = detectFormat(content);
            const mermaidContent = currentFormat === 'dbml' ? convertFormat(content, 'dbml', 'mermaid') : content;
            const blob = new Blob([mermaidContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${module.name}-er-diagram.mermaid`;
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleArrange = (algorithm: string) => {
        if (!canvasRef.current) return;
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

    // Interactive editing handlers
    const handleNodesChange = useCallback(
        (updatedNodes: Node[]) => {
            setCurrentNodes(updatedNodes);
            const currentFormat = detectFormat(content);
            const newContent = currentFormat === 'mermaid' ? nodesToMermaid(updatedNodes, currentEdges) : nodesToDBML(updatedNodes, currentEdges);
            setContent(newContent);
            setIsDirty(true);
        },
        [currentEdges, content],
    );

    const handleEdgesChange = useCallback(
        (updatedEdges: Edge[]) => {
            setCurrentEdges(updatedEdges);
            const currentFormat = detectFormat(content);
            const newContent = currentFormat === 'mermaid' ? nodesToMermaid(currentNodes, updatedEdges) : nodesToDBML(currentNodes, updatedEdges);
            setContent(newContent);
            setIsDirty(true);
        },
        [currentNodes, content],
    );

    const handleAddTable = (tableName: string, fields: any[]) => {
        const newNode: Node = {
            id: tableName,
            type: 'tableNode',
            position: { x: 100, y: 100 },
            data: {
                tableName,
                fields,
            },
        };

        const updatedNodes = [...currentNodes, newNode];

        const newEdges: Edge[] = fields
            .filter((f: any) => f.isForeignKey && f.foreignKeyReference)
            .map((f: any) => {
                const refTable = f.foreignKeyReference.referencedTable;
                const edgeId = `${tableName}-${refTable}`;

                return {
                    id: edgeId,
                    source: tableName,
                    target: refTable,
                    label: `1:N`,
                    type: 'smoothstep',
                    animated: true,
                    style: {
                        stroke: '#6366f1',
                        strokeWidth: 2,
                    },
                } as Edge;
            });

        const updatedEdges = [...currentEdges, ...newEdges];

        setCurrentNodes(updatedNodes);
        setCurrentEdges(updatedEdges);

        const currentFormat = detectFormat(content);
        const newContent = currentFormat === 'mermaid' ? nodesToMermaid(updatedNodes, updatedEdges) : nodesToDBML(updatedNodes, updatedEdges);
        setContent(newContent);
        setIsDirty(true);
        toast.success(`Table "${tableName}" added successfully!`);
    };

    const handleEditNode = (nodeId: string) => {
        const node = currentNodes.find((n) => n.id === nodeId);
        if (node) {
            setEditingNode(node);
            setIsEditTableOpen(true);
        }
    };

    const handleSaveEdit = (tableName: string, fields: any[]) => {
        if (!editingNode) return;

        const updatedNodes = currentNodes.map((node) => {
            if (node.id === editingNode.id) {
                return {
                    ...node,
                    id: tableName,
                    data: {
                        ...node.data,
                        tableName,
                        fields,
                    },
                };
            }
            return node;
        });

        let updatedEdges = currentEdges.map((edge) => ({
            ...edge,
            source: edge.source === editingNode.id ? tableName : edge.source,
            target: edge.target === editingNode.id ? tableName : edge.target,
        }));

        updatedEdges = updatedEdges.filter((edge) => edge.source !== tableName && edge.target !== tableName);

        const newEdges: Edge[] = fields
            .filter((f: any) => f.isForeignKey && f.foreignKeyReference)
            .map((f: any) => {
                const refTable = f.foreignKeyReference.referencedTable;
                const edgeId = `${tableName}-${refTable}`;

                return {
                    id: edgeId,
                    source: tableName,
                    target: refTable,
                    label: `1:N`,
                    type: 'smoothstep',
                    animated: true,
                    style: {
                        stroke: '#6366f1',
                        strokeWidth: 2,
                    },
                } as Edge;
            });

        updatedEdges = [...updatedEdges, ...newEdges];

        setCurrentNodes(updatedNodes);
        setCurrentEdges(updatedEdges);

        const currentFormat = detectFormat(content);
        const newContent = currentFormat === 'mermaid' ? nodesToMermaid(updatedNodes, updatedEdges) : nodesToDBML(updatedNodes, updatedEdges);
        setContent(newContent);
        setIsDirty(true);
        toast.success(`Table updated successfully!`);
    };

    const handleDeleteNode = (nodeId: string) => {
        const updatedNodes = currentNodes.filter((node) => node.id !== nodeId);
        const updatedEdges = currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

        setCurrentNodes(updatedNodes);
        setCurrentEdges(updatedEdges);

        const currentFormat = detectFormat(content);
        const newContent = currentFormat === 'mermaid' ? nodesToMermaid(updatedNodes, updatedEdges) : nodesToDBML(updatedNodes, updatedEdges);
        setContent(newContent);
        setIsDirty(true);
        toast.success(`Table deleted successfully!`);
    };

    // Sync current nodes/edges with parsed nodes/edges
    useEffect(() => {
        setCurrentNodes(nodes);
        setCurrentEdges(edges);
    }, [nodes, edges]);

    // Handle fix error request - pre-populate prompt and trigger generation
    const handleFixError = useCallback((errorPrompt: string) => {
        setPrompt(errorPrompt);
    }, []);

    // Handle resize of panels
    // Minimum width before auto-collapse (15%)
    const MIN_EDITOR_WIDTH = 15;
    const DEFAULT_EDITOR_WIDTH = 50;

    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }

            rafIdRef.current = requestAnimationFrame(() => {
                const container = document.getElementById('resizable-container');
                if (!container) return;

                const containerRect = container.getBoundingClientRect();
                const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

                // If dragged below minimum, collapse the editor
                if (newWidth < MIN_EDITOR_WIDTH) {
                    setIsEditorCollapsed(true);
                    setLeftWidth(DEFAULT_EDITOR_WIDTH); // Reset to default for when reopened
                } else if (newWidth <= 80) {
                    setLeftWidth(newWidth);
                    // Ensure editor is visible if above minimum
                    if (isEditorCollapsed) {
                        setIsEditorCollapsed(false);
                    }
                }
            });
        },
        [isEditorCollapsed],
    );

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
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Modules', href: `/projects/${project.id}/modules` },
        { title: module.name, href: `/projects/${project.id}/modules/${module.id}` },
        { title: 'Database Designer', href: `/projects/${project.id}/modules/${module.id}/erd` },
    ];

    return (
        <>
            <Head title={`Database Designer - ${module.name}`} />
            <div className="min-h-screen bg-background">
                <div className="flex">
                    {!isFullScreen && (
                        <ProjectSidebarPanel
                            project={project}
                            navGroups={navGroups}
                            repository={null}
                            completionPercentage={project.progress}
                            health={undefined}
                            isCollapsed={isSidebarCollapsed}
                            user={auth.user as unknown as User}
                        />
                    )}

                    <div
                        className={`flex flex-col bg-background text-foreground ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-full' : 'min-h-screen min-w-0 flex-1'}`}
                    >
                        {/* Toolbar - Hidden in full screen */}
                        {!isFullScreen && (
                            <div className="border-b border-border bg-card/50 px-4 py-3">
                                <div className="flex items-center justify-between">
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
                                        {module.erd_is_synced === false && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-amber-500 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                                                disabled={isSyncing}
                                                onClick={() => syncErd()}
                                            >
                                                {isSyncing ? (
                                                    <>
                                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                        Syncing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-1 h-3 w-3" />
                                                        Sync from Features
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" onClick={handleExportMermaid}>
                                            Export Mermaid
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleExportSQL}>
                                            Export SQL
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            id="resizable-container"
                            className={`relative flex min-h-0 flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none [&_*]:cursor-col-resize' : ''}`}
                        >
                            {/* Toggle Editor Button - Positioned dynamically based on editor state */}
                            {!isFullScreen && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                                    className="absolute top-1/2 z-30 h-12 w-6 -translate-y-1/2 rounded-l-none rounded-r-md border border-border bg-background/95 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted hover:shadow-lg"
                                    style={{
                                        left: isEditorCollapsed ? '0px' : `calc(${leftWidth}% + 4px)`,
                                        pointerEvents: isResizing ? 'none' : 'auto',
                                    }}
                                    title={isEditorCollapsed ? 'Show Editor Panel' : 'Hide Editor Panel'}
                                >
                                    {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                    <span className="sr-only">{isEditorCollapsed ? 'Show Editor Panel' : 'Hide Editor Panel'}</span>
                                </Button>
                            )}

                            {/* Collapsible Left Panel - Editor */}
                            {!isFullScreen && (
                                <div
                                    className={`flex min-h-0 min-w-0 flex-col bg-card/30 transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 overflow-hidden opacity-0' : 'opacity-100'}`}
                                    style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
                                >
                                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-2 py-2">
                                        <FormatSelector content={content} />
                                        <Button
                                            variant="default"
                                            size="sm"
                                            disabled={isSaving || !isDirty}
                                            className="mr-3 shrink-0"
                                            onClick={() => {
                                                if (!moduleId) {
                                                    toast.error('Module not found for save route.');
                                                    return;
                                                }
                                                setIsSaving(true);
                                                router.post(
                                                    `/projects/${project.id}/modules/${moduleId}/erd/edit`,
                                                    { erd: content },
                                                    {
                                                        onSuccess: () => {
                                                            setIsDirty(false);
                                                        },
                                                        onFinish: () => setIsSaving(false),
                                                    },
                                                );
                                            }}
                                        >
                                            {isSaving ? <TextShimmer>Saving...</TextShimmer> : 'Save'}
                                        </Button>
                                    </div>

                                    {/* Error Panel - Placed at top for visibility */}
                                    {error && (
                                        <DiagramErrorPanel
                                            error={error}
                                            onFixRequest={handleFixError}
                                            className="mx-3 mt-3 shrink-0"
                                        />
                                    )}

                                    {/* Editor Content Area */}
                                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                                        <div className="min-h-0 flex-1 overflow-hidden pb-28">
                                            <EditorPanel
                                                value={content}
                                                onChange={(val) => {
                                                    setContent(val);
                                                    setIsDirty(true);
                                                }}
                                                isResizing={isResizing}
                                            />
                                        </div>

                                        {/* AI Prompt Panel - Fixed at bottom */}
                                        <div className="absolute right-3 bottom-3 left-3 z-50 rounded-xl border border-border/80 bg-background/98 p-4 shadow-2xl backdrop-blur-lg transition-all duration-200">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Sparkles className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        type="text"
                                                        placeholder="Describe changes to your schema..."
                                                        value={prompt}
                                                        onChange={(e) => setPrompt(e.target.value)}
                                                        className="pr-4 pl-10"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleGenerate();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleGenerate}
                                                    disabled={!prompt.trim() || isGenerating}
                                                    size="sm"
                                                    className="bg-primary px-4 text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
                                                >
                                                    {isGenerating ? <TextShimmer className="text-white">Generating...</TextShimmer> : 'Generate'}
                                                </Button>
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground/80">
                                                Press Enter to generate • AI will update your schema based on your description
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resize Handle */}
                            {!isFullScreen && !isEditorCollapsed && (
                                <div
                                    className="group relative w-1.5 cursor-col-resize bg-border/50 transition-colors hover:bg-primary/60 active:bg-primary"
                                    onMouseDown={handleMouseDown}
                                >
                                    {/* Larger hit area for easier grabbing */}
                                    <div className="absolute inset-y-0 -right-2 -left-2 z-10" />
                                    {/* Visual indicator */}
                                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="flex h-16 w-2 items-center justify-center rounded-full bg-primary/30 backdrop-blur-sm">
                                            <div className="h-10 w-1 rounded-full bg-primary shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Right Panel - Diagram */}
                            <div
                                className={`relative flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isFullScreen ? 'w-full border-l-0' : isEditorCollapsed ? 'w-full border-l-0' : 'border-l-0'}`}
                                style={{ width: isFullScreen || isEditorCollapsed ? '100%' : `${100 - leftWidth}%` }}
                            >
                                {/* Diagram Controls */}
                                <DiagramControls
                                    onSearch={handleSearch}
                                    onArrange={handleArrange}
                                    onBackgroundChange={handleBackgroundChange}
                                    onAddTable={() => setIsAddTableOpen(true)}
                                    onToggleEditor={() => setIsEditorCollapsed(!isEditorCollapsed)}
                                    onToggleFullScreen={toggleFullScreen}
                                    searchQuery={searchQuery}
                                    isEditorCollapsed={isEditorCollapsed}
                                    isFullScreen={isFullScreen}
                                />

                                <div className="min-h-0 flex-1">
                                    {isGenerating ? (
                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                            <div className="text-center">
                                                <TextShimmer className="text-2xl font-semibold">Generating Module Schema...</TextShimmer>
                                                <p className="mt-4 text-sm text-muted-foreground">Please wait while we create your ERD diagram</p>
                                            </div>
                                        </div>
                                    ) : generationError ? (
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
                                                <p className="mb-6 text-sm text-muted-foreground">{generationError}</p>
                                                <Button
                                                    onClick={handleRegenerate}
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
                                        <DiagramCanvas
                                            ref={canvasRef}
                                            nodes={nodes}
                                            edges={edges}
                                            onNodesChange={handleNodesChange}
                                            onEdgesChange={handleEdgesChange}
                                            onNodeEdit={handleEditNode}
                                            onNodeDelete={handleDeleteNode}
                                            searchQuery={searchQuery}
                                            backgroundVariant={backgroundVariant}
                                            backgroundOptions={backgroundOptions}
                                            layoutTrigger={layoutTrigger}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Add Table Dialog */}
                        <AddTableDialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen} onAdd={handleAddTable} existingTables={currentNodes} />

                        {/* Edit Table Dialog */}
                        {editingNode && (
                            <EditTableDialog
                                open={isEditTableOpen}
                                onOpenChange={setIsEditTableOpen}
                                tableName={(editingNode.data?.tableName as string) || editingNode.id}
                                fields={(editingNode.data?.fields as any[]) || []}
                                onSave={handleSaveEdit}
                                existingTables={currentNodes}
                            />
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50">
                                <div className="rounded-lg border bg-card p-6 shadow-lg">
                                    <TextShimmer className="text-card-foreground">Parsing schema...</TextShimmer>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Toaster />
        </>
    );
}
