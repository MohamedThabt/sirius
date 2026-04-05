import { Breadcrumbs } from '@/components/breadcrumbs';
import { ChatInput, type ChatMode } from '@/components/Chat/ChatInput';
import { ClientDateTime } from '@/components/ClientDateTime';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { useResizablePanel } from '@/hooks/use-resizable-panel';
import { type OverviewChatMessage, type OverviewVersion, type Project, type Sections } from '@/types';
import { getHealthStatus } from '@/utils/project-status';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BotIcon,
    ExternalLinkIcon,
    EyeIcon,
    FileTextIcon,
    MessageSquareIcon,
    PencilIcon,
    SaveIcon,
    SparklesIcon,
    StarIcon,
    UserIcon,
} from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

interface Props {
    project?: Project;
    overviewVersions: OverviewVersion[];
    overviewChat?: OverviewChatMessage[];
    hasModules: boolean;
    isGenerating?: boolean;
    sections?: Sections;
}

export default function SystemOverview({
    project,
    overviewVersions: initialOverviewVersions,
    overviewChat: initialOverviewChat,
    hasModules,
    isGenerating: initialIsGenerating = false,
    sections = { overview: null, prd: null, data_modeling: null, non_functional_requirements: null },
}: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const [currentVersion, setCurrentVersion] = useState<OverviewVersion | null>(null);
    const [overviewVersions, setOverviewVersions] = useState<OverviewVersion[]>(initialOverviewVersions || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isInitialGeneration, setIsInitialGeneration] = useState(initialIsGenerating);
    const [chatMessages, setChatMessages] = useState<OverviewChatMessage[]>(initialOverviewChat || []);
    const [chatMode, setChatMode] = useState<ChatMode>('agent');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [projectHasModules, setProjectHasModules] = useState(hasModules);
    const [isOpeningModuleSuggestions, setIsOpeningModuleSuggestions] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const openInNewTab = (url: string, content: string, title: string) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = '_blank';
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }
        const contentInput = document.createElement('input');
        contentInput.type = 'hidden';
        contentInput.name = 'content';
        contentInput.value = content;
        form.appendChild(contentInput);
        const titleInput = document.createElement('input');
        titleInput.type = 'hidden';
        titleInput.name = 'title';
        titleInput.value = title;
        form.appendChild(titleInput);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const { width: leftPaneWidth, handleMouseDown, containerRef } = useResizablePanel({
        initialWidth: 40,
        minWidth: 20,
        maxWidth: 80,
    });

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project?.name || 'Project', href: `/projects/${project?.id}` },
        { title: 'System Overview', href: `/projects/${project?.id}/system-overview` },
    ];

    const completionPercentage = useMemo(() => project?.progress ?? 0, [project]);
    const health = useMemo(() => getHealthStatus(completionPercentage), [completionPercentage]);

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        mermaid.initialize({ startOnLoad: false, theme: isDarkMode ? 'dark' : 'default', securityLevel: 'loose', fontFamily: 'inherit' });
    }, []);

    useEffect(() => {
        if (isInitialGeneration && project) triggerAsyncGeneration();
    }, [isInitialGeneration, project]);

    useEffect(() => {
        if (initialOverviewVersions && initialOverviewVersions.length > 0) {
            const baseVersion = initialOverviewVersions.find((v) => v.is_base_version) || initialOverviewVersions[0];
            setCurrentVersion(baseVersion);
            setEditedContent(baseVersion.overview);
        } else if (project && project.overview && overviewVersions.length === 0 && !isInitialGeneration) {
            const initialVersion: OverviewVersion = {
                id: 0, project_id: project.id, overview: project.overview, version_number: 1,
                is_base_version: true, user_prompt: 'Initial project overview',
                created_at: project.created_at, updated_at: project.updated_at,
            };
            setOverviewVersions([initialVersion]);
            setCurrentVersion(initialVersion);
            setEditedContent(initialVersion.overview);
        }
    }, [initialOverviewVersions, project, isInitialGeneration]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isGenerating]);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
        document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || '';

    const triggerAsyncGeneration = async () => {
        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/generate-async`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setOverviewVersions(data.overviewVersions);
                    const newestVersion = data.overviewVersions.sort((a: OverviewVersion, b: OverviewVersion) => b.version_number - a.version_number)[0];
                    setCurrentVersion(newestVersion);
                    setEditedContent(newestVersion.overview);
                    if (typeof data.hasModules === 'boolean') setProjectHasModules(data.hasModules);
                    setIsInitialGeneration(false);
                } else throw new Error(data.message || 'Failed to generate overview');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate overview');
            }
        } catch (error) {
            console.error('Error generating overview:', error);
            setIsInitialGeneration(false);
        }
    };

    const handlePromptSubmit = async (prompt: string) => {
        if (!prompt.trim() || isGenerating) return;
        setIsGenerating(true);
        const newPrompt = prompt.trim();
        const optimisticUserMsg: OverviewChatMessage = {
            id: `opt-user-${Date.now()}`, type: 'message', role: 'user', content: newPrompt,
            version_id: null, intent: null, created_at: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, optimisticUserMsg]);
        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/update-with-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ message: newPrompt, mode: chatMode }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.chat) setChatMessages(data.chat);
                if (data.overviewVersions) {
                    setOverviewVersions(data.overviewVersions);
                    const newestVersion = data.overviewVersions.sort((a: OverviewVersion, b: OverviewVersion) => b.version_number - a.version_number)[0];
                    setCurrentVersion(newestVersion);
                    setEditedContent(newestVersion.overview);
                }
                if (typeof data.hasModules === 'boolean') setProjectHasModules(data.hasModules);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error in chat:', error);
            const errorMsg: OverviewChatMessage = {
                id: `error-${Date.now()}`, type: 'message', role: 'agent',
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                version_id: null, intent: null, created_at: new Date().toISOString(),
            };
            setChatMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleContentUpdate = async () => {
        if (!currentVersion || !editedContent.trim()) return;
        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/${currentVersion.id}/user-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ overview: editedContent }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const updatedVersion = { ...currentVersion, overview: editedContent };
                    setCurrentVersion(updatedVersion);
                    setOverviewVersions((prev) => prev.map((v) => (v.id === currentVersion.id ? updatedVersion : v)));
                    setIsEditing(false);
                    toast.success(data.message || 'Overview updated successfully');
                } else throw new Error(data.message || 'Failed to update overview');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update overview');
            }
        } catch (error) {
            console.error('Error updating overview:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update overview');
        }
    };

    const handleMarkAsBase = async (version: OverviewVersion) => {
        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/${version.id}/mark-as-base`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (data.overviewVersions) {
                        setOverviewVersions(data.overviewVersions);
                        const updatedCurrent = data.overviewVersions.find((v: OverviewVersion) => v.id === currentVersion?.id);
                        if (updatedCurrent) setCurrentVersion(updatedCurrent);
                    }
                    toast.success(data.message || 'Version marked as base successfully');
                } else throw new Error(data.message || 'Failed to mark version as base');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to mark version as base');
            }
        } catch (error) {
            console.error('Error marking version as base:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to mark version as base');
        }
    };

    const handleVersionSelect = (version: OverviewVersion) => {
        setCurrentVersion(version);
        setEditedContent(version.overview);
        setIsEditing(false);
    };

    const handleChatVersionClick = (versionId: number) => {
        const version = overviewVersions.find((v) => v.id === versionId);
        if (version) handleVersionSelect(version);
    };

    const displayedChatMessages = useMemo<OverviewChatMessage[]>(() => {
        if (chatMessages.length > 0) return chatMessages;
        return [...overviewVersions]
            .sort((a, b) => a.version_number - b.version_number)
            .map((version) => ({
                id: `fallback-version-${version.id}`,
                type: 'version' as const,
                role: 'agent' as const,
                content: `Version ${version.version_number.toString().padStart(2, '0')}`,
                version_id: version.id,
                intent: null,
                created_at: version.created_at,
            }));
    }, [chatMessages, overviewVersions]);

    const navGroups = useMemo(() => {
        if (!project) return [];
        return buildProjectNavGroups({ project, currentPage: 'overview' });
    }, [project]);

    return (
        <>
            <Head title={`System Overview - ${project?.name || 'Project'}`} />

            <div className="min-h-screen bg-background">
                {project && (
                    <div className="flex">
                        <ProjectSidebarPanel
                            project={project}
                            navGroups={navGroups}
                            completionPercentage={completionPercentage}
                            health={health}
                            isCollapsed={isSidebarCollapsed}
                            user={auth.user}
                        />

                        <main className="min-w-0 flex-1">
                            <div className="flex h-screen flex-col">
                                {/* Top bar */}
                                <div className="border-b border-border/60 px-4 py-3 sm:px-6 lg:px-8">
                                    <div className="flex items-center gap-3">
                                        <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                                    </div>
                                </div>

                                <div className="flex flex-1 overflow-hidden" ref={containerRef}>
                                    {/* ─── Chat Panel ─── */}
                                    <div className="flex flex-col bg-background" style={{ width: `${leftPaneWidth}%` }}>
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                    <MessageSquareIcon className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="leading-tight">
                                                    <h2 className="text-sm font-semibold">Overview Chat</h2>
                                                    <p className="text-[11px] text-muted-foreground">{project?.name || 'Project'}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.visit(`/projects/${project?.id}`)}
                                                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                <ArrowLeft className="h-3.5 w-3.5" />
                                                Back
                                            </Button>
                                        </div>

                                        {/* Messages */}
                                        <ScrollArea className="flex-1">
                                            <div className="space-y-1 px-3 py-3">
                                                {isInitialGeneration ? (
                                                    <div className="flex h-40 items-center justify-center">
                                                        <div className="text-center">
                                                            <TextShimmer className="text-sm font-medium">Generating overview...</TextShimmer>
                                                            <p className="mt-1 text-xs text-muted-foreground">This may take a moment</p>
                                                        </div>
                                                    </div>
                                                ) : displayedChatMessages.length > 0 ? (
                                                    displayedChatMessages.map((msg) => {
                                                        const isUser = msg.role === 'user';
                                                        return (
                                                            <div key={msg.id} className={`group flex gap-2.5 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                                                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                                                                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                                                }`}>
                                                                    {isUser
                                                                        ? <UserIcon className="h-3 w-3" />
                                                                        : <BotIcon className="h-3 w-3 text-muted-foreground" />
                                                                    }
                                                                </div>
                                                                <div className={`max-w-[85%] space-y-1 ${isUser ? 'text-right' : ''}`}>
                                                                    <div className={`inline-block rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                                                                        isUser
                                                                            ? 'bg-primary text-primary-foreground'
                                                                            : 'bg-muted/60 text-foreground'
                                                                    }`}>
                                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                                    </div>

                                                                    {msg.type === 'version' && msg.version_id && (
                                                                        <div className={isUser ? 'flex justify-end' : ''}>
                                                                            <button
                                                                                onClick={() => handleChatVersionClick(msg.version_id!)}
                                                                                className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
                                                                            >
                                                                                <FileTextIcon className="h-3 w-3" />
                                                                                View Version
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    <div className={`flex items-center gap-1.5 ${isUser ? 'justify-end' : ''}`}>
                                                                        {msg.intent && !isUser && (
                                                                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                                                                msg.intent === 'execute'
                                                                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                                                    : msg.intent === 'suggest'
                                                                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                                      : 'bg-muted text-muted-foreground'
                                                                            }`}>
                                                                                {msg.intent}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[10px] text-muted-foreground/50">
                                                                            <ClientDateTime value={msg.created_at} dateStyle="long" timeStyle="short" />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="flex h-40 items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                                <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">No messages yet</p>
                                                            <p className="text-xs text-muted-foreground/60">Start a conversation to improve your overview</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {isGenerating && (
                                                    <div className="flex gap-2.5 py-2">
                                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                                                            <BotIcon className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                        <div className="rounded-xl bg-muted/60 px-3 py-2">
                                                            <TextShimmer className="text-[13px]">Thinking...</TextShimmer>
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={chatEndRef} />
                                            </div>
                                        </ScrollArea>

                                        {/* Composer (mode chips are inside ChatInput now) */}
                                        <ChatInput
                                            onSubmit={handlePromptSubmit}
                                            isGenerating={isGenerating}
                                            mode={chatMode}
                                            onModeChange={setChatMode}
                                        />
                                    </div>

                                    {/* Resize Handle */}
                                    <div
                                        className="group relative w-px cursor-col-resize bg-border/60 transition-colors duration-200 hover:bg-primary/40"
                                        onMouseDown={handleMouseDown}
                                    >
                                        <div className="absolute inset-y-0 -right-1 -left-1" />
                                    </div>

                                    {/* ─── Result Panel ─── */}
                                    <div className="flex flex-col bg-background" style={{ width: `${100 - leftPaneWidth}%` }}>
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                    <FileTextIcon className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="leading-tight">
                                                    <h2 className="text-sm font-semibold">System Overview</h2>
                                                    {currentVersion && (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            v{currentVersion.version_number.toString().padStart(2, '0')}
                                                            {currentVersion.is_base_version && (
                                                                <span className="ml-1.5 inline-flex items-center text-yellow-600 dark:text-yellow-500">
                                                                    <StarIcon className="mr-0.5 h-2.5 w-2.5" />
                                                                    Base
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {!projectHasModules && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setIsOpeningModuleSuggestions(true);
                                                            router.visit(`/modules/create/${project?.id}`);
                                                        }}
                                                        className="h-7 gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 text-xs text-primary hover:bg-primary/10"
                                                        disabled={
                                                            !currentVersion ||
                                                            !(currentVersion.overview && currentVersion.overview.trim().length > 0) ||
                                                            isOpeningModuleSuggestions
                                                        }
                                                    >
                                                        <SparklesIcon className="h-3 w-3" />
                                                        Modules
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditing(!isEditing)}
                                                    className="h-7 gap-1.5 px-2 text-xs"
                                                    disabled={isGenerating}
                                                >
                                                    {isEditing ? <EyeIcon className="h-3 w-3" /> : <PencilIcon className="h-3 w-3" />}
                                                    {isEditing ? 'Preview' : 'Edit'}
                                                </Button>
                                                {currentVersion?.overview && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openInNewTab(`/projects/${project?.id}/system-overview/preview`, currentVersion.overview, 'System Overview')}
                                                        className="h-7 gap-1.5 px-2 text-xs"
                                                    >
                                                        <ExternalLinkIcon className="h-3 w-3" />
                                                        Open
                                                    </Button>
                                                )}
                                                {sections?.prd && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openInNewTab(`/projects/${project?.id}/prd/preview`, sections.prd!, 'PRD')}
                                                        className="h-7 gap-1.5 px-2 text-xs"
                                                    >
                                                        <ExternalLinkIcon className="h-3 w-3" />
                                                        PRD
                                                    </Button>
                                                )}
                                                {currentVersion && !currentVersion.is_base_version && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleMarkAsBase(currentVersion)}
                                                        className="h-7 gap-1.5 px-2 text-xs"
                                                        disabled={isGenerating}
                                                    >
                                                        <StarIcon className="h-3 w-3" />
                                                        Set Base
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Version pills */}
                                        {!isInitialGeneration && overviewVersions.length > 0 && (
                                            <div className="border-b border-border/40 px-4 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {overviewVersions.map((version) => (
                                                        <button
                                                            key={version.id}
                                                            onClick={() => handleVersionSelect(version)}
                                                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                                                                currentVersion?.id === version.id
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                                            }`}
                                                        >
                                                            v{version.version_number.toString().padStart(2, '0')}
                                                            {version.is_base_version && <StarIcon className="h-2.5 w-2.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Content area */}
                                        <ScrollArea className="flex-1 p-4">
                                            {isInitialGeneration ? (
                                                <Card className="border-border/60">
                                                    <CardContent className="p-0">
                                                        <div className="flex h-64 items-center justify-center">
                                                            <div className="text-center">
                                                                <TextShimmer className="text-xl font-semibold">Generating System Overview...</TextShimmer>
                                                                <p className="mt-3 text-sm text-muted-foreground">This may take a moment</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ) : currentVersion ? (
                                                <Card className="border-border/60">
                                                    <CardContent className="p-0">
                                                        {isEditing ? (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2">
                                                                    <h3 className="text-xs font-medium text-muted-foreground">Editing Markdown</h3>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setIsEditing(false)}>
                                                                            Cancel
                                                                        </Button>
                                                                        <Button size="sm" className="h-7 gap-1 px-2.5 text-xs" onClick={handleContentUpdate} disabled={isGenerating}>
                                                                            <SaveIcon className="h-3 w-3" />
                                                                            Save
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <Textarea
                                                                    value={editedContent}
                                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                                    className="min-h-[500px] resize-none border-0 font-mono text-sm focus:ring-0"
                                                                    placeholder="Enter your system overview in Markdown format..."
                                                                    disabled={isGenerating}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="p-6">
                                                                <div className="prose prose-sm prose-slate dark:prose-invert prose-table-bordered max-w-none">
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkGfm]}
                                                                        rehypePlugins={[rehypeRaw]}
                                                                        components={{
                                                                            code: ({ className, children, ...props }) => {
                                                                                const match = /language-(\w+)/.exec(className || '');
                                                                                const language = match ? match[1] : '';
                                                                                const isInline = !className?.includes('language-');
                                                                                if (language === 'mermaid' && !isInline) {
                                                                                    return (
                                                                                        <MermaidDiagram projectId={project?.id} previewTitle="System Overview Diagram">
                                                                                            {String(children).replace(/\n$/, '')}
                                                                                        </MermaidDiagram>
                                                                                    );
                                                                                }
                                                                                return <code className={className} {...props}>{children}</code>;
                                                                            },
                                                                        }}
                                                                    >
                                                                        {currentVersion.overview}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <div className="flex h-96 items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                                            <FileTextIcon className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <h3 className="mb-1 text-sm font-semibold">No Overview Available</h3>
                                                        <p className="mb-4 text-xs text-muted-foreground">
                                                            Start a conversation to generate your first system overview.
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setIsInitialGeneration(true);
                                                                router.post(`/projects/${project?.id}/system-overview/regenerate`, {}, { preserveScroll: true });
                                                            }}
                                                            disabled={isInitialGeneration}
                                                        >
                                                            {isInitialGeneration ? <TextShimmer>Generating...</TextShimmer> : 'Generate System Overview'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                )}
            </div>

            {isOpeningModuleSuggestions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-8 shadow-lg">
                        <div className="relative">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-6 w-6 animate-pulse rounded-full bg-primary/20" />
                            </div>
                        </div>
                        <div className="space-y-1 text-center">
                            <TextShimmer className="text-lg font-semibold">Generating Modules</TextShimmer>
                            <p className="text-sm text-muted-foreground">Preparing AI suggestions for {project?.name || 'project'}...</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
