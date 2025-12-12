import FeatureSidebar from '@/components/Features/FeatureSidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BackgroundVariant, Edge, Node } from '@xyflow/react';
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { DiagramFormat, convertFormat, detectFormat } from '@/utils/formatConverters';

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

interface Module {
    id: number;
    name: string;
    description: string;
    status: 'planned' | 'in_progress' | 'completed';
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
    datamodel?: string | null;
    sequence_diagram?: string | null;
    wireframe?: string | null;
    module?: Module;
}

interface Props {
    project: Project;
    feature?: FeatureItem;
    initialContent?: string;
    featureId?: number;
    isGenerating?: boolean;
}

// Sample DBML schema
const sampleDBML = `// E-Commerce Database Schema
// This is a sample schema demonstrating DBML syntax

Table users {
  id integer [pk]
  username varchar [unique, not null]
  email varchar [unique, not null]
  password_hash varchar [not null]
  first_name varchar
  last_name varchar
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table products {
  id integer [pk]
  name varchar [not null]
  description text
  price decimal [not null]
  stock_quantity integer [default: 0]
  category_id integer [ref: > categories.id]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id integer [pk]
  name varchar [not null]
  description text
  parent_id integer [ref: > categories.id]
  created_at timestamp [default: 'now()']
}

Table orders {
  id integer [pk]
  user_id integer [ref: > users.id]
  status varchar [default: 'pending']
  total_amount decimal [not null]
  shipping_address text
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table order_items {
  id integer [pk]
  order_id integer [ref: > orders.id]
  product_id integer [ref: > products.id]
  quantity integer [not null]
  unit_price decimal [not null]
  total_price decimal [not null]
}

Table reviews {
  id integer [pk]
  user_id integer [ref: > users.id]
  product_id integer [ref: > products.id]
  rating integer [not null]
  comment text
  created_at timestamp [default: 'now()']
}

// Relationships
Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id
Ref: reviews.user_id > users.id
Ref: reviews.product_id > products.id
`;

