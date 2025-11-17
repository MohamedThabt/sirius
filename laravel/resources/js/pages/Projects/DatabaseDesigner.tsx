import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BackgroundVariant } from '@xyflow/react';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronLeft,
    ChevronRight,
    CodeIcon,
    DatabaseIcon,
    Download,
    FileCode,
    FileIcon,
    FileText,
    Grid3X3,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    Maximize2,
    Palette,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Search,
    Snowflake,
    TrendingUpIcon,
    TreePine,
    ZapIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import DiagramCanvas from '@/components/database-designer/DiagramCanvas';
import EditorPanel from '@/components/database-designer/EditorPanel';
import FormatSelector from '@/components/database-designer/FormatSelector';
import { useDBMLParser } from '@/hooks/useDBMLParser';
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
    c4: string | null;
    created_at: string;
    updated_at: string;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
    non_functional_requirements: string | null;
}

interface Props {
    project: Project;
    initialContent?: string;
    sections?: Sections;
}

export default function DatabaseDesigner({ project, initialContent, sections }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [content, setContent] = useState(initialContent ?? '');
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
    const [backgroundOptions, setBackgroundOptions] = useState({
        gap: 20,
        size: 1,
    });
    const [isConverting, setIsConverting] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { nodes, edges, error, isLoading } = useDBMLParser(content);
    const [layoutTrigger, setLayoutTrigger] = useState<{ algorithm: string; timestamp: number } | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50); // Left panel width in percentage
    const [isResizing, setIsResizing] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const rafIdRef = useRef<number | null>(null);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Database Designer', href: `/projects/${project.id}/erd` },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <CircleIcon className="h-3 w-3" />;
            case 'in_progress':
                return <ClockIcon className="h-3 w-3" />;
            case 'completed':
                return <CheckCircleIcon className="h-3 w-3" />;
            default:
                return <AlertCircleIcon className="h-3 w-3" />;
        }
    };

    interface NavItem {
        key: string;
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        muted?: boolean;
        emphasize?: boolean;
        active?: boolean;
        disabled?: boolean;
        onClick: () => void;
    }

    interface NavGroup {
        label: string;
        items: NavItem[];
    }

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
                    onClick: () => (sections?.prd ? router.get(`/projects/${project.id}/prd`) : router.post(`/projects/${project.id}/prd/generate`)),
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
                    active: true,
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
                    onClick: () => (project.c4 ? router.get(`/projects/${project.id}/c4`) : router.post(`/projects/${project.id}/c4/generate`)),
                },
                { key: 'technology', icon: CodeIcon, label: 'Technology Stack', onClick: () => router.get(`/projects/${project.id}/technology`) },
            ],
        },
    ];

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

    // Sync editor content when initialContent changes
    useEffect(() => {
        if (typeof initialContent === 'string' && initialContent.trim()) {
            setContent(initialContent);
        }
    }, [initialContent]);

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

    return (
        <>
            <Head title={`Database Designer - ${project.name}`} />

            <div className="min-h-screen bg-background">
                {!isFullScreen && (
                    <div className="flex">
                        <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}>
                            <div
                                className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                            >
                                <div className="overflow-y-auto scrollbar-hide">
                                    {/* Logo/Brand */}
                                    <div className="mb-6 border-b pb-4">
                                        <a href="/" className="flex items-center gap-2 text-lg font-bold text-foreground hover:opacity-80 transition-opacity">
                                            Sirius
                                        </a>
                                    </div>                                    <div className="mb-6">
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
                                                                            ? 'bg-muted font-medium text-foreground'
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

                        <main className="min-w-0 flex-1">
                            <div className="flex h-screen flex-col">
                                <div className="border-b bg-background">
                                    {/* Breadcrumbs Row */}
                                    <div className="px-4 py-3 sm:pl-6 lg:pl-6">
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
                                    </div>

                                    {/* Tools Row */}
                                    {!isFullScreen && (
                                        <div className="border-t px-4 py-3 sm:pl-6 lg:pl-6">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                {/* Search */}
                                                <div className="relative max-w-md min-w-[200px] flex-1">
                                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search tables and fields..."
                                                        value={localSearch}
                                                        onChange={(e) => {
                                                            setLocalSearch(e.target.value);
                                                            handleSearch(e.target.value);
                                                        }}
                                                        className="pl-10"
                                                    />
                                                </div>

                                                {/* Toolbar Actions */}
                                                <div className="flex items-center gap-2">
                                                    {/* Arrange Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <TreePine className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">Arrange</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Layout Algorithms</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleArrange('grid')}>
                                                                <Grid3X3 className="mr-2 h-4 w-4" />
                                                                Grid Layout
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleArrange('dagre')}>
                                                                <TreePine className="mr-2 h-4 w-4" />
                                                                Hierarchical (Dagre)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleArrange('snowflake')}>
                                                                <Snowflake className="mr-2 h-4 w-4" />
                                                                Snowflake
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    {/* Background Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Palette className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">Background</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Background Style</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange(BackgroundVariant.Dots)}>
                                                                <Grid3X3 className="mr-2 h-4 w-4" />
                                                                Dots
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange(BackgroundVariant.Lines)}>
                                                                <LayersIcon className="mr-2 h-4 w-4" />
                                                                Lines
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange(BackgroundVariant.Cross)}>
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Cross
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleBackgroundChange('none' as any)}>
                                                                None
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Separator orientation="vertical" className="h-6" />

                                                    {/* Export Dropdown */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">Export</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={handleExportMermaid}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">Mermaid ERD</span>
                                                                    <span className="text-xs text-muted-foreground">Export as .mermaid file</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={handleExportSQL}>
                                                                <FileCode className="mr-2 h-4 w-4" />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">SQL Script</span>
                                                                    <span className="text-xs text-muted-foreground">Export as .sql file</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Separator orientation="vertical" className="h-6" />

                                                    {/* Fullscreen Button */}
                                                    <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                                                        <Maximize2 className="mr-2 h-4 w-4" />
                                                        <span className="hidden sm:inline">Fullscreen</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col overflow-hidden bg-background text-foreground">
                                    <div
                                        id="resizable-container"
                                        className={`relative flex min-h-0 flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
                                    >
                                        {/* Toggle Editor Button - Vertical Center Between Sections */}
                                        {!isFullScreen && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                                                className={`absolute top-1/2 z-20 h-12 w-6 -translate-y-1/2 rounded-l-none rounded-r-md border border-border bg-background/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted ${isEditorCollapsed ? 'left-0' : 'left-[calc(var(--left-width)-12px)]'}`}
                                                style={{ '--left-width': `${leftWidth}%` } as React.CSSProperties}
                                                title={isEditorCollapsed ? 'Show Editor Panel' : 'Hide Editor Panel'}
                                            >
                                                {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                                <span className="sr-only">{isEditorCollapsed ? 'Show Editor' : 'Hide Editor'}</span>
                                            </Button>
                                        )}

                                        {/* Collapsible Left Panel - Editor - Hidden in full screen */}
                                        {!isFullScreen && (
                                            <div
                                                className={`flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'}`}
                                                style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
                                            >
                                                <FormatSelector content={content} onConvert={handleConvert} isConverting={isConverting} />

                                                {/* Informational Note */}
                                                <div className="mx-4 mb-4 rounded border p-4">
                                                    <h3 className="text-sm font-medium text-foreground">Project ERD Overview</h3>
                                                    <div className="mt-2 text-sm text-muted-foreground">
                                                        <p>This is a consolidated view of all your feature database schemas.</p>
                                                        <p className="mt-1">
                                                            To create or edit tables, please go to the <strong>Feature ERD</strong> section for each
                                                            individual feature.
                                                        </p>
                                                        {!content && (
                                                            <p className="mt-2 font-medium text-foreground">
                                                                No feature diagrams have been created yet. Start by creating a feature and designing
                                                                its database schema.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-hidden">
                                                    {content ? (
                                                        <EditorPanel
                                                            value={content}
                                                            onChange={() => {}} // Read-only
                                                            readOnly={true}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center p-8">
                                                            <div className="text-center">
                                                                <p className="text-lg font-medium text-muted-foreground">
                                                                    No feature diagrams available
                                                                </p>
                                                                <p className="mt-2 text-sm text-muted-foreground">
                                                                    Create features and their ERD schemas to see the consolidated diagram here.
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
                                        )}

                                        {/* Resize Handle */}
                                        {!isFullScreen && !isEditorCollapsed && (
                                            <div
                                                className="group relative w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/50"
                                                onMouseDown={handleMouseDown}
                                            >
                                                <div className="absolute inset-y-0 -right-1 -left-1" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <div className="flex h-12 w-1 items-center justify-center rounded-full bg-primary/20">
                                                        <div className="h-8 w-0.5 bg-primary"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Right Panel - Diagram */}
                                        <div
                                            className={`relative flex min-h-0 min-w-0 flex-col transition-all duration-300 ease-in-out ${isFullScreen ? 'w-full border-l-0' : isEditorCollapsed ? 'w-full border-l-0' : 'border-l-0'}`}
                                            style={{ width: isFullScreen || isEditorCollapsed ? '100%' : `${100 - leftWidth}%` }}
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
                                                            <div className="mb-4 text-muted-foreground">
                                                                <svg
                                                                    className="mx-auto h-24 w-24 opacity-20"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={1}
                                                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <h3 className="mb-2 text-xl font-semibold text-foreground">
                                                                No Database Schema Available
                                                            </h3>
                                                            <p className="mb-4 text-muted-foreground">No feature diagrams have been created yet.</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Start by creating features and designing their database schemas. All feature ERDs will
                                                                be consolidated and displayed here.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                )}

                {/* Fullscreen Mode */}
                {isFullScreen && (
                    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">
                        <div className="border-b bg-background px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                                        <DatabaseIcon className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Database Designer</h2>
                                        <p className="text-xs text-muted-foreground">{project.name}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={toggleFullScreen}>
                                    <Maximize2 className="mr-2 h-4 w-4" />
                                    Exit Fullscreen
                                </Button>
                            </div>
                        </div>
                        <div id="resizable-container" className="relative flex min-h-0 flex-1 overflow-hidden">
                            {/* Right Panel - Diagram Only */}
                            <div className="relative flex min-h-0 min-w-0 flex-col" style={{ width: '100%' }}>
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
                                                <div className="mb-4 text-muted-foreground">
                                                    <svg
                                                        className="mx-auto h-24 w-24 opacity-20"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                                                        />
                                                    </svg>
                                                </div>
                                                <h3 className="mb-2 text-xl font-semibold text-foreground">No Database Schema Available</h3>
                                                <p className="mb-4 text-muted-foreground">No feature diagrams have been created yet.</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Start by creating features and designing their database schemas. All feature ERDs will be
                                                    consolidated and displayed here.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50">
                        <div className="rounded border bg-card p-6">
                            <TextShimmer className="text-card-foreground">Parsing schema...</TextShimmer>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
