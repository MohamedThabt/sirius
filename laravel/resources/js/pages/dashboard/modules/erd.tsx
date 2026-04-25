import DiagramCanvas from '@/components/database-designer/DiagramCanvas';
import EditorPanel from '@/components/database-designer/EditorPanel';
import FormatSelector from '@/components/database-designer/FormatSelector';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDBMLParser } from '@/hooks/useDBMLParser';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { exportAsSQL } from '@/utils/exportUtils';
import { convertFormat, detectFormat } from '@/utils/formatConverters';
import { Head } from '@inertiajs/react';
import { BackgroundVariant } from '@xyflow/react';
import { ChevronLeft, ChevronRight, DatabaseIcon, Download, FileCode, FileText } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Project {
    id: number;
    name: string;
}

interface Module {
    id: number;
    name: string;
    project_id: number;
    erd?: string | null;
    erd_is_synced?: boolean;
}

interface Props {
    project: Project;
    module: Module;
    initialContent?: string;
}

export default function ModuleErd({ project, module, initialContent }: Props) {
    const [content, setContent] = useState(initialContent ?? '');
    const [searchQuery] = useState('');
    const [backgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
    const [backgroundOptions] = useState({
        gap: 20,
        size: 1,
    });
    const canvasRef = useRef<HTMLDivElement>(null);
    const { nodes, edges, error } = useDBMLParser(content);
    const [layoutTrigger] = useState<{ algorithm: string; timestamp: number } | null>(null);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const rafIdRef = useRef<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Modules', href: '/admin/modules' },
        { title: module.name, href: `/admin/modules/${module.id}` },
        { title: 'ERD', href: '#' },
    ];

    useEffect(() => {
        if (typeof initialContent === 'string' && initialContent.trim()) {
            setContent(initialContent);
        }
    }, [initialContent]);

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
        } catch {
            toast.error('Failed to export Mermaid. Please check your schema.');
        }
    };

    const handleExportSQL = () => {
        try {
            const currentFormat = detectFormat(content);
            const dbmlContent = currentFormat === 'mermaid' ? convertFormat(content, 'mermaid', 'dbml') : content;
            exportAsSQL(dbmlContent, 'postgresql');
            toast.success('SQL schema exported successfully!');
        } catch {
            toast.error('Failed to export SQL. Please check your schema.');
        }
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing) return;
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
            rafIdRef.current = requestAnimationFrame(() => {
                const containerWidth = window.innerWidth;
                const newLeftWidth = (e.clientX / containerWidth) * 100;
                const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
                setLeftWidth(clampedWidth);
            });
        },
        [isResizing],
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`ERD - ${module.name}`} />

            <div className="flex h-full flex-1 flex-col rounded-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-3">
                        <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <h1 className="text-lg font-semibold">{module.name} - Entity Relationship Diagram</h1>
                            <p className="text-xs text-muted-foreground">View the module's database schema (read-only)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={!content.trim()}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportMermaid}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export as Mermaid
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportSQL}>
                                    <FileCode className="mr-2 h-4 w-4" />
                                    Export as SQL
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">
                    {/* Toggle Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-1/2 left-0 z-10 h-8 w-8 -translate-y-1/2 rounded-l-none"
                        style={{ left: isEditorCollapsed ? 0 : `calc(${leftWidth}% - 16px)` }}
                        onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                    >
                        {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>

                    {/* Left Panel - Editor (Read-Only) */}
                    <div
                        className={`flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'}`}
                        style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
                    >
                        <FormatSelector content={content} />

                        {/* Info Note */}
                        <div className="mx-4 mb-4 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Read-Only View</h3>
                            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                This is a read-only view of the database schema. Schema editing is only available to module owners.
                            </p>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {content ? (
                                <EditorPanel value={content} onChange={() => {}} readOnly={true} />
                            ) : (
                                <div className="flex h-full items-center justify-center p-8">
                                    <div className="text-center">
                                        <DatabaseIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                                        <p className="text-lg font-medium text-muted-foreground">No Database Schema</p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            The database schema for this module has not been created yet.
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

                    {/* Resize Handle */}
                    {!isEditorCollapsed && (
                        <div
                            className="group relative w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/50"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="absolute inset-y-0 -right-1 -left-1" />
                        </div>
                    )}

                    {/* Right Panel - Diagram */}
                    <div
                        className={`relative flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'w-full border-l-0' : 'border-l-0'}`}
                        style={{ width: isEditorCollapsed ? '100%' : `${100 - leftWidth}%` }}
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
                                        <DatabaseIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-20" />
                                        <h3 className="mb-2 text-xl font-semibold text-foreground">No Database Schema</h3>
                                        <p className="text-sm text-muted-foreground">The database schema for this module has not been created yet.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
