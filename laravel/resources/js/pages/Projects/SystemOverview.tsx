import { Breadcrumbs } from '@/components/breadcrumbs';
import { ChatInput } from '@/components/Chat/ChatInput';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Textarea } from '@/components/ui/textarea';
import { getHealthStatus } from '@/utils/project-status';
import { type User, type Project, type Sections, type OverviewVersion, type ChatMessage } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { toast } from 'sonner';
import { ArrowLeft, BotIcon, CheckIcon, CodeIcon, CopyIcon, EyeIcon, FileTextIcon, PencilIcon, SaveIcon, SparklesIcon, StarIcon } from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useMemo, useState } from 'react';
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

    // Handle initial generation trigger
    useEffect(() => {
        if (isInitialGeneration && project) {
            triggerAsyncGeneration();
        }
    }, [isInitialGeneration, project]);

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
    const triggerAsyncGeneration = async () => {
        try {
            // Get CSRF token
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

            const response = await fetch(`/projects/${project?.id}/system-overview/generate-async`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    // Update the versions list with the new data
                    setOverviewVersions(data.overviewVersions);

                    // Set the newest version as current
                    const newestVersion = data.overviewVersions.sort(
                        (a: OverviewVersion, b: OverviewVersion) => b.version_number - a.version_number,
                    )[0];
                    setCurrentVersion(newestVersion);
                    setEditedContent(newestVersion.overview);

                    // Update hasModules state if provided
                    if (typeof data.hasModules === 'boolean') {
                        setProjectHasModules(data.hasModules);
                    }

                    // Mark initial generation as complete
                    setIsInitialGeneration(false);
                } else {
                    throw new Error(data.message || 'Failed to generate overview');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate overview');
            }
        } catch (error) {
            console.error('Error generating overview:', error);
            setIsInitialGeneration(false);
            // You could add a toast notification here for the error
        }
    };

    // Handle AI prompt submission using updateWithAi controller method
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

        try {
            // Get CSRF token
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

            // Call the updateWithAi controller method
            const response = await fetch(`/projects/${project?.id}/system-overview/update-with-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    system_overview: currentVersion.overview,
                    engineer_notes: newPrompt,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Add AI response message to chat
                const aiMessage: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    type: 'assistant',
                    content: 'System overview updated successfully! A new version has been created and set as the base version.',
                    timestamp: new Date(),
                };
                setChatMessages((prev) => [...prev, aiMessage]);

                // Update the versions list with the new data
                if (data.overviewVersions) {
                    setOverviewVersions(data.overviewVersions);

                    // Set the newest version as current
                    const newestVersion = data.overviewVersions.sort(
                        (a: OverviewVersion, b: OverviewVersion) => b.version_number - a.version_number,
                    )[0];
                    setCurrentVersion(newestVersion);
                }

                // Update hasModules state if provided
                if (typeof data.hasModules === 'boolean') {
                    setProjectHasModules(data.hasModules);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update overview with AI');
            }
        } catch (error) {
            console.error('Error updating overview with AI:', error);

            // Add error message to chat
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
    // Handle manual content update using userUpdate controller method
    const handleContentUpdate = async () => {
        if (!currentVersion || !editedContent.trim()) return;

        try {
            // Get CSRF token
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

            const response = await fetch(`/projects/${project?.id}/system-overview/${currentVersion.id}/user-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    overview: editedContent,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const updatedVersion = { ...currentVersion, overview: editedContent };
                    setCurrentVersion(updatedVersion);
                    setOverviewVersions((prev) => prev.map((v) => (v.id === currentVersion.id ? updatedVersion : v)));
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
    // Handle marking version as base using markAsBase controller method
    const handleMarkAsBase = async (version: OverviewVersion) => {
        try {
            // Get CSRF token
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

            const response = await fetch(`/projects/${project?.id}/system-overview/${version.id}/mark-as-base`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update local state
                    if (data.overviewVersions) {
                        setOverviewVersions(data.overviewVersions);
                        // Update current version if it was the one marked as base
                        const updatedCurrent = data.overviewVersions.find((v: OverviewVersion) => v.id === currentVersion?.id);
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
                                                ) : overviewVersions.length > 0 ? (
                                                    overviewVersions
                                                        .sort((a, b) => b.version_number - a.version_number)
                                                        .map((version) => (
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
                                                                                {new Date(version.created_at).toLocaleDateString()}
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
                                                    {overviewVersions.map((version) => (
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
                                                                                        <MermaidDiagram>
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
                                                            <FileTextIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                                        </div>
                                                        <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">
                                                            No Overview Available
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-white/70">
                                                            Start a conversation to generate your first system overview.
                                                        </p>
                                                        <div className="mt-4">
                                                            <Button
                                                                onClick={() => {
                                                                    setIsInitialGeneration(true);
                                                                    router.post(
                                                                        `/projects/${project?.id}/system-overview/regenerate`,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                                }}
                                                                disabled={isInitialGeneration}
                                                            >
                                                                {isInitialGeneration ? (
                                                                    <TextShimmer>Generating...</TextShimmer>
                                                                ) : (
                                                                    'Generate System Overview'
                                                                )}
                                                            </Button>
                                                        </div>
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
