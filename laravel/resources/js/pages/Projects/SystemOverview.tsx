import { Breadcrumbs } from '@/components/breadcrumbs';
import { ClientDateTime } from '@/components/ClientDateTime';
import { ChatInput } from '@/components/Chat/ChatInput';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Textarea } from '@/components/ui/textarea';
import { getHealthStatus } from '@/utils/project-status';
import { getCsrfToken, getJsonHeaders } from '@/utils/csrf';
import { type Project, type Sections, type OverviewVersion, type ChatMessage } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { toast } from 'sonner';
import {
    AlertTriangleIcon,
    ArrowLeft,
    BotIcon,
    ExternalLinkIcon,
    EyeIcon,
    FileTextIcon,
    PencilIcon,
    RefreshCwIcon,
    SaveIcon,
    SparklesIcon,
    StarIcon,
} from 'lucide-react';
import mermaid from 'mermaid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { useResizablePanel } from '@/hooks/use-resizable-panel';

// WHY: Removed ~95 lines of duplicate interface and ChatInput definitions.
// Types now imported from '@/types', ChatInput from '@/components/Chat/ChatInput'

interface Props {
    project?: Project;
    overviewVersions: OverviewVersion[];
    hasModules: boolean;
    isGenerating?: boolean;
    sections?: Sections;
    features?: unknown[];
}

