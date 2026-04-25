import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar05 } from '@/components/ui/shadcn-io/navbar-05';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import EditorPanel from '@/components/database-designer/EditorPanel';
import { MermaidViewerPane } from '@/components/database-designer/MermaidViewerPane';
import { generateMermaidJourney } from '@/utils/mermaidGenerator';

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

interface Props {
    project: Project;
}

const sampleMermaidJourney = `journey
    title User Journey Example
    section Discover
      Visit landing page: 3: User
      Browse features: 2: User
    section Sign up
      Click Get Started: 3: User
      Fill registration form: 2: User
      Receive verification email: 2: System
    section First session
      Verify and login: 3: User
      Guided onboarding: 2: User`;

export default function UserJourney({ project }: Props) {
    useFlashToasts();
    const { auth } = usePage().props as any;
    const [content, setContent] = useState(sampleMermaidJourney);
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const rafIdRef = useRef<number | null>(null);

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

    const handleNavClick = (href: string) => {
        if (href.startsWith('/')) {
            router.visit(href);
        }
    };

    const handleUserAction = (action: string) => {
        switch (action) {
            case 'profile':
                router.visit('/settings/profile');
                break;
            case 'settings':
                router.visit('/settings');
                break;
            case 'logout':
                router.post('/logout');
                break;
        }
    };

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
        try {
            const generatedCode = generateMermaidJourney(prompt);
            setContent(generatedCode);
            setPrompt('');
            toast.success('User Journey generated successfully!');
        } catch (error) {
            toast.error('Failed to generate journey. Please try again.');
        }
    };

    const handleExport = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}-user-journey.mermaid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('User Journey exported successfully!');
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
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
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Limit width between 20% and 80%
            if (newLeftWidth >= 20 && newLeftWidth <= 80) {
                setLeftWidth(newLeftWidth);
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
        <>
            <Head title={`User Journey - ${project.name}`} />

            {!isFullScreen && (
                <Navbar05
                    userName={auth.user?.name}
                    userEmail={auth.user?.email}
                    userAvatar={auth.user?.avatar}
                    onNavItemClick={handleNavClick}
                    onUserItemClick={handleUserAction}
                    notificationCount={0}
                />
            )}

            <div
                className={`flex flex-col bg-background text-foreground ${isFullScreen ? 'fixed inset-0 z-50 h-screen' : 'h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)]'}`}
            >
                {/* Toolbar with Back Button - Hidden in full screen */}
                {!isFullScreen && (
                    <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-3">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(`/projects/${project.id}`)}
                                className="flex items-center gap-2 border-primary/20 hover:border-primary/30 hover:bg-primary/10"
                                title="Back to Project"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="font-medium">Back to Project</span>
                            </Button>
                            <h1 className="text-lg font-semibold">User Journey Designer</h1>
                        </div>
                    </div>
                )}

                <div
                    id="resizable-container"
                    className={`relative flex flex-1 overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
                    style={{ '--left-width': `${leftWidth}%` } as React.CSSProperties}
                >
                    {!isFullScreen && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                            className={`absolute top-1/2 z-20 h-12 w-6 -translate-y-1/2 rounded-l-none rounded-r-md border border-border bg-background/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-muted ${isEditorCollapsed ? 'left-0' : ''}`}
                            style={!isEditorCollapsed ? { left: `calc(var(--left-width) - 12px)` } : {}}
                            title={isEditorCollapsed ? 'Show Editor Panel' : 'Hide Editor Panel'}
                        >
                            {isEditorCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            <span className="sr-only">{isEditorCollapsed ? 'Show Editor' : 'Hide Editor'}</span>
                        </Button>
                    )}

                    {!isFullScreen && (
                        <div
                            className={`flex h-full min-w-0 flex-col transition-all duration-300 ease-in-out ${isEditorCollapsed ? 'pointer-events-none w-0 opacity-0' : 'opacity-100'}`}
                            style={{ width: isEditorCollapsed ? '0' : `${leftWidth}%` }}
                        >
                            <div className="relative flex-1 overflow-hidden">
                                <div className="h-full overflow-auto pb-24">
                                    <EditorPanel value={content} onChange={setContent} />
                                </div>

                                <div className="absolute right-2 bottom-4 left-2 z-50 rounded-lg border border-border bg-background/95 p-3 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-background/98 hover:shadow-2xl">
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="e.g., 'Onboarding journey' or 'Checkout journey'"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleGenerate();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={!prompt.trim()}
                                            className="bg-primary px-4 text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/25"
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate
                                        </Button>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Describe your journey and click Generate to create Mermaid code
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resize Handle */}
                    {!isFullScreen && !isEditorCollapsed && (
                        <div
                            className="group relative z-10 w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/50"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="absolute inset-y-0 -right-1 -left-1" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <div className="h-8 w-1 rounded-full bg-primary" />
                            </div>
                        </div>
                    )}

                    <div
                        className={`relative flex min-w-0 flex-col transition-all duration-300 ease-in-out ${isFullScreen ? 'w-full border-l-0' : isEditorCollapsed ? 'w-full border-l-0' : 'border-l border-border'}`}
                        style={!isFullScreen && !isEditorCollapsed ? { width: `${100 - leftWidth}%` } : {}}
                    >
                        <MermaidViewerPane
                            code={content}
                            error={error}
                            setError={setError}
                            isFullScreen={isFullScreen}
                            onToggleFullScreen={toggleFullScreen}
                            onExport={handleExport}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
