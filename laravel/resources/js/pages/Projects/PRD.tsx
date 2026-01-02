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
import { type User, type Project, type Sections, type PRDVersion, type ChatMessage } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Toaster } from '@/components/ui/sonner';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckIcon, CodeIcon, CopyIcon, EyeIcon, FileTextIcon, Maximize2, Minimize2, PencilIcon, SaveIcon } from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MermaidDiagram } from '@/components/MermaidDiagram';

// WHY: Removed ~95 lines of duplicate interface and ChatInput definitions.
// Types now imported from '@/types', ChatInput from '@/components/Chat/ChatInput'

interface Props {
    project?: Project;
    prdVersions: PRDVersion[];
    featuresMarkdown?: string;
    isGenerating?: boolean;
    sections?: Sections;
}

// convertEscapedMermaid now imported via MermaidDiagram component from '@/components/MermaidDiagram'

// Simple Loader Component using TextShimmer
const SimpleLoader = ({ text = 'Generating' }: { text?: string }) => {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
            <TextShimmer className="text-2xl font-semibold">{text}</TextShimmer>
        </div>
    );
};

export default function PRD({
    project,
    prdVersions: initialPRDVersions,
    featuresMarkdown = '',
    isGenerating: initialIsGenerating = false,
    sections,
}: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [currentVersion, setCurrentVersion] = useState<PRDVersion | null>(null);
    const [prdVersions, setPrdVersions] = useState<PRDVersion[]>(initialPRDVersions || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isInitialGeneration, setIsInitialGeneration] = useState(initialIsGenerating);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const breadcrumbs = project
        ? [
              { title: project.name, href: `/projects/${project.id}` },
              { title: 'PRD', href: `/projects/${project.id}/prd` },
          ]
        : [{ title: 'PRD', href: '#' }];

    const completionPercentage = useMemo(() => {
        return project?.progress ?? 0;
    }, [project]);

    const health = useMemo(() => {
        return getHealthStatus(completionPercentage);
    }, [completionPercentage]);

    const navGroups = useMemo(() => {
        if (!project) {
            return [];
        }

        return buildProjectNavGroups({
            project,
            currentPage: 'prd',
        });
    }, [project]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const downloadMarkdown = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportAsMarkdown = () => {
        const name = (project?.name || 'project').toLowerCase().replace(/[^a-z0-9\-]+/gi, '-');
        const fileName = `${name}-prd.md`;
        const base = currentVersion ? currentVersion.prd_content : '';
        const combined = featuresMarkdown ? `${base}\n\n---\n\n${featuresMarkdown}` : base;
        downloadMarkdown(fileName, combined);
    };

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

    // Initialize with PRD versions from props
    useEffect(() => {
        if (initialPRDVersions && initialPRDVersions.length > 0) {
            // Find the base version or use the first one
            const baseVersion = initialPRDVersions.find((v) => v.is_base_version) || initialPRDVersions[0];
            setCurrentVersion(baseVersion);
            setEditedContent(baseVersion.prd_content);

            // Initialize chat messages from versions
            const messages: ChatMessage[] = initialPRDVersions.map((version) => ({
                id: `version-${version.id}`,
                type: 'assistant',
                content: version.prd_content,
                timestamp: new Date(version.created_at),
                versionId: version.id,
            }));
            setChatMessages(messages);
        } else if (project && project.brief && prdVersions.length === 0 && !isInitialGeneration) {
            // Fallback to project brief if no versions exist (but not during initial generation)
            const initialVersion: PRDVersion = {
                id: 0,
                project_id: project.id,
                prd_content: project.brief,
                version_number: 1,
                is_base_version: true,
                user_prompt: 'Initial PRD content',
                created_at: project.created_at,
                updated_at: project.updated_at,
            };
            setPrdVersions([initialVersion]);
            setCurrentVersion(initialVersion);
            setEditedContent(initialVersion.prd_content);
        }
    }, [initialPRDVersions, project, isInitialGeneration]);

    // MermaidDiagram is now imported from '@/components/MermaidDiagram'
    // Removed ~200 lines of inline component definition

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

            const response = await fetch(`/projects/${project?.id}/prd/generate-async`, {
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
                    setPrdVersions(data.prdVersions);

                    // Set the newest version as current
                    if (data.prdVersions && data.prdVersions.length > 0) {
                        const newestVersion = data.prdVersions[0];
                        setCurrentVersion(newestVersion);
                        setEditedContent(newestVersion.prd_content);
                    }

                    // Mark initial generation as complete
                    setIsInitialGeneration(false);
                } else {
                    throw new Error(data.message || 'Failed to generate PRD');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate PRD');
            }
        } catch (error) {
            console.error('Error generating PRD:', error);
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

            // Call the ai-edit controller method using Inertia router
            router.post(
                `/projects/${project?.id}/prd/ai-edit`,
                {
                    engineer_notes: newPrompt,
                },
                {
                    onSuccess: () => {
                        // Success message will be shown via flash message
                        setIsGenerating(false);
                    },
                    onError: (errors) => {
                        console.error('Error updating PRD with AI:', errors);

                        // Add error message to chat
                        const errorMessage: ChatMessage = {
                            id: `error-${Date.now()}`,
                            type: 'assistant',
                            content: `Sorry, I encountered an error: ${Object.values(errors).join(', ')}. Please try again.`,
                            timestamp: new Date(),
                        };
                        setChatMessages((prev) => [...prev, errorMessage]);
                        setIsGenerating(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error updating PRD with AI:', error);

            // Add error message to chat
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                type: 'assistant',
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                timestamp: new Date(),
            };
            setChatMessages((prev) => [...prev, errorMessage]);
            setIsGenerating(false);
        }
    };

    // Handle manual content update
    const handleContentUpdate = () => {
        if (!project) return;

        router.post(
            `/projects/${project.id}/prd/edit`,
            { prd_content: editedContent },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    // Reload to get updated PRD
                    router.reload({ only: ['prdVersions'] });
                },
                preserveScroll: true,
            },
        );
    };

    // Handle marking version as base using markAsBase controller method
    const handleMarkAsBase = async (version: PRDVersion) => {
        try {
            // Get CSRF token
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

            const response = await fetch(`/projects/${project?.id}/prd/${version.id}/mark-as-base`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                // Refresh the page to get updated versions
                window.location.reload();
            } else {
                throw new Error('Failed to mark version as base');
            }
        } catch (error) {
            console.error('Error marking version as base:', error);
        }
    };

    const handleVersionSelect = (version: PRDVersion) => {
        setCurrentVersion(version);
        setEditedContent(version.prd_content);
        setIsEditing(false);
    };

    return (
        <>
            <Head title={`PRD - ${project?.name || 'Project'}`} />

            <div className="min-h-screen bg-background">
                {!isFullscreen && project && (
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
                                <div className="border-b px-4 py-3 sm:pl-6 lg:pl-6">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <SidebarToggle
                                                isCollapsed={isSidebarCollapsed}
                                                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                            />
                                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" onClick={toggleFullscreen} title="Enter Fullscreen">
                                                <Maximize2 className="mr-2 h-4 w-4" />
                                                Fullscreen
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                                                {isEditing ? <EyeIcon className="mr-2 h-4 w-4" /> : <PencilIcon className="mr-2 h-4 w-4" />}
                                                {isEditing ? 'Preview' : 'Edit'}
                                            </Button>
                                            <Button variant="outline" onClick={exportAsMarkdown}>
                                                Export MD
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-1 overflow-hidden">
                                    {/* Full-width Document Section */}
                                    <div className="flex w-full flex-col bg-background">
                                        {/* Subheader: meta info */}
                                        <div className="border-b border-border bg-muted/30 p-3">
                                            {currentVersion && (
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                    <span>Last updated: {new Date(currentVersion.updated_at).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>Words: {currentVersion.prd_content.trim().split(/\s+/).filter(Boolean).length}</span>
                                                    <span>•</span>
                                                    <span>
                                                        Read time:{' '}
                                                        {Math.max(
                                                            1,
                                                            Math.ceil(currentVersion.prd_content.trim().split(/\s+/).filter(Boolean).length / 200),
                                                        )}{' '}
                                                        min
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Area */}
                                        <ScrollArea className="flex-1 p-6">
                                            {isInitialGeneration ? (
                                                <SimpleLoader text="Generating PRD" />
                                            ) : currentVersion ? (
                                                <Card>
                                                    <CardContent className="p-0">
                                                        {isEditing ? (
                                                            <div className="flex flex-col">
                                                                <div className="border-b border-border bg-muted/50 p-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="text-sm font-medium">Edit PRD</h3>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                                                                Cancel
                                                                            </Button>
                                                                            <Button size="sm" onClick={handleContentUpdate}>
                                                                                <SaveIcon className="mr-1 h-3 w-3" />
                                                                                Save Changes
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                                        Note: To edit features (name, summary, criteria, etc.), go to each feature's
                                                                        page. The PRD page is not for editing features directly.
                                                                    </p>
                                                                </div>
                                                                <Textarea
                                                                    value={editedContent}
                                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                                    className="min-h-[500px] resize-none border-0 font-mono text-sm focus:ring-0"
                                                                    placeholder="Enter your PRD content in Markdown format..."
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
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
                                                                                            <MermaidDiagram projectId={project?.id} previewTitle="PRD Diagram">
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
                                                                            {currentVersion.prd_content}
                                                                        </ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                                {featuresMarkdown && (
                                                                    <div className="mt-8 border-t border-border px-6 pt-8">
                                                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                                                {`# Feature Requirements\n\n${featuresMarkdown}`}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
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
                                                            No PRD Available
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-white/70">
                                                            Start a conversation to generate your first PRD.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    {/* Right Sidebar for Versions/Chat could go here if needed */}
                                </div>
                            </div>
                        </main>
                    </div>
                )}

                {/* Fullscreen Mode */}
                {isFullscreen && project && (
                    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-background">
                        <div className="flex h-screen flex-col">
                            <div className="border-b p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                                            <FileTextIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold">Product Requirements Document</h2>
                                            <p className="text-sm text-muted-foreground">{project.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" onClick={toggleFullscreen}>
                                            <Minimize2 className="mr-2 h-4 w-4" />
                                            Exit Fullscreen
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                                            {isEditing ? <EyeIcon className="mr-2 h-4 w-4" /> : <PencilIcon className="mr-2 h-4 w-4" />}
                                            {isEditing ? 'Preview' : 'Edit'}
                                        </Button>
                                        <Button variant="outline" onClick={exportAsMarkdown}>
                                            Export MD
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-border bg-muted/30 p-3">
                                {currentVersion && (
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span>Last updated: {new Date(currentVersion.updated_at).toLocaleString()}</span>
                                        <span>•</span>
                                        <span>Words: {currentVersion.prd_content.trim().split(/\s+/).filter(Boolean).length}</span>
                                        <span>•</span>
                                        <span>
                                            Read time:{' '}
                                            {Math.max(1, Math.ceil(currentVersion.prd_content.trim().split(/\s+/).filter(Boolean).length / 200))} min
                                        </span>
                                    </div>
                                )}
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                {isInitialGeneration ? (
                                    <SimpleLoader text="Generating PRD" />
                                ) : currentVersion ? (
                                    <Card>
                                        <CardContent className="p-0">
                                            {isEditing ? (
                                                <div className="flex flex-col">
                                                    <div className="border-b border-border bg-muted/50 p-3">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="text-sm font-medium">Edit PRD</h3>
                                                            <div className="flex items-center gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                                                    Cancel
                                                                </Button>
                                                                <Button size="sm" onClick={handleContentUpdate}>
                                                                    <SaveIcon className="mr-1 h-3 w-3" />
                                                                    Save Changes
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Textarea
                                                        value={editedContent}
                                                        onChange={(e) => setEditedContent(e.target.value)}
                                                        className="min-h-[600px] resize-none border-0"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="prose prose-slate dark:prose-invert max-w-none p-6">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={{
                                                            // WHY: 'inline' prop removed - deprecated in react-markdown v9
                                                            // Detect inline via: no className = inline code
                                                            code: ({ className, children, ...props }) => {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                const isMermaid = match && match[1] === 'mermaid';
                                                                const isInline = !className;

                                                                if (isMermaid && !isInline) {
                                                                    return <MermaidDiagram projectId={project?.id} previewTitle="PRD Diagram">{String(children).replace(/\n$/, '')}</MermaidDiagram>;
                                                                }

                                                                return (
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {currentVersion.prd_content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            {featuresMarkdown && !isEditing && (
                                                <div className="mt-8 border-t border-border px-6 pt-8">
                                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                            {`# Feature Requirements\n\n${featuresMarkdown}`}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="flex h-96 items-center justify-center">
                                        <div className="text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded bg-muted">
                                                <FileTextIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold">No PRD Available</h3>
                                            <p className="text-muted-foreground">Start a conversation to generate your first PRD.</p>
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                )}

                {/* Floating Prompt Input - Hidden in fullscreen */}
                {!isFullscreen && project && (
                    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
                        <div className="w-full max-w-3xl rounded border bg-background">
                            <ChatInput onSubmit={handlePromptSubmit} isGenerating={isGenerating} />
                        </div>
                    </div>
                )}
            </div>
            <Toaster />
        </>
    );
}