export default function SystemOverview({
    project,
    overviewVersions: initialOverviewVersions,
    hasModules,
    isGenerating: initialIsGenerating = false,
    sections = { overview: null, prd: null, data_modeling: null, non_functional_requirements: null },
    features = [],
}: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const [currentVersion, setCurrentVersion] = useState<OverviewVersion | null>(null);
    const [overviewVersions, setOverviewVersions] = useState<OverviewVersion[]>(initialOverviewVersions || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isInitialGeneration, setIsInitialGeneration] = useState(initialIsGenerating);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [projectHasModules, setProjectHasModules] = useState(hasModules);
    const [isOpeningModuleSuggestions, setIsOpeningModuleSuggestions] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    // Fix #1: Track generation errors for retry UI
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Ref to prevent double-triggering of initial generation (React StrictMode, multiple renders)
    const generationTriggeredRef = useRef(false);

    // Fix #10: AbortController to cancel in-flight requests on unmount
    const activeRequestRef = useRef<AbortController | null>(null);

    // Cleanup active requests on unmount
    useEffect(() => {
        return () => {
            activeRequestRef.current?.abort();
        };
    }, []);

    // Helper function to open content in new tab via form POST
    const openInNewTab = (url: string, content: string, title: string) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.target = '_blank';

        const csrfToken = getCsrfToken();
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

    // WHY: Replaced ~50 lines of resize logic with shared hook
    const { width: leftPaneWidth, isResizing, handleMouseDown, containerRef } = useResizablePanel({
        initialWidth: 40,
        minWidth: 20,
        maxWidth: 80,
    });

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project?.name || 'Project', href: `/projects/${project?.id}` },
        { title: 'System Overview', href: `/projects/${project?.id}/system-overview` },
    ];

    const completionPercentage = useMemo(() => {
        return project?.progress ?? 0;
    }, [project]);

    const health = useMemo(() => {
        return getHealthStatus(completionPercentage);
    }, [completionPercentage]);

    // Fix #9: Pre-sorted version lists to ensure consistent ordering
    const sortedVersionsDesc = useMemo(
        () => [...overviewVersions].sort((a, b) => b.version_number - a.version_number),
        [overviewVersions],
    );

    const sortedVersionsAsc = useMemo(
        () => [...overviewVersions].sort((a, b) => a.version_number - b.version_number),
        [overviewVersions],
    );

    // Fix #11: Track the base version for warnings
    const baseVersion = useMemo(
        () => overviewVersions.find((v) => v.is_base_version) || null,
        [overviewVersions],
    );

    // Initialize Mermaid
    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        mermaid.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
        });
    }, []);

    // Handle initial generation trigger (with ref guard to prevent double-calls in StrictMode)
    useEffect(() => {
        if (isInitialGeneration && project && !generationTriggeredRef.current) {
            generationTriggeredRef.current = true;
            triggerAsyncGeneration();
        }
    }, [isInitialGeneration]);

    // Initialize with overview versions from props
    useEffect(() => {
        if (initialOverviewVersions && initialOverviewVersions.length > 0) {
            // Find the base version or use the first one
            const baseVersion = initialOverviewVersions.find((v) => v.is_base_version) || initialOverviewVersions[0];
            setCurrentVersion(baseVersion);
            setEditedContent(baseVersion.overview);

            // Initialize chat messages from versions
            const messages: ChatMessage[] = initialOverviewVersions.map((version) => ({
                id: `version-${version.id}`,
                type: 'assistant',
                content: version.overview,
                timestamp: new Date(version.created_at),
                versionId: version.id,
            }));
            setChatMessages(messages);
        } else if (project && project.overview && overviewVersions.length === 0 && !isInitialGeneration) {
            // Fallback to project overview if no versions exist (but not during initial generation)
            const initialVersion: OverviewVersion = {
                id: 0,
                project_id: project.id,
                overview: project.overview,
                version_number: 1,
                is_base_version: true,
                user_prompt: 'Initial project overview',
                created_at: project.created_at,
                updated_at: project.updated_at,
            };
            setOverviewVersions([initialVersion]);
            setCurrentVersion(initialVersion);
            setEditedContent(initialVersion.overview);
        }
    }, [initialOverviewVersions, project, isInitialGeneration]);

    // MermaidDiagram is now imported from '@/components/MermaidDiagram'
    // Removed ~188 lines of inline component definition

    // Handle initial async generation
    // Fix #5: Keep isInitialGeneration=true throughout the fetch so the shimmer stays visible
    // Fix #1: Set generationError on failure so a retry button is shown
    // Fix #10: Use AbortController for cleanup on unmount
    const triggerAsyncGeneration = async () => {
        setGenerationError(null);

        // Abort any prior in-flight request
        activeRequestRef.current?.abort();
        const controller = new AbortController();
        activeRequestRef.current = controller;

        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/generate-async`, {
                method: 'POST',
                headers: getJsonHeaders(),
                signal: controller.signal,
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    setOverviewVersions(data.overviewVersions);

                    const newestVersion = [...data.overviewVersions].sort(
                        (a: OverviewVersion, b: OverviewVersion) => b.version_number - a.version_number,
                    )[0];
                    setCurrentVersion(newestVersion);
                    setEditedContent(newestVersion.overview);

                    if (typeof data.hasModules === 'boolean') {
                        setProjectHasModules(data.hasModules);
                    }

                    toast.success('System overview generated successfully!');
                } else {
                    throw new Error(data.message || 'Failed to generate overview');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate overview');
            }
        } catch (error) {
            // Silently ignore abort errors (user navigated away)
            if (error instanceof DOMException && error.name === 'AbortError') return;

            console.error('Error generating overview:', error);
            const errorMsg = error instanceof Error ? error.message : 'Failed to generate system overview. Please try again.';
            setGenerationError(errorMsg);
            // Reset the ref on error so user can retry
            generationTriggeredRef.current = false;
            toast.error(errorMsg);
        } finally {
            // Fix #5: Only clear the shimmer AFTER the request completes (success or error)
            setIsInitialGeneration(false);
        }
    };

    // Fix #8: Async regeneration for the empty-state "Generate" button
    // Uses fetch instead of router.post to avoid blocking the UI for 2 minutes
    const triggerRegeneration = useCallback(async () => {
        setIsInitialGeneration(true);
        setGenerationError(null);

        activeRequestRef.current?.abort();
        const controller = new AbortController();
        activeRequestRef.current = controller;

        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/regenerate`, {
                method: 'POST',
                headers: getJsonHeaders(),
                signal: controller.signal,
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    setOverviewVersions(data.overviewVersions);

                    const newestVersion = [...data.overviewVersions].sort(
                        (a: OverviewVersion, b: OverviewVersion) => b.version_number - a.version_number,
                    )[0];
                    setCurrentVersion(newestVersion);
                    setEditedContent(newestVersion.overview);

                    if (typeof data.hasModules === 'boolean') {
                        setProjectHasModules(data.hasModules);
                    }

                    toast.success('System overview regenerated successfully!');
                } else {
                    throw new Error(data.message || 'Failed to regenerate overview');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to regenerate overview');
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;

            console.error('Error regenerating overview:', error);
            const errorMsg = error instanceof Error ? error.message : 'Failed to regenerate system overview.';
            setGenerationError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsInitialGeneration(false);
        }
    }, [project?.id]);

    // Handle AI prompt submission using updateWithAi controller method
    // Fix #2: Sync editedContent after AI update
    // Fix #3: Check data.success from response
    // Fix #4: Show meaningful chat message with version info
    // Fix #10: Use AbortController
    const handlePromptSubmit = async (prompt: string) => {
        if (!prompt.trim() || isGenerating || !currentVersion) return;

        setIsGenerating(true);
        const newPrompt = prompt.trim();

        // Add user message to chat
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: newPrompt,
            timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, userMessage]);

        activeRequestRef.current?.abort();
        const controller = new AbortController();
        activeRequestRef.current = controller;

        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/update-with-ai`, {
                method: 'POST',
                headers: getJsonHeaders(),
                body: JSON.stringify({
                    system_overview: currentVersion.overview,
                    engineer_notes: newPrompt,
                }),
                signal: controller.signal,
            });

            if (response.ok) {
                const data = await response.json();

                // Fix #3: Check data.success, not just HTTP status
                if (!data.success) {
                    throw new Error(data.message || 'Failed to update overview with AI');
                }

                // Update the versions list with the new data
                if (data.overviewVersions) {
                    setOverviewVersions(data.overviewVersions);

                    const newestVersion = [...data.overviewVersions].sort(
                        (a: OverviewVersion, b: OverviewVersion) => b.version_number - a.version_number,
                    )[0];
                    setCurrentVersion(newestVersion);
                    // Fix #2: Sync editedContent so the Edit view shows correct content
                    setEditedContent(newestVersion.overview);

                    // Fix #4: Meaningful chat message with version info
                    const aiMessage: ChatMessage = {
                        id: `ai-${Date.now()}`,
                        type: 'assistant',
                        content: `Overview updated to Version ${newestVersion.version_number} and set as the base version.`,
                        timestamp: new Date(),
                        versionId: newestVersion.id,
                    };
                    setChatMessages((prev) => [...prev, aiMessage]);
                }

                if (typeof data.hasModules === 'boolean') {
                    setProjectHasModules(data.hasModules);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update overview with AI');
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;

            console.error('Error updating overview with AI:', error);

            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                type: 'assistant',
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                timestamp: new Date(),
            };
            setChatMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle manual content update using userUpdate controller method
    // Fix #6: Use server data.overviewVersions when available instead of optimistic-only update
    const handleContentUpdate = async () => {
        if (!currentVersion || !editedContent.trim()) return;

        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/${currentVersion.id}/user-update`, {
                method: 'POST',
                headers: getJsonHeaders(),
                body: JSON.stringify({
                    overview: editedContent,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Fix #6: Prefer server-returned version list to stay in sync
                    if (data.overviewVersions) {
                        setOverviewVersions(data.overviewVersions);
                        const updatedCurrent = data.overviewVersions.find(
                            (v: OverviewVersion) => v.id === currentVersion.id,
                        );
                        if (updatedCurrent) {
                            setCurrentVersion(updatedCurrent);
                            setEditedContent(updatedCurrent.overview);
                        }
                    } else {
                        // Fallback to local update if server doesn't return versions
                        const updatedVersion = { ...currentVersion, overview: editedContent };
                        setCurrentVersion(updatedVersion);
                        setOverviewVersions((prev) =>
                            prev.map((v) => (v.id === currentVersion.id ? updatedVersion : v)),
                        );
                    }
                    setIsEditing(false);
                    toast.success(data.message || 'Overview updated successfully');
                } else {
                    throw new Error(data.message || 'Failed to update overview');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update overview');
            }
        } catch (error) {
            console.error('Error updating overview:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update overview');
        }
    };

    // Handle marking version as base using markAsBase controller method
    const handleMarkAsBase = async (version: OverviewVersion) => {
        try {
            const response = await fetch(`/projects/${project?.id}/system-overview/${version.id}/mark-as-base`, {
                method: 'POST',
                headers: getJsonHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (data.overviewVersions) {
                        setOverviewVersions(data.overviewVersions);
                        const updatedCurrent = data.overviewVersions.find(
                            (v: OverviewVersion) => v.id === currentVersion?.id,
                        );
                        if (updatedCurrent) {
                            setCurrentVersion(updatedCurrent);
                        }
                    }
                    toast.success(data.message || 'Version marked as base successfully');
                } else {
                    throw new Error(data.message || 'Failed to mark version as base');
                }
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

    const navGroups = useMemo(() => {
        if (!project) {
            return [];
        }

        return buildProjectNavGroups({
            project,
            currentPage: 'overview',
        });
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
                                <div className="px-4 py-4 sm:px-6 lg:px-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                                    </div>
                                </div>

                                <div className="flex flex-1 overflow-hidden" ref={containerRef}>
                                    {/* Chat Section - Left Side */}
                                    <div className="flex flex-col border-r border-border bg-background" style={{ width: `${leftPaneWidth}%` }}>
                                        {/* Chat Header */}
                                        <div className="flex items-center justify-between border-b border-border p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                    <FileTextIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold">Versions</h2>
                                                    <p className="text-sm text-muted-foreground">{project?.name || 'Project'}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(`/projects/${project?.id}`)}
                                                className="flex items-center gap-2 border-primary/20 hover:border-primary/30 hover:bg-primary/10"
                                                title="Back to Project"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                <span className="font-medium">Back</span>
                                            </Button>
                                        </div>

                                        {/* Version History */}
                                        <ScrollArea className="flex-1 p-4">
                                            <div className="space-y-4">
                                                {isInitialGeneration ? (
                                                    <div className="flex h-32 items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                                <TextShimmer className="text-sm text-blue-600 dark:text-blue-400">
                                                                    Generating...
                                                                </TextShimmer>
                                                            </div>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Creating your first overview</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500">This may take a moment</p>
                                                        </div>
                                                    </div>
                                                ) : sortedVersionsDesc.length > 0 ? (
                                                    sortedVersionsDesc.map((version) => (
                                                            <div
                                                                key={version.id}
                                                                className={`cursor-pointer rounded-lg border p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                                                    currentVersion?.id === version.id
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                        : 'border-slate-200 dark:border-slate-700'
                                                                }`}
                                                                onClick={() => handleVersionSelect(version)}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                                v{version.version_number}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center space-x-2">
                                                                                <span className="text-sm font-medium text-slate-800 dark:text-white">
                                                                                    Version {version.version_number}
                                                                                </span>
                                                                                {version.is_base_version && (
                                                                                    <StarIcon className="h-4 w-4 text-yellow-500" />
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                                <ClientDateTime value={version.created_at} dateStyle="short" />
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {version.user_prompt && (
                                                                    <div className="mt-2">
                                                                        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                                                            {version.user_prompt}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="flex h-32 items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                                                <FileTextIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                                            </div>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">No versions yet</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                                Start a conversation to create your first version
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {isGenerating && (
                                                    <div className="flex justify-start">
                                                        <div className="flex max-w-[80%] space-x-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                                                <BotIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                            </div>
                                                            <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                                                                <TextShimmer className="text-sm text-slate-600 dark:text-slate-400">
                                                                    Editing overview...
                                                                </TextShimmer>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>

                                        {/* Fix #11: Warning when viewing a non-base version */}
                                        {currentVersion &&
                                            !currentVersion.is_base_version &&
                                            baseVersion &&
                                            !isInitialGeneration &&
                                            overviewVersions.length > 1 && (
                                                <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                                    <AlertTriangleIcon className="h-4 w-4 flex-shrink-0" />
                                                    <span>
                                                        Viewing v{currentVersion.version_number} — AI edits will be based
                                                        on this version, not the base (v{baseVersion.version_number}).
                                                    </span>
                                                </div>
                                            )}

                                        {/* Chat Input */}
                                        <ChatInput onSubmit={handlePromptSubmit} isGenerating={isGenerating} />
                                    </div>

                                    {/* Resize Handle */}
                                    <div
                                        className="group relative w-1 cursor-col-resize bg-border transition-colors duration-200 hover:bg-primary/50"
                                        onMouseDown={handleMouseDown}
                                    >
                                        <div className="absolute inset-y-0 -right-1 -left-1 transition-colors duration-200 group-hover:bg-primary/20" />
                                    </div>

                                    {/* Result Section - Right Side */}
                                    <div className="flex flex-col bg-background" style={{ width: `${100 - leftPaneWidth}%` }}>
                                        {/* Result Header */}
                                        <div className="flex items-center justify-between border-b border-border p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                                    <FileTextIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold">System Overview</h2>
                                                    {currentVersion && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Version {currentVersion.version_number.toString().padStart(2, '0')}
                                                            {currentVersion.is_base_version && (
                                                                <span className="ml-2 inline-flex items-center text-yellow-600">
                                                                    <StarIcon className="mr-1 h-3 w-3" />
                                                                    Base Version
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {!projectHasModules && (
                                                    <Button
                                                        onClick={() => {
                                                            setIsOpeningModuleSuggestions(true);
                                                            router.visit(`/modules/create/${project?.id}`);
                                                        }}
                                                        className="rounded-lg border border-primary/20 bg-primary/5 text-primary backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/10"
                                                        disabled={
                                                            !currentVersion ||
                                                            !(currentVersion.overview && currentVersion.overview.trim().length > 0) ||
                                                            isOpeningModuleSuggestions
                                                        }
                                                    >
                                                        <SparklesIcon className="mr-2 h-4 w-4" />
                                                        Generate Modules
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditing(!isEditing)}
                                                    className="rounded-xl"
                                                    disabled={isGenerating}
                                                >
                                                    {isEditing ? <EyeIcon className="mr-2 h-4 w-4" /> : <PencilIcon className="mr-2 h-4 w-4" />}
                                                    {isEditing ? 'Preview' : 'Edit'}
                                                </Button>
                                                {currentVersion?.overview && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openInNewTab(
                                                            `/projects/${project?.id}/system-overview/preview`,
                                                            currentVersion.overview,
                                                            'System Overview'
                                                        )}
                                                        className="rounded-xl"
                                                        title="Open System Overview in new tab"
                                                    >
                                                        <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                                        Overview
                                                    </Button>
                                                )}
                                                {sections?.prd && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openInNewTab(
                                                            `/projects/${project?.id}/prd/preview`,
                                                            sections.prd!,
                                                            'Product Requirements Document'
                                                        )}
                                                        className="rounded-xl"
                                                        title="Open PRD in new tab"
                                                    >
                                                        <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                                        PRD
                                                    </Button>
                                                )}
                                                {currentVersion && !currentVersion.is_base_version && (
                                                    <Button
                                                        onClick={() => handleMarkAsBase(currentVersion)}
                                                        className="rounded-xl"
                                                        disabled={isGenerating}
                                                    >
                                                        <StarIcon className="mr-2 h-4 w-4" />
                                                        Mark as Base
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Version Selector */}
                                        {!isInitialGeneration && overviewVersions.length > 0 && (
                                            <div className="border-b border-border p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {sortedVersionsAsc.map((version) => (
                                                        <Button
                                                            key={version.id}
                                                            variant={currentVersion?.id === version.id ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleVersionSelect(version)}
                                                        >
                                                            v{version.version_number.toString().padStart(2, '0')}
                                                            {version.is_base_version && <StarIcon className="ml-1 h-3 w-3" />}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Content Area */}
                                        <ScrollArea className="flex-1 p-6">
                                            {isInitialGeneration ? (
                                                <Card>
                                                    <CardContent className="p-0">
                                                        <div className="flex h-64 items-center justify-center bg-muted/10">
                                                            <div className="text-center">
                                                                <TextShimmer className="text-2xl font-semibold">
                                                                    Generating System Overview...
                                                                </TextShimmer>
                                                                <p className="mt-4 text-sm text-muted-foreground">This may take a moment</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ) : currentVersion ? (
                                                <Card>
                                                    <CardContent className="p-0">
                                                        {isEditing ? (
                                                            <div className="flex flex-col">
                                                                <div className="border-b border-border bg-muted/50 p-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="text-sm font-medium">Edit Overview</h3>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                                                                Cancel
                                                                            </Button>
                                                                            <Button size="sm" onClick={handleContentUpdate} disabled={isGenerating}>
                                                                                <SaveIcon className="mr-1 h-3 w-3" />
                                                                                Save Changes
                                                                            </Button>
                                                                        </div>
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
                                                                <div className="prose prose-slate dark:prose-invert prose-table-bordered max-w-none">
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

                                                                                return (
                                                                                    <code className={className} {...props}>
                                                                                        {children}
                                                                                    </code>
                                                                                );
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
                                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                                                            {/* Fix #1: Show error icon when generation failed */}
                                                            {generationError ? (
                                                                <AlertTriangleIcon className="h-8 w-8 text-red-400 dark:text-red-500" />
                                                            ) : (
                                                                <FileTextIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                                            )}
                                                        </div>

                                                        {/* Fix #1: Show error state with retry when generation fails */}
                                                        {generationError ? (
                                                            <>
                                                                <h3 className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">
                                                                    Generation Failed
                                                                </h3>
                                                                <p className="mb-1 max-w-md text-sm text-slate-600 dark:text-white/70">
                                                                    {generationError}
                                                                </p>
                                                                <div className="mt-4">
                                                                    <Button
                                                                        onClick={() => {
                                                                            setGenerationError(null);
                                                                            triggerRegeneration();
                                                                        }}
                                                                    >
                                                                        <RefreshCwIcon className="mr-2 h-4 w-4" />
                                                                        Retry Generation
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">
                                                                    No Overview Available
                                                                </h3>
                                                                <p className="text-slate-600 dark:text-white/70">
                                                                    Start a conversation to generate your first system overview.
                                                                </p>
                                                                <div className="mt-4">
                                                                    {/* Fix #8: Use async fetch instead of blocking router.post */}
                                                                    <Button
                                                                        onClick={triggerRegeneration}
                                                                        disabled={isInitialGeneration}
                                                                    >
                                                                        {isInitialGeneration ? (
                                                                            <TextShimmer>Generating...</TextShimmer>
                                                                        ) : (
                                                                            'Generate System Overview'
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
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

            {/* Overlay Loading when opening Module Suggestions */}
            {isOpeningModuleSuggestions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-8 shadow-lg">
                        <div className="relative">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-6 w-6 animate-pulse rounded-full bg-primary/20"></div>
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
