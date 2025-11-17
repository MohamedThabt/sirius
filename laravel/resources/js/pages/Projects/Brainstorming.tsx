import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    PanelLeftClose,
    PanelLeftOpen,
    TrendingUpIcon,
    ZapIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [elements, setElements] = useState<any[] | null>(null);
    const [appState, setAppState] = useState<any | null>(null);
    const [files, setFiles] = useState<Record<string, any> | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Brainstorming', href: `/projects/${project.id}/brainstorming` },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <AlertCircleIcon className="h-4 w-4" />;
            case 'in_progress':
                return <ZapIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            default:
                return <AlertCircleIcon className="h-4 w-4" />;
        }
    };

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

    const getHealthIcon = () => {
        if (completionPercentage >= 80) return <CheckCircleIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-300" />;
        if (completionPercentage >= 60) return <TrendingUpIcon className="h-3 w-3 text-blue-600 dark:text-blue-300" />;
        if (completionPercentage >= 40) return <AlertCircleIcon className="h-3 w-3 text-orange-600 dark:text-orange-300" />;
        return <AlertCircleIcon className="h-3 w-3 text-red-600 dark:text-red-300" />;
    };

    const getHealthStatus = () => {
        if (completionPercentage >= 80) return 'excellent';
        if (completionPercentage >= 60) return 'good';
        if (completionPercentage >= 40) return 'fair';
        return 'needs attention';
    };

    interface NavItem {
        key: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        muted?: boolean;
        emphasize?: boolean;
        active?: boolean;
        badge?: string;
        disabled?: boolean;
        onClick: () => void;
    }

    interface NavGroup {
        label: string;
        items: NavItem[];
    }

    const navGroups: NavGroup[] = [
        {
            label: 'Plan',
            items: [
                { key: 'home', icon: HomeIcon, label: 'Project Home', onClick: () => router.visit(`/projects/${project.id}`) },
                {
                    key: 'overview',
                    icon: FileIcon,
                    label: 'System Overview',
                    muted: !sections?.overview,
                    disabled: !sections?.overview,
                    onClick: () => sections?.overview && router.get(`/projects/${project.id}/system-overview`),
                },
                {
                    key: 'prd',
                    icon: FileIcon,
                    label: sections?.prd ? 'PRD' : 'Generate PRD',
                    emphasize: !sections?.prd,
                    disabled: !sections?.prd,
                    onClick: () =>
                        sections?.prd ? router.get(`/projects/${project.id}/prd`) : router.post(`/projects/${project.id}/prd/generate`),
                },
                { key: 'features', icon: ZapIcon, label: 'Features', onClick: () => router.visit(`/projects/${project.id}`) },
            ],
        },
        {
            label: 'Design',
            items: [
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    active: true,
                    emphasize: true,
                    onClick: () => router.get(`/projects/${project.id}/brainstorming`),
                },
            ],
        },
        {
            label: 'Technical',
            items: [
                {
                    key: 'erd',
                    icon: DatabaseIcon,
                    label: 'Database Designer',
                    muted: !sections?.data_modeling,
                    disabled: !sections?.data_modeling,
                    onClick: () => sections?.data_modeling && router.get(`/projects/${project.id}/erd`),
                },
                {
                    key: 'c4',
                    icon: LayersIcon,
                    label: project.c4 ? 'System Architecture' : 'Generate C4',
                    emphasize: !project.c4,
                    disabled: !project.c4,
                    onClick: () =>
                        project.c4 ? router.get(`/projects/${project.id}/c4`) : router.post(`/projects/${project.id}/c4/generate`),
                },
                { key: 'technology', icon: CodeIcon, label: 'Technology Stack', onClick: () => router.get(`/projects/${project.id}/technology`) },
            ],
        },
    ];

    // Detect system theme and listen for changes
    useEffect(() => {
        const detectTheme = () => {
            // MODIFICATION: Rely ONLY on the 'dark' class on the <html> element.
            // This ignores the OS-level setting and syncs with your site's theme toggle.
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        // Initial detection
        detectTheme();

        // This observer correctly watches for when the theme toggle adds/removes the 'dark' class.
        const observer = new MutationObserver(detectTheme);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
        };
    }, []); // We no longer need the media query listener.

    const handleChange = useCallback((els: any[], app: any, f: Record<string, any>) => {
        setHasUnsavedChanges(true);
        setElements(els);
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

            <div className="flex h-screen bg-background">
                <aside
                    className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}
                >
                    <div
                        className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    >
                                <div className="overflow-y-auto scrollbar-hide">
                                    {/* Logo/Brand */}
                                    <div className="mb-6 border-b pb-4">
                                        <a href="/" className="flex items-center gap-2 text-lg font-bold text-foreground hover:opacity-80 transition-opacity">
                                            Sirius
                                        </a>
                                    </div>                            <div className="mb-6">
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h1 className="text-sm font-semibold truncate">{project.name}</h1>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{completionPercentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all" style={{ width: `${completionPercentage}%` }} />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px]">
                                            {getHealthIcon()}
                                            <span className="text-muted-foreground">{getHealthStatus()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <nav className="space-y-6">
                                {navGroups.map((group) => (
                                    <div key={group.label} className="space-y-2">
                                        <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            {group.label}
                                        </div>
                                        <ul className="space-y-1">
                                            {group.items.map((item) => (
                                                <li key={item.key}>
                                                    <button
                                                        onClick={item.disabled ? undefined : item.onClick}
                                                        disabled={item.disabled}
                                                        className={[
                                                            'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors',
                                                            item.disabled
                                                                ? 'cursor-not-allowed opacity-50'
                                                                : item.active
                                                                    ? 'bg-amber-100 font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-100'
                                                                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                            item.emphasize && !item.disabled ? 'font-medium text-foreground' : '',
                                                        ].join(' ')}
                                                        title={item.disabled ? 'Not available yet' : item.label}
                                                    >
                                                        <item.icon className="h-4 w-4 shrink-0" />
                                                        <span className={item.muted ? 'opacity-70' : ''}>{item.label}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        <div className="shrink-0 border-t pt-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                                        <Avatar className="h-5 w-5 shrink-0">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback className="text-[10px] bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-medium text-foreground">{auth.user.name}</div>
                                            <div className="truncate text-[10px] text-muted-foreground">{auth.user.email}</div>
                                        </div>
                                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 flex flex-col">
                    <div className="border-b px-4 py-3 sm:pl-6 lg:pl-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
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

                    {/* Excalidraw Canvas - Takes remaining height */}
                    <div className="relative flex-1 overflow-hidden">
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
        </>
    );
}
