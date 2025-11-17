import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
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
    Maximize,
    PanelLeftClose,
    PanelLeftOpen,
    Sparkles,
    TrendingUpIcon,
    ZapIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import JsonEditor from '@/components/c4-diagram/JsonEditor';
import ReactFlowDiagram from '@/components/c4-diagram/ReactFlowDiagram';
import { useC4Parser } from '@/hooks/useC4Parser';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    c4: string | null;
    status: string;
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
    errorMessage?: string;
    isGenerating?: boolean;
    sections?: Sections;
}

// Empty C4 template
const emptyC4Template = `{
  "title": "",
  "description": "",
  "type": "system-context",
  "version": "1.0.0",
  "metadata": {
    "author": "",
    "created": "${new Date().toISOString().split('T')[0]}",
    "updated": "${new Date().toISOString().split('T')[0]}",
    "tags": []
  },
  "elements": [],
  "relationships": [],
  "layout": {
    "type": "hierarchical",
    "direction": "TB"
  }
}`;

export default function SystemArchitecture({ project, errorMessage, isGenerating: initialIsGenerating = false, sections }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
    const [content, setContent] = useState(project.c4 || emptyC4Template);
    const [prompt, setPrompt] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(initialIsGenerating);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { c4Diagram, error, isLoading, warnings } = useC4Parser(content);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showGenerationMode, setShowGenerationMode] = useState(!project.c4 && !initialIsGenerating);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'System Architecture', href: `/projects/${project.id}/c4` },
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
                    muted: !sections?.data_modeling,
                    disabled: !sections?.data_modeling,
                    onClick: () => sections?.data_modeling && router.get(`/projects/${project.id}/erd`),
                },
                {
                    key: 'c4',
                    icon: LayersIcon,
                    label: project.c4 ? 'System Architecture' : 'Generate C4',
                    emphasize: !project.c4,
                    active: true,
                    disabled: !project.c4,
                    onClick: () => (project.c4 ? router.get(`/projects/${project.id}/c4`) : router.post(`/projects/${project.id}/c4/generate`)),
                },
                { key: 'technology', icon: CodeIcon, label: 'Technology Stack', onClick: () => router.get(`/projects/${project.id}/technology`) },
            ],
        },
    ];

    // Resizable panel state
    const [leftWidth, setLeftWidth] = useState(50); // percentage
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Resizable panel handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            // Cancel any pending animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Throttle updates using requestAnimationFrame
            animationFrameRef.current = requestAnimationFrame(() => {
                if (containerRef.current) {
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

                    // Constrain between 20% and 80%
                    const constrainedWidth = Math.min(80, Math.max(20, newLeftWidth));
                    setLeftWidth(constrainedWidth);
                }
            });
        },
        [isResizing],
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    // Add global mouse event listeners
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

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

    // Show error toast if errorMessage prop is provided
    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    // Handle initial generation trigger
    useEffect(() => {
        if (initialIsGenerating && project) {
            triggerAsyncGeneration();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIsGenerating, project]);

    // Handle initial async generation
    const triggerAsyncGeneration = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/projects/${project.id}/c4/generate-async`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success && data.c4) {
                    setContent(data.c4);
                    setShowGenerationMode(false);
                    toast.success('C4 diagram generated successfully!');
                } else {
                    toast.error(data.message || 'Failed to generate C4 diagram');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to generate C4 diagram. Please try again.');
            }
        } catch (error) {
            console.error('Error generating C4 diagram:', error);
            toast.error('An error occurred while generating the C4 diagram.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Theme toggle removed - use navbar theme toggle instead

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        try {
            setIsConverting(true);

            // Call the Laravel backend to edit C4 diagram with AI
            const response = await fetch(`/projects/${project.id}/c4/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    engineer_notes: prompt,
                }),
            });

            if (response.ok) {
                // Reload the page to get the updated C4 data
                router.reload();
                setShowGenerationMode(false);
                toast.success('C4 diagram generated successfully!');
            } else {
                toast.error('Failed to generate diagram. Please try again.');
            }
        } catch (error) {
            toast.error('Failed to generate diagram. Please try again.');
        } finally {
            setIsConverting(false);
            setPrompt(''); // Clear the prompt after generation
        }
    };

    const handleSave = async () => {
        try {
            setIsConverting(true);

            const response = await fetch(`/projects/${project.id}/c4/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    c4_content: content,
                }),
            });

            if (response.ok) {
                toast.success('C4 diagram saved successfully!');
            } else {
                toast.error('Failed to save diagram. Please try again.');
            }
        } catch (error) {
            toast.error('Failed to save diagram. Please try again.');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <>
            <Head title={`System Architecture - ${project.name}`} />

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
                                <div className="border-b px-4 py-3 sm:pl-6 lg:pl-6">
                                    <div className="mb-4 flex items-center gap-3">
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

                                <div className={`flex flex-1 flex-col overflow-hidden bg-background text-foreground`}>
                                    {/* Generation Mode - Show when no C4 exists or isGenerating */}
                                    {(showGenerationMode && !project.c4) || isGenerating ? (
                                        <div className="flex flex-1 items-center justify-center">
                                            {isGenerating ? (
                                                <div className="flex flex-col items-center justify-center p-8">
                                                    <TextShimmer className="text-2xl font-semibold">Generating C4 Diagram...</TextShimmer>
                                                    <p className="mt-4 text-muted-foreground">This may take a moment</p>
                                                </div>
                                            ) : (
                                                <div className="mx-auto max-w-2xl px-4 text-center">
                                                    <div className="mb-8">
                                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                            <Sparkles className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                                                            Generate C4 Architecture Diagram
                                                        </h1>
                                                        <p className="text-sm text-muted-foreground">
                                                            Create a comprehensive C4 model diagram for your project using AI. Describe your system
                                                            architecture and we'll generate a detailed diagram.
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="rounded border p-6">
                                                            <Input
                                                                type="text"
                                                                placeholder="Describe your system architecture (e.g., 'E-commerce platform with microservices, API gateway, and database')"
                                                                value={prompt}
                                                                onChange={(e) => setPrompt(e.target.value)}
                                                                className="mb-4 text-base"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !isConverting) {
                                                                        handleGenerate();
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                onClick={handleGenerate}
                                                                disabled={!prompt.trim() || isConverting}
                                                                className="w-full"
                                                                size="lg"
                                                            >
                                                                {isConverting ? (
                                                                    <TextShimmer>Generating C4 Diagram...</TextShimmer>
                                                                ) : (
                                                                    <>
                                                                        <Sparkles className="mr-2 h-5 w-5" />
                                                                        Generate C4 Diagram
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>

                                                        <div className="text-sm text-muted-foreground">
                                                            <p>
                                                                💡 <strong>Tip:</strong> Be specific about your system components, technologies, and
                                                                relationships for better results.
                                                            </p>
                                                        </div>

                                                        <Button variant="outline" onClick={() => setShowGenerationMode(false)} className="mt-4">
                                                            Skip and Use Template
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative flex min-h-0 flex-1 overflow-hidden" ref={containerRef}>
                                            {/* Left Panel - Editor - Hidden in full screen */}
                                            {!isFullScreen && (
                                                <div className="flex min-h-0 min-w-0 flex-col overflow-hidden" style={{ width: `${leftWidth}%` }}>
                                                    <div className="relative flex-1 overflow-hidden">
                                                        <div className="h-full overflow-auto pb-24">
                                                            <JsonEditor value={content} onChange={setContent} error={error ?? undefined} />
                                                        </div>

                                                        {/* AI Prompt Section - Floating Bottom */}
                                                        <div className="absolute right-2 bottom-4 left-2 z-50 rounded border bg-background p-3">
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="text"
                                                                    placeholder="e.g., 'E-commerce system with users, products, orders' or 'Microservices architecture'"
                                                                    value={prompt}
                                                                    onChange={(e) => setPrompt(e.target.value)}
                                                                    className="flex-1"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleGenerate();
                                                                        }
                                                                    }}
                                                                />
                                                                <Button onClick={handleGenerate} disabled={!prompt.trim() || isConverting}>
                                                                    {isConverting ? (
                                                                        <TextShimmer>Generating...</TextShimmer>
                                                                    ) : (
                                                                        <>
                                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                                            Generate
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                            <p className="mt-2 text-xs text-muted-foreground">
                                                                Describe your system architecture and click Generate to create C4 diagram
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Resize Handle - Hidden in full screen */}
                                            {!isFullScreen && (
                                                <div
                                                    className="group relative w-1 cursor-col-resize bg-border transition-colors duration-200 hover:bg-primary/50"
                                                    onMouseDown={handleMouseDown}
                                                >
                                                    <div className="absolute inset-y-0 -right-1 -left-1 transition-colors duration-200 group-hover:bg-primary/20" />
                                                </div>
                                            )}

                                            {/* Right Panel - Diagram */}
                                            <div
                                                className="relative flex min-h-0 min-w-0 flex-col"
                                                style={{
                                                    width: isFullScreen ? '100%' : `${100 - leftWidth}%`,
                                                }}
                                            >
                                                {/* Full Screen Button - Top Right */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={toggleFullScreen}
                                                    className="absolute top-4 right-4 z-10 h-8 w-8 rounded border"
                                                    title="Enter Full Screen"
                                                >
                                                    <Maximize className="h-4 w-4" />
                                                    <span className="sr-only">Enter Full Screen</span>
                                                </Button>

                                                <div className="min-h-0 flex-1" ref={canvasRef}>
                                                    {isGenerating ? (
                                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                                            <div className="text-center">
                                                                <TextShimmer className="text-2xl font-semibold">
                                                                    Generating C4 Architecture...
                                                                </TextShimmer>
                                                                <p className="mt-4 text-sm text-muted-foreground">
                                                                    Please wait while we create your system diagram
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : isLoading ? (
                                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                                            <div className="text-center">
                                                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                                                                <TextShimmer className="text-2xl font-semibold">Loading Diagram...</TextShimmer>
                                                                <p className="mt-4 text-sm text-muted-foreground">
                                                                    Parsing and rendering your C4 architecture
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <ReactFlowDiagram c4Diagram={c4Diagram || undefined} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Error and Warning Display */}
                                            {!isFullScreen && error && (
                                                <div className="absolute right-4 bottom-4 left-4 z-30 rounded border border-destructive bg-destructive/10 p-4">
                                                    <p className="text-sm text-destructive-foreground">
                                                        <strong>Parse Error:</strong> {error ?? 'Unknown error'}
                                                    </p>
                                                </div>
                                            )}

                                            {!isFullScreen && warnings && warnings.length > 0 && (
                                                <div className="absolute right-4 bottom-16 left-4 z-30 rounded border p-4">
                                                    <p className="text-sm text-foreground">
                                                        <strong>Warnings:</strong>
                                                    </p>
                                                    <ul className="mt-1 text-xs text-muted-foreground">
                                                        {warnings.map((warning, index) => (
                                                            <li key={index}>• {warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                )}

                {/* Fullscreen Mode */}
                {isFullScreen && (
                    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">
                        <div className="relative flex min-h-0 flex-1 overflow-hidden" ref={containerRef}>
                            {/* Right Panel - Diagram Only */}
                            <div className="relative flex min-h-0 min-w-0 flex-col" style={{ width: '100%' }}>
                                {/* Full Screen Button - Top Right */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleFullScreen}
                                    className="absolute top-4 right-4 z-10 h-8 w-8 rounded border"
                                    title="Exit Full Screen"
                                >
                                    <Maximize className="h-4 w-4" />
                                    <span className="sr-only">Exit Full Screen</span>
                                </Button>

                                <div className="min-h-0 flex-1" ref={canvasRef}>
                                    {isGenerating ? (
                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                            <div className="text-center">
                                                <TextShimmer className="text-2xl font-semibold">Generating C4 Architecture...</TextShimmer>
                                                <p className="mt-4 text-sm text-muted-foreground">Please wait while we create your system diagram</p>
                                            </div>
                                        </div>
                                    ) : isLoading ? (
                                        <div className="flex h-full items-center justify-center bg-muted/10">
                                            <div className="text-center">
                                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                                                <TextShimmer className="text-2xl font-semibold">Loading Diagram...</TextShimmer>
                                                <p className="mt-4 text-sm text-muted-foreground">Parsing and rendering your C4 architecture</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <ReactFlowDiagram c4Diagram={c4Diagram || undefined} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <div className="rounded-lg border bg-card p-6 shadow-lg">
                            <div className="flex flex-col items-center space-y-3">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                                <TextShimmer className="text-card-foreground">Parsing schema...</TextShimmer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
