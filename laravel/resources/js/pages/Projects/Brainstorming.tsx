import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { type User } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Excalidraw, exportToBlob, serializeAsJSON } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Head, router, usePage } from '@inertiajs/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useThemeDetection } from '@/hooks/use-theme-detection';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    status: string;
    c4: string | null;
    created_at: string;
    updated_at: string;
    brainstorming_scene?: any;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    non_functional_requirements: string | null;
}

interface BrainstormingPageProps {
    project: Project;
    sections?: Sections;
}

export default function Brainstorming({ project, sections }: BrainstormingPageProps) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [elements, setElements] = useState<any[] | null>(null);
    const [appState, setAppState] = useState<any | null>(null);
    const [files, setFiles] = useState<Record<string, any> | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // WHY: Replaced ~23 lines of MutationObserver logic with shared hook
    const theme = useThemeDetection();

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Brainstorming', href: `/projects/${project.id}/brainstorming` },
    ];

    const completionPercentage = useMemo(() => {
        const total = 5;
        let done = 0;
        if (sections?.overview) done++;
        if (sections?.prd) done++;
        if (sections?.data_modeling) done++;
        if (project.c4) done++;
        if (sections?.non_functional_requirements) done++;
        return Math.round((done / total) * 100);
    }, [sections, project.c4]);

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'brainstorming',
            }),
        [project],
    );

    // Theme detection now handled by useThemeDetection hook

    const handleChange = useCallback((els: readonly any[], app: any, f: Record<string, any>) => {
        setHasUnsavedChanges(true);
        setElements(els as any[]);
        setAppState(app);
        setFiles(f);
    }, []);

    const handleSave = useCallback(() => {
        const payload = {
            scene: {
                elements: elements ?? [],
                appState: appState ?? {},
                files: files ?? {},
            },
        };
        router.post(`/projects/${project.id}/brainstorming/scene`, payload, {
            preserveScroll: true,
            onSuccess: () => setHasUnsavedChanges(false),
        });
    }, [elements, appState, files, project.id]);

    return (
        <>
            <Head title={`Brainstorming - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        completionPercentage={completionPercentage}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user}
                    />

                    <main className="flex min-w-0 flex-1 flex-col">
                        <div className="shrink-0 border-b px-4 py-3 sm:pl-6 lg:pl-6">
                            <div className="flex items-center justify-between gap-3">
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
                                    {hasUnsavedChanges && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
                                    <Button size="sm" onClick={handleSave} variant={hasUnsavedChanges ? 'default' : 'outline'}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
                            <Excalidraw
                                onChange={handleChange}
                                theme={theme}
                                name={`${project.name} - Brainstorming`}
                                initialData={project.brainstorming_scene ?? undefined}
                                UIOptions={{
                                    canvasActions: {
                                        loadScene: false,
                                        saveToActiveFile: false,
                                        export: false,
                                        toggleTheme: true,
                                    },
                                }}
                            />
                        </div>
                    </main>
                </div>
            </div>
            <Toaster />
        </>
    );
}
