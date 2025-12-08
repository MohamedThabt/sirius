import DiagramCanvas from '@/components/database-designer/DiagramCanvas';
import EditorPanel from '@/components/database-designer/EditorPanel';
import FormatSelector from '@/components/database-designer/FormatSelector';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BackgroundVariant } from '@xyflow/react';
import { ChevronLeft, ChevronRight, DatabaseIcon, Download, FileCode, FileText } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDBMLParser } from '@/hooks/useDBMLParser';
import { exportAsSQL } from '@/utils/exportUtils';
import { convertFormat, detectFormat, type DiagramFormat } from '@/utils/formatConverters';

interface Project {
    id: number;
    name: string;
}

interface Feature {
    id: number;
    name: string;
    project_id: number;
    erd?: string | null;
}

interface Props {
    project: Project;
    feature: Feature;
    initialContent?: string;
}

export default function DatabaseDesigner({ project, feature, initialContent }: Props) {
    const [content, setContent] = useState(initialContent ?? '');
    const [searchQuery, setSearchQuery] = useState('');
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
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const rafIdRef = useRef<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: project.name, href: `/admin/projects/${project.id}` },
        { title: 'Features', href: `/admin/projects/${project.id}` },
        { title: feature.name, href: `/admin/features/${feature.id}` },
        { title: 'Database Designer', href: '#' },
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
            a.download = `${feature.name}-er-diagram.mermaid`;
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

    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
            const container = document.getElementById('resizable-container');
            if (!container) return;
            const containerRect = container.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Database Designer - ${feature.name}`} />

            <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden bg-background text-foreground">
                {/* Tools Row */}
                <div className="border-b px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Database Schema (Read-Only)</h2>
                        
                        <div className="flex items-center gap-2">
                            {/* Export Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={handleExportMermaid}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Mermaid ERD
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportSQL}>
                                        <FileCode className="mr-2 h-4 w-4" />
                                        SQL Script
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden bg-background text-foreground">
                    <div
                        id="resizable-container"
                        className={`relative flex min-h-0 flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
                    >
                        {/* Toggle Editor Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                            className={`absolute top-1/2 z-20 h-12 w-6 -translate-y-1/2 rounded-l-none rounded-r-md border border-border bg-background/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted ${isEditorCollapsed ? 'left-0' : 'left-[calc(var(--left-width)-12px)]'}`}
                            style={{ '--left-width': `${leftWidth}%` } as React.CSSProperties}
                        >
                            {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>

                        {/* Left Panel - Editor (Read-Only) */}
                        <div
                            className={`flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'}`}
                            style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
                        >
                            <FormatSelector content={content} onConvert={handleConvert} isConverting={isConverting} />

                            {/* Info Note */}
                            <div className="mx-4 mb-2 rounded border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3">
                                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Read-Only View</h3>
                                <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
                                    This is a read-only view of the database schema. Schema editing is only available to feature owners.
                                </p>
                            </div>

                            <div className="min-h-0 flex-1 overflow-hidden">
                                {content ? (
                                    <EditorPanel value={content} onChange={() => {}} readOnly={true} />
                                ) : (
                                    <div className="flex h-full items-center justify-center p-8">
                                        <div className="text-center">
                                            <DatabaseIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                                            <p className="text-lg font-medium text-muted-foreground">No Database Schema</p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                The database schema for this feature has not been created yet.
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
                                            <p className="text-sm text-muted-foreground">
                                                The database schema for this feature has not been created yet.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
