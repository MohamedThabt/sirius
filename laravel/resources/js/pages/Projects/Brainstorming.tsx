import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { type User, type Project, type Sections } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { MenuIcon } from 'lucide-react';
import { Excalidraw, exportToBlob, serializeAsJSON } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useThemeDetection } from '@/hooks/use-theme-detection';

// Project and Sections types now imported from @/types

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BrainstormingPageProps {
    project: Project;
    sections?: Sections;
}

export default function Brainstorming({ project, sections }: BrainstormingPageProps) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [elements, setElements] = useState<any[] | null>(null);
    const [appState, setAppState] = useState<any | null>(null);
    const [files, setFiles] = useState<Record<string, any> | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingRef = useRef(false);
    
    // Use refs to store latest values for handleSave
    const elementsRef = useRef<any[] | null>(null);
    const appStateRef = useRef<any | null>(null);
    const filesRef = useRef<Record<string, any> | null>(null);

    // WHY: Replaced ~23 lines of MutationObserver logic with shared hook
    const theme = useThemeDetection();

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Brainstorming', href: `/projects/${project.id}/brainstorming` },
    ];

    const completionPercentage = useMemo(() => {
        return project.progress ?? 0;
    }, [project.progress]);

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
        const elementsArray = els as any[];
        setElements(elementsArray);
        setAppState(app);
        setFiles(f);
        
        // Update refs with latest values
        elementsRef.current = elementsArray;
        appStateRef.current = app;
        filesRef.current = f;
        
        setSaveStatus('idle');
    }, []);

    const handleSave = useCallback(() => {
        if (isSavingRef.current) return;

        isSavingRef.current = true;
        setSaveStatus('saving');

        const payload = {
            scene: {
                elements: elementsRef.current ?? [],
                appState: appStateRef.current ?? {},
                files: filesRef.current ?? {},
            },
        };

        router.post(`/projects/${project.id}/brainstorming/scene`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setSaveStatus('saved');
                isSavingRef.current = false;
                // Reset to idle after 2 seconds
                setTimeout(() => setSaveStatus('idle'), 2000);
            },
            onError: () => {
                setSaveStatus('error');
                isSavingRef.current = false;
            },
        });
    }, [project.id]);

    // Autosave effect with debouncing
    useEffect(() => {
        // Don't autosave if there's no data yet (initial load)
        if (elements === null && appState === null && files === null) {
            return;
        }

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for autosave (5 seconds debounce)
        saveTimeoutRef.current = setTimeout(() => {
            handleSave();
        }, 5000);

        // Cleanup on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [elements, appState, files]); // Removed handleSave from dependencies

    // Periodic autosave every minute
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Only save if there's data to save
            if (elementsRef.current !== null || appStateRef.current !== null || filesRef.current !== null) {
                handleSave();
            }
        }, 60000); // 60 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, []); // Empty dependencies - interval runs independently

    // Save on page leave/navigation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // If there's a pending save timeout, save immediately
            if (saveTimeoutRef.current && (elementsRef.current !== null || appStateRef.current !== null || filesRef.current !== null)) {
                clearTimeout(saveTimeoutRef.current);
                
                // Use synchronous approach for beforeunload
                const payload = {
                    scene: {
                        elements: elementsRef.current ?? [],
                        appState: appStateRef.current ?? {},
                        files: filesRef.current ?? {},
                    },
                };
                
                // Use sendBeacon for reliable save on page unload
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(`/projects/${project.id}/brainstorming/scene`, blob);
            }
        };

        // Handle Inertia navigation (SPA navigation)
        const handleInertiaNavigate = () => {
            // If there's a pending save, execute it immediately
            if (saveTimeoutRef.current && (elementsRef.current !== null || appStateRef.current !== null || filesRef.current !== null)) {
                clearTimeout(saveTimeoutRef.current);
                handleSave();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Listen to Inertia's before event for SPA navigation
        router.on('before', handleInertiaNavigate);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            router.on('before', () => {}); // Cleanup Inertia listener
        };
    }, [project.id]); // Removed elements, appState, files, and handleSave from dependencies

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
                                <div className="flex items-center gap-2">
                                    {saveStatus === 'saving' && <span className="text-sm text-muted-foreground">Saving...</span>}
                                    {saveStatus === 'saved' && <span className="text-sm text-emerald-600">All changes saved</span>}
                                    {saveStatus === 'error' && <span className="text-sm text-destructive">Autosave failed</span>}
                                    <Button 
                                        size="sm" 
                                        onClick={handleSave} 
                                        variant={saveStatus === 'error' ? 'default' : 'outline'}
                                        disabled={saveStatus === 'saving'}
                                    >
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