export default function DatabaseDesigner({ project, feature, initialContent, featureId, isGenerating: initialIsGenerating = false }: Props) {
    useFlashToasts();
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [content, setContent] = useState(initialContent ?? sampleDBML);
    const [searchQuery, setSearchQuery] = useState('');
    const [prompt, setPrompt] = useState('');
    const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
    const [backgroundOptions, setBackgroundOptions] = useState({
        gap: 20,
        size: 1,
    });
    const [isConverting, setIsConverting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(initialIsGenerating);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { nodes, edges, error, isLoading } = useDBMLParser(content);
    const [layoutTrigger, setLayoutTrigger] = useState<{ algorithm: string; timestamp: number } | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50); // Left panel width in percentage
    const [isResizing, setIsResizing] = useState(false);
    const rafIdRef = useRef<number | null>(null);

    // Interactive editing states
    const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
    const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
    const [isAddTableOpen, setIsAddTableOpen] = useState(false);
    const [isEditTableOpen, setIsEditTableOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<Node | null>(null);

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

    // Sync editor content when server provides updated ERD after edits
    useEffect(() => {
        if (typeof initialContent === 'string' && initialContent.trim()) {
            setContent(initialContent);
            // If initial content is different from current content, don't mark as dirty
            // This handles the case when the page first loads with saved content
            setIsDirty(false);
        }
    }, [initialContent]);

    // Sync editor content when feature datamodel is updated (e.g., after AI edit)
    useEffect(() => {
        if (feature?.datamodel && typeof feature.datamodel === 'string' && feature.datamodel.trim()) {
            setContent(feature.datamodel);
            setIsDirty(false);
        }
    }, [feature?.datamodel]);

    // Sync editor content when AI edit returns new ERD via flash
    useEffect(() => {
        if (shared.flash?.erd && typeof shared.flash.erd === 'string') {
            setContent(shared.flash.erd);
            setIsDirty(false);
        }
    }, [shared.flash?.erd]);

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

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        if (!featureId) {
            toast.error('Feature not found for AI edit route.');
            return;
        }
        router.post(
            `/features/${featureId}/datamodel/ai-edit`,
            { engineer_notes: prompt },
            {
                onStart: () => setIsGenerating(true),
                onSuccess: (page) => {
                    setPrompt('');
                    // Visit the datamodel page again to get fresh data with updated ERD
                    router.visit(`/features/${featureId}/datamodel`, {
                        preserveScroll: true,
                        only: ['feature', 'initialContent'],
                        onSuccess: () => {
                            // The useEffect hooks will handle updating the content
                            // from either flash.erd, feature.datamodel, or initialContent
                        },
                    });
                },
                onError: () => toast.error('Failed to edit ERD. Please try again.'),
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

    // Interactive editing handlers
    const handleNodesChange = useCallback(
        (updatedNodes: Node[]) => {
            setCurrentNodes(updatedNodes);
            // Convert nodes back to current format and update content
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
            // Convert nodes back to current format and update content
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

        // Create edges for FK fields with references
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

        // Convert to current format and update content
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

        // Update edges if table name changed
        let updatedEdges = currentEdges.map((edge) => ({
            ...edge,
            source: edge.source === editingNode.id ? tableName : edge.source,
            target: edge.target === editingNode.id ? tableName : edge.target,
        }));

        // Remove old FK edges for this table
        updatedEdges = updatedEdges.filter((edge) => edge.source !== tableName && edge.target !== tableName);

        // Create edges for FK fields with references
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

        // Convert to current format and update content
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

        // Convert to current format and update content
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

    // Add event listeners for resize
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
        ...(feature?.module
            ? [
                  { title: 'Modules', href: `/projects/${project.id}/modules` },
                  { title: feature.module.name, href: `/projects/${project.id}/modules/${feature.module.id}` },
                  { title: feature.name, href: `/projects/${project.id}/modules/${feature.module.id}/features/${feature.id}` },
              ]
            : [{ title: feature?.name || 'Feature', href: '#' }]),
        { title: 'Database Designer', href: `/features/${feature?.id}/datamodel` },
    ];

    if (!feature) {
        return <div>Feature not found</div>;
    }

    return (
        <>
            <Head title={`Database Designer - ${feature.name}`} />
            <div className="min-h-screen bg-background">
                <div className="flex">
                    {!isFullScreen && (
                        <FeatureSidebar
                            project={project}
                            feature={feature}
                            activeSection="erd"
                            auth={auth}
                            isSidebarCollapsed={isSidebarCollapsed}
                            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
                            className={`relative flex min-h-0 flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
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
                                        <FormatSelector content={content} onConvert={handleConvert} isConverting={isConverting} />
                                        <Button
                                            variant="default"
                                            size="sm"
                                            disabled={isSaving || !isDirty}
                                            className="mr-3 shrink-0"
                                            onClick={() => {
                                                if (!featureId) {
                                                    toast.error('Feature not found for save route.');
                                                    return;
                                                }
                                                setIsSaving(true);
                                                router.post(
                                                    `/features/${featureId}/datamodel/edit`,
                                                    { datamodel: content },
                                                    {
                                                        onSuccess: () => {
                                                            setIsDirty(false);
                                                            toast.success('Datamodel saved successfully!');
                                                        },
                                                        onError: () => {
                                                            toast.error('Failed to save datamodel. Please try again.');
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
                                        <div className="mx-3 mt-3 shrink-0 rounded-lg border-l-4 border-destructive bg-destructive/10 p-3">
                                            <p className="text-sm text-destructive-foreground">
                                                <strong>Parse Error:</strong> {error}
                                            </p>
                                        </div>
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
                                {/* Diagram Controls - Always visible */}
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
                                                <TextShimmer className="text-2xl font-semibold">Generating Database Schema...</TextShimmer>
                                                <p className="mt-4 text-sm text-muted-foreground">Please wait while we create your ERD diagram</p>
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
