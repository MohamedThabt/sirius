import { Button } from '@/components/ui/button';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { WireframeRenderer, type SchemaNode as RendererSchemaNode } from '../../features/components/WireframeRenderer';

type SchemaNode = RendererSchemaNode;

interface Project {
    id: number;
    name: string;
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

interface WireframePageProps {
    schema?: SchemaNode;
    project: Project;
    feature: FeatureItem;
    isGenerating?: boolean;
}

const sampleSchema: SchemaNode = {
    id: 'breakout-rooms-page',
    type: 'page',
    children: [
        {
            id: 'breadcrumb',
            type: 'breadcrumb',
            crumbs: [{ label: 'Home' }, { label: 'Courses' }, { label: 'Breakout Rooms' }],
        },
        {
            id: 'header-section',
            type: 'section',
            layout: 'column',
            children: [
                { id: 'title', type: 'heading', level: 2 as any, text: 'Course Setup' },
                {
                    id: 'top-row',
                    type: 'container',
                    layout: 'row',
                    children: [
                        { id: 'label-course', type: 'text', text: 'Select Course:' },
                        {
                            id: 'select-course',
                            type: 'select',
                            text: 'Select a course',
                            options: ['Math 101', 'Physics 201', 'History 301'],
                        },
                        { id: 'header-help-link', type: 'link', text: 'Help' },
                        { id: 'header-icon', type: 'icon', name: 'i' as any },
                    ],
                },
                { id: 'header-divider', type: 'divider' },
            ],
        },
        {
            id: 'creation-grid',
            type: 'grid',
            columnsCount: 2,
            gap: 16,
            children: [
                {
                    id: 'create-card',
                    type: 'card',
                    children: [
                        { id: 'create-heading', type: 'heading', level: 3 as any, text: 'Create Room' },
                        { id: 'room-name', type: 'input', text: 'Room Name' },
                        { id: 'room-capacity', type: 'input', text: 'Room Capacity' },
                        { id: 'create-room', type: 'button', text: 'Create Room' },
                        { id: 'auto-assign', type: 'checkbox', text: 'Auto-assign Students' },
                    ],
                },
                {
                    id: 'settings-card',
                    type: 'card',
                    children: [
                        { id: 'bulk-heading', type: 'heading', level: 3 as any, text: 'Bulk Settings' },
                        { id: 'role-radio', type: 'radio-group', options: ['Observer', 'Assistant', 'Lead'] },
                        { id: 'recording-switch', type: 'switch', text: 'Enable Recording' },
                        { id: 'session-date', type: 'datepicker', text: 'Session Date' },
                    ],
                },
            ],
        },
        { id: 'rooms-section-title', type: 'heading', level: 3 as any, text: 'Rooms' },
        {
            id: 'room-list-container',
            type: 'container',
            children: [
                {
                    id: 'room-list-datatable',
                    type: 'datatable',
                    columns: ['Room Name', 'Capacity', 'Students', 'Status', 'Actions'],
                    rows: [],
                },
                { id: 'rooms-pagination', type: 'pagination', total: 5 as any, page: 1 as any },
            ],
        },
        { id: 'monitoring-title', type: 'heading', level: 3 as any, text: 'Monitoring' },
        {
            id: 'monitor-grid',
            type: 'grid',
            columnsCount: 2,
            children: [
                {
                    id: 'chat-card',
                    type: 'card',
                    children: [
                        { id: 'chat-title', type: 'text', text: 'Chat Log' },
                        { id: 'chat-input', type: 'textarea', text: 'Enter Message' },
                    ],
                },
                {
                    id: 'video-card',
                    type: 'card',
                    children: [{ id: 'video', type: 'video' }],
                },
            ],
        },
        { id: 'stats-title', type: 'heading', level: 3 as any, text: 'Stats' },
        { id: 'progress', type: 'progress', value: 60 as any },
        { id: 'spacer-1', type: 'spacer', height: 12 as any },
        { id: 'loading-skeleton', type: 'skeleton', width: '100%' as any, height: 16 as any },
        {
            id: 'extras-tabs',
            type: 'tabs',
            children: [
                {
                    id: 'overview-tab-content',
                    type: 'container',
                    children: [{ id: 'overview-text', type: 'text', text: 'Overview content...' }],
                },
            ],
            itemsMap: [
                { id: 'overview', label: 'Overview' },
                { id: 'settings', label: 'Settings' },
            ],
        },
        {
            id: 'settings-accordion',
            type: 'accordion',
            itemsMap: [
                {
                    id: 'a',
                    label: 'Advanced',
                    content: { id: 'adv-text', type: 'text', text: 'Advanced content' } as any,
                },
                {
                    id: 'b',
                    label: 'Notes',
                    content: { id: 'notes-text', type: 'text', text: 'Some notes...' } as any,
                },
            ],
        },
        {
            id: 'demo-modal',
            type: 'modal',
            title: 'Sample Modal' as any,
            children: [{ id: 'modal-text', type: 'text', text: 'Modal content preview' }],
        },
        {
            id: 'footer',
            type: 'footer',
            text: '© 2025',
        },
    ],
};

function getNodeLabel(node: SchemaNode): string {
    switch (node.type) {
        case 'navbar':
            return `Navbar: ${(node.items || []).join(', ')}`;
        case 'hero':
            return `Hero: ${node.title || 'Title'}${node.button ? ` + ${node.button}` : ''}`;
        case 'text':
            return node.text || 'Text';
        case 'button':
            return `Button: ${node.button || 'Action'}`;
        case 'footer':
            return `Footer: ${node.text || ''}`;
        case 'container':
            return `Container (${node.layout || 'column'})`;
        case 'page':
            return 'Page';
        default:
            return node.type;
    }
}

export default function WireframePage({ schema, project, feature, isGenerating: initialIsGenerating = false }: WireframePageProps) {
    useFlashToasts();
    const [content, setContent] = useState<string>(JSON.stringify(schema || sampleSchema, null, 2));
    const [error, setError] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [device, setDevice] = useState<'desktop' | 'tablet'>('desktop');
    const [zoom, setZoom] = useState<number>(1);
    const [chatInput, setChatInput] = useState<string>('');
    const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; text: string }[]>([]);
    const [isGenerating, setIsGenerating] = useState(initialIsGenerating);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Features', href: `/admin/projects/${project.id}` },
        { title: feature.name, href: `/admin/features/${feature.id}` },
        { title: 'Wireframe', href: '#' },
    ];

    useEffect(() => {
        // Sync editor when server-provided schema changes
        if (schema) {
            setContent(JSON.stringify(schema, null, 2));
        }
    }, [schema]);

    // Handle initial generation trigger
    useEffect(() => {
        if (initialIsGenerating && feature) {
            triggerAsyncGeneration();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIsGenerating, feature]);

    // Handle initial async generation
    const triggerAsyncGeneration = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/features/${feature.id}/wireframe/generate-async`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success && data.schema) {
                    setContent(JSON.stringify(data.schema, null, 2));
                    toast.success('Wireframe generated successfully!');
                } else {
                    toast.error(data.message || 'Failed to generate wireframe');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to generate wireframe. Please try again.');
            }
        } catch (error) {
            console.error('Error generating wireframe:', error);
            toast.error('An error occurred while generating the wireframe.');
        } finally {
            setIsGenerating(false);
        }
    };

    const parsedSchema = useMemo<RendererSchemaNode | null>(() => {
        try {
            const parsed = JSON.parse(content);
            setError(null);
            return parsed;
        } catch (e: any) {
            setError(e?.message || 'Invalid JSON');
            return null;
        }
    }, [content]);

    const getNodeById = (root: any, id: string | null): any | null => {
        if (!root || !id) return null;
        if (root.id === id) return root;
        for (const ch of root.children || []) {
            const found = getNodeById(ch, id);
            if (found) return found;
        }
        return null;
    };

    const selectedNode = useMemo(() => {
        if (!parsedSchema) return null;
        return getNodeById(parsedSchema, selectedNodeId);
    }, [parsedSchema, selectedNodeId]);

    const updateNodeInJson = (id: string, updater: (node: any) => any) => {
        try {
            const tree = JSON.parse(content);
            const visit = (n: any) => {
                if (!n) return n;
                if (n.id === id) {
                    return updater({ ...n });
                }
                if (Array.isArray(n.children)) {
                    n.children = n.children.map((c: any) => visit(c));
                }
                return n;
            };
            const updated = visit(tree);
            setContent(JSON.stringify(updated, null, 2));
        } catch {}
    };

    const deleteNodeInJson = (id: string) => {
        try {
            const tree = JSON.parse(content);
            const filterVisit = (n: any): any => {
                if (!n) return n;
                if (Array.isArray(n.children)) {
                    n.children = n.children.filter((c: any) => c.id !== id).map((c: any) => filterVisit(c));
                }
                return n;
            };
            const updated = filterVisit(tree);
            setContent(JSON.stringify(updated, null, 2));
            if (selectedNodeId === id) setSelectedNodeId(null);
            toast.success('Element removed');
        } catch {
            toast.error('Failed to remove element');
        }
    };

    const findPath = (root: any, id: string, trail: string[] = []): string[] | null => {
        if (!root) return null;
        const nextTrail = [...trail, `${root.type}:${root.id}`];
        if (root.id === id) return nextTrail;
        for (const ch of root.children || []) {
            const res = findPath(ch, id, nextTrail);
            if (res) return res;
        }
        return null;
    };

    const toggleFullScreen = () => setIsFullScreen((v) => !v);

    const handleSendMessage = async () => {
        const text = chatInput.trim();
        if (!text || !feature) return;

        const userMsg = { id: `u-${Date.now()}`, role: 'user' as const, text };
        setMessages((prev) => [...prev, userMsg]);
        setChatInput('');
        setIsGenerating(true);

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch(`/features/${feature.id}/wireframe/ai-edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    engineer_notes: text,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.schema) {
                    setContent(JSON.stringify(data.schema, null, 2));
                    const assistantMsg = {
                        id: `a-${Date.now()}`,
                        role: 'assistant' as const,
                        text: data.message || 'Wireframe updated successfully!',
                    };
                    setMessages((prev) => [...prev, assistantMsg]);
                    toast.success('Wireframe updated with AI suggestions');
                } else {
                    throw new Error(data.message || 'Failed to update wireframe');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update wireframe with AI');
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Network error occurred';
            const assistantMsg = {
                id: `a-${Date.now()}`,
                role: 'assistant' as const,
                text: `Sorry, I encountered an error: ${errorMsg}`,
            };
            setMessages((prev) => [...prev, assistantMsg]);
            toast.error(errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const renderContent = () => (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
            <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-3">
                <div className="flex items-center space-x-4">
                    {/* Breadcrumbs are already in AppLayout, but we can add controls here if needed */}
                    <div className="text-sm text-muted-foreground">Interactive Wireframe Editor</div>
                </div>
            </div>

            <div className="relative flex flex-1 overflow-hidden">
                <div className={`relative flex h-full w-[32%] min-w-0 flex-col border-r border-border transition-all duration-300 ease-in-out`}>
                    <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-background via-background/98 to-background px-4 py-2">
                        <div className="text-sm font-medium opacity-80">AI Chat</div>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto p-3">
                        {messages.length === 0 && (
                            <div className="text-xs text-muted-foreground">
                                {feature ? 'Ask the AI to suggest layout changes or add elements.' : 'Feature data not available for AI editing.'}
                            </div>
                        )}
                        {messages.map((m) => (
                            <div key={m.id} className={`text-sm ${m.role === 'assistant' ? 'text-muted-foreground' : ''}`}>
                                <span className="mr-1 font-semibold">{m.role === 'user' ? 'You:' : 'AI:'}</span>
                                <span>{m.text}</span>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="text-sm text-muted-foreground">
                                <span className="mr-1 font-semibold">AI:</span>
                                <TextShimmer className="text-muted-foreground">Generating wireframe updates...</TextShimmer>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-border/50 p-3">
                        <div className="flex items-center gap-2">
                            <input
                                className="flex-1 rounded-md border border-border bg-background px-2 py-2 text-sm"
                                placeholder={
                                    !feature
                                        ? 'Feature data required for AI editing'
                                        : isGenerating
                                          ? 'AI is generating...'
                                          : selectedNodeId
                                            ? 'e.g. Add a button inside selected element'
                                            : 'e.g. Add a hero section'
                                }
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isGenerating || !feature}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isGenerating && feature) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <Button onClick={handleSendMessage} disabled={!chatInput.trim() || isGenerating || !feature}>
                                {isGenerating ? <TextShimmer>Generating...</TextShimmer> : 'Send'}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className={`relative flex w-[68%] min-w-0 flex-col transition-all duration-300 ease-in-out`}>
                    <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-background via-background/98 to-background px-4 py-2">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium opacity-80">Wireframe Preview</span>
                            {selectedNodeId && parsedSchema && (
                                <div className="hidden items-center gap-1 md:flex">
                                    {findPath(parsedSchema, selectedNodeId)?.map((crumb, idx, arr) => {
                                        const [type, id] = crumb.split(':');
                                        const isLast = idx === arr.length - 1;
                                        return (
                                            <button
                                                key={crumb}
                                                onClick={() => setSelectedNodeId(id)}
                                                className={`rounded px-1.5 py-0.5 text-xs ${isLast ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                                title={`${type} • ${id}`}
                                            >
                                                {type}
                                                {!isLast && <span className="mx-1 opacity-50">/</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                                value={device}
                                onChange={(e) => setDevice(e.target.value as any)}
                                title="Device size"
                            >
                                <option value="desktop">Desktop</option>
                                <option value="tablet">Tablet</option>
                            </select>
                            <select
                                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                title="Zoom"
                            >
                                <option value={1}>100%</option>
                                <option value={0.9}>90%</option>
                                <option value={0.8}>80%</option>
                                <option value={0.7}>70%</option>
                            </select>
                            <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                                {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                            <div>
                                <div
                                    className={``}
                                    style={{
                                        width: '100%',
                                        maxWidth: device === 'tablet' ? 820 : 1100,
                                        margin: '0 auto',
                                        transform: `scale(${Math.min(zoom, 1)})`,
                                        transformOrigin: 'top center',
                                        transition: 'transform 0.2s ease',
                                        padding: 8,
                                    }}
                                >
                                    {parsedSchema && !isGenerating ? (
                                        <WireframeRenderer node={parsedSchema} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
                                    ) : isGenerating ? (
                                        <div className="flex h-full min-h-[400px] items-center justify-center">
                                            <div className="text-center">
                                                <TextShimmer className="text-2xl font-semibold">Generating Wireframe...</TextShimmer>
                                                <p className="mt-4 text-sm text-muted-foreground">Please wait while we create your wireframe</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Provide a valid JSON schema to render</div>
                                    )}
                                </div>
                                {error && (
                                    <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive-foreground">
                                        Syntax Error: {error}
                                    </div>
                                )}
                            </div>
                            <div className="sticky top-0 h-fit rounded-lg border border-border bg-card p-4">
                                <div className="mb-3 flex items-center justify-between text-sm">
                                    <div className="font-semibold">Properties</div>
                                    {selectedNode && <span className="text-xs text-muted-foreground">{selectedNode.type}</span>}
                                </div>
                                {selectedNodeId ? (
                                    <div className="space-y-3 text-sm">
                                        <div className="text-muted-foreground">Selected: {selectedNodeId}</div>
                                        <div className="grid gap-2">
                                            <label className="text-xs">Text</label>
                                            <input
                                                className="rounded-md border border-border bg-background px-2 py-1"
                                                placeholder="text"
                                                value={(selectedNode as any)?.text ?? ''}
                                                onChange={(e) => updateNodeInJson(selectedNodeId, (n) => ({ ...n, text: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-xs">Class Name</label>
                                            <input
                                                className="rounded-md border border-border bg-background px-2 py-1"
                                                placeholder="className"
                                                value={(selectedNode as any)?.className ?? ''}
                                                onChange={(e) => updateNodeInJson(selectedNodeId, (n) => ({ ...n, className: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-xs">Layout</label>
                                            <select
                                                className="rounded-md border border-border bg-background px-2 py-1"
                                                value={(selectedNode as any)?.layout ?? ''}
                                                onChange={(e) => updateNodeInJson(selectedNodeId, (n) => ({ ...n, layout: e.target.value }))}
                                            >
                                                <option value="">(inherit)</option>
                                                <option value="row">row</option>
                                                <option value="column">column</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2 pt-1">
                                            <label className="text-xs">Quick add</label>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        updateNodeInJson(selectedNodeId!, (n) => {
                                                            const children = Array.isArray(n.children) ? n.children.slice() : [];
                                                            children.push({ id: `text-${Date.now()}`, type: 'text', text: 'New text' });
                                                            n.children = children;
                                                            return n;
                                                        })
                                                    }
                                                >
                                                    + Text
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        updateNodeInJson(selectedNodeId!, (n) => {
                                                            const children = Array.isArray(n.children) ? n.children.slice() : [];
                                                            children.push({ id: `button-${Date.now()}`, type: 'button', text: 'Button' } as any);
                                                            n.children = children;
                                                            return n;
                                                        })
                                                    }
                                                >
                                                    + Button
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        updateNodeInJson(selectedNodeId!, (n) => {
                                                            const children = Array.isArray(n.children) ? n.children.slice() : [];
                                                            children.push({
                                                                id: `container-${Date.now()}`,
                                                                type: 'container',
                                                                layout: 'row',
                                                                children: [],
                                                            });
                                                            n.children = children;
                                                            return n;
                                                        })
                                                    }
                                                >
                                                    + Row
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        updateNodeInJson(selectedNodeId!, (n) => {
                                                            const children = Array.isArray(n.children) ? n.children.slice() : [];
                                                            children.push({
                                                                id: `container-${Date.now()}`,
                                                                type: 'container',
                                                                layout: 'column',
                                                                children: [],
                                                            });
                                                            n.children = children;
                                                            return n;
                                                        })
                                                    }
                                                >
                                                    + Column
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="destructive" size="sm" onClick={() => deleteNodeInJson(selectedNodeId!)}>
                                                Remove Element
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground">Click any element in the preview to edit its properties</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isFullScreen) {
        return (
            <>
                <Head title={`Wireframe - ${feature.name}`} />
                <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">{renderContent()}</div>
            </>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Wireframe - ${feature.name}`} />
            <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-border bg-background">{renderContent()}</div>
        </AppLayout>
    );
}
