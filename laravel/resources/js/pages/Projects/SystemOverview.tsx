import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Textarea } from '@/components/ui/textarea';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowLeft,
    BotIcon,
    CheckCircleIcon,
    CheckIcon,
    ChevronDownIcon,
    CodeIcon,
    CopyIcon,
    DatabaseIcon,
    EyeIcon,
    FileIcon,
    FileTextIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    PanelLeftClose,
    PanelLeftOpen,
    PencilIcon,
    SaveIcon,
    SendIcon,
    SparklesIcon,
    StarIcon,
    TrendingUpIcon,
    ZapIcon,
} from 'lucide-react';
import mermaid from 'mermaid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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

interface OverviewVersion {
    id: number;
    project_id: number;
    overview: string;
    version_number: number;
    is_base_version: boolean;
    user_prompt: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    project?: Project;
    overviewVersions: OverviewVersion[];
    hasFeatures: boolean;
    isGenerating?: boolean;
    sections?: {
        overview: string | null;
        prd: string | null;
        data_modeling: string | null;
        non_functional_requirements: string | null;
    };
    features?: any[];
}

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    versionId?: number;
}

interface ChatInputProps {
    onSubmit: (prompt: string) => void;
    isGenerating: boolean;
}

const ChatInput = ({ onSubmit, isGenerating }: ChatInputProps) => {
    const [promptInput, setPromptInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!promptInput.trim() || isGenerating) return;
        onSubmit(promptInput.trim());
        setPromptInput('');
    };

    return (
        <div className="border-t border-slate-200/60 p-4 dark:border-slate-700/60">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Textarea
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder="Ask me to improve or modify the system overview..."
                        className="min-h-[60px] resize-none border-slate-200 pr-12 text-sm focus:border-blue-300 dark:border-slate-700 dark:focus:border-blue-600"
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (promptInput.trim() && !isGenerating) {
                                    handleSubmit(e);
                                }
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-blue-500 p-0 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600"
                        disabled={!promptInput.trim() || isGenerating}
                    >
                        {isGenerating ? (
                            <TextShimmer className="text-xs text-white">Sending</TextShimmer>
                        ) : (
                            <SendIcon className="h-4 w-4 text-white" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Utility function to convert escaped Mermaid strings
const convertEscapedMermaid = (escapedString: string): string => {
    // Remove markdown code block markers
    let cleaned = escapedString.replace(/```mermaid\s*/g, '').replace(/```\s*$/g, '');

    // Convert escaped newlines to actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');

    // Remove backslashes not related to newlines
    cleaned = cleaned.replace(/\\(?!n)/g, '');

    // Remove empty lines and excessive whitespace
    cleaned = cleaned
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');

    // Handle double square brackets and invalid node labels
    cleaned = cleaned.replace(/(\w+)\s*\[\[([^\]]*)\]\]/g, (match, nodeId, content) => {
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '') // Remove problematic symbols
            .replace(/\s+/g, ' ')
            .trim();
        return `${nodeId}[${fixedContent || 'Unnamed'}]`;
    });

    // Handle single square brackets with problematic content
    cleaned = cleaned.replace(/\[([^\]]*)\]/g, (match, content) => {
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '') // Remove problematic symbols
            .replace(/\s+/g, ' ')
            .trim();
        return `[${fixedContent || 'Unnamed'}]`;
    });

    // Handle node labels in round brackets
    cleaned = cleaned.replace(/\((\s*[^()]+?\s*)\)/g, (match, content) => {
        const fixedContent = content
            .replace(/[[\]{}"';]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return `(${fixedContent || 'Unnamed'})`;
    });

    // Handle invalid relationships like --> [B, C, E, G]
    const lines = cleaned.split('\n');
    const newLines: string[] = [];
    const seenNodes = new Set<string>();

    for (const line of lines) {
        // Check for invalid relationship with comma-separated nodes
        const invalidRelationMatch = line.match(/(\w+)\s*-->\s*\[\s*([\w\s,]+)\s*\]/);
        if (invalidRelationMatch) {
            const sourceNode = invalidRelationMatch[1];
            const targetNodes = invalidRelationMatch[2]
                .split(',')
                .map((node) => node.trim())
                .filter((node) => node.length > 0);
            // Replace with individual relationships
            targetNodes.forEach((target) => {
                newLines.push(`${sourceNode} --> ${target}`);
            });
        } else {
            newLines.push(line);
        }

        // Track node IDs to prevent duplicates
        const nodeMatch = line.match(/^(\w+)\[.*?\]/);
        if (nodeMatch) {
            const nodeId = nodeMatch[1];
            if (seenNodes.has(nodeId)) {
                console.warn(`Duplicate node ID found: ${nodeId}`);
            } else {
                seenNodes.add(nodeId);
            }
        }
    }

    cleaned = newLines.join('\n');

    // Ensure valid subgraph closure
    cleaned = cleaned.replace(/subgraph\s+([^\s[{]+)\s*\[\s*([^\]]*?)\s*\]/g, 'subgraph $1 [$2]');

    // Remove trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
};
// Utility function to validate Mermaid syntax
// const validateMermaidSyntax = (code: string): { isValid: boolean; error?: string } => {
//     try {
//         if (!code.trim()) {
//             return { isValid: false, error: 'Empty diagram code' };
//         }

//         const diagramTypes = [
//             'graph',
//             'flowchart',
//             'sequenceDiagram',
//             'classDiagram',
//             'stateDiagram',
//             'erDiagram',
//             'journey',
//             'gantt',
//             'pie',
//             'gitgraph',
//         ];
//         const hasValidType = diagramTypes.some((type) => code.toLowerCase().startsWith(type.toLowerCase()));
//         if (!hasValidType) {
//             return {
//                 isValid: false,
//                 error: `No valid Mermaid diagram type found. Supported types: ${diagramTypes.join(', ')}`,
//             };
//         }

//         const lines = code
//             .split('\n')
//             .map((line) => line.trim())
//             .filter((line) => line.length > 0);
//         const nodeIds = new Set<string>();
//         const referencedNodes = new Set<string>();
//         let hasSubgraph = false;
//         let openSubgraphs = 0;

//         for (const line of lines) {
//             // Check node definitions (e.g., A[Label])
//             const nodeMatch = line.match(/^(\w+)\[.*?\]/);
//             if (nodeMatch) {
//                 const nodeId = nodeMatch[1];
//                 if (nodeIds.has(nodeId)) {
//                     return { isValid: false, error: `Duplicate node ID: ${nodeId}` };
//                 }
//                 nodeIds.add(nodeId);
//             }

//             // Check for invalid relationship with comma-separated nodes
//             const invalidRelationMatch = line.match(/(\w+)\s*-->\s*\[\s*([\w\s,]+)\s*\]/);
//             if (invalidRelationMatch) {
//                 return {
//                     isValid: false,
//                     error: `Invalid relationship syntax: '${invalidRelationMatch[0]}'. Use individual relationships like 'A --> B'.`,
//                 };
//             }

//             // Check valid relationships (e.g., A --> B)
//             const relationshipMatch = line.match(/(\w+)\s*-->\s*(\w+)/);
//             if (relationshipMatch) {
//                 const [, source, target] = relationshipMatch;
//                 referencedNodes.add(source);
//                 referencedNodes.add(target);
//             }

//             // Check subgraph syntax
//             if (line.startsWith('subgraph')) {
//                 hasSubgraph = true;
//                 openSubgraphs++;
//             } else if (line === 'end') {
//                 openSubgraphs--;
//             }
//         }

//         if (openSubgraphs !== 0) {
//             return { isValid: false, error: 'Unclosed subgraph detected' };
//         }

//         for (const node of referencedNodes) {
//             if (!nodeIds.has(node)) {
//                 return { isValid: false, error: `Undefined node referenced: ${node}` };
//             }
//         }

//         if (!nodeIds.size && !referencedNodes.size && !hasSubgraph) {
//             return { isValid: false, error: 'Diagram is empty or lacks valid content' };
//         }

//         return { isValid: true };
//     } catch (error) {
//         return {
//             isValid: false,
//             error: error instanceof Error ? error.message : 'Syntax validation failed',
//         };
//     }
// };
// Quantum Pulse Loader Component
const QuantumPulseLoader = ({ text = 'Generating' }: { text?: string }) => {
    return (
        <>
            <style>{`
                @keyframes generating-loader-letter-anim {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) rotateX(-90deg);
                        text-shadow: 0 0 0px rgba(255, 255, 255, 0);
                    }
                    10% {
                        opacity: 1;
                        transform: translateY(0) rotateX(0deg);
                        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                    }
                    30% {
                        opacity: 1;
                        transform: translateY(0) rotateX(0deg);
                        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                    }
                    50% {
                        opacity: 0;
                        transform: translateY(-20px) rotateX(90deg);
                        text-shadow: 0 0 0px rgba(255, 255, 255, 0);
                    }
                    100% {
                        opacity: 0;
                    }
                }

                @keyframes generating-loader-bar-anim {
                    0% {
                        left: -100%;
                    }
                    50% {
                        left: 100%;
                    }
                    100% {
                        left: -100%;
                    }
                }

                .generating-loader-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    min-height: 400px;
                }

                .generating-loader-text {
                    display: flex;
                    font-size: 2rem;
                    font-weight: 600;
                    color: rgb(30 41 59);
                    margin-bottom: 2rem;
                }

                .dark .generating-loader-text {
                    color: rgb(226 232 240);
                }

                .generating-loader-letter {
                    display: inline-block;
                    animation: generating-loader-letter-anim 2s infinite;
                    margin-right: 2px;
                }

                .generating-loader-letter:nth-child(1) { animation-delay: 0s; }
                .generating-loader-letter:nth-child(2) { animation-delay: 0.1s; }
                .generating-loader-letter:nth-child(3) { animation-delay: 0.2s; }
                .generating-loader-letter:nth-child(4) { animation-delay: 0.3s; }
                .generating-loader-letter:nth-child(5) { animation-delay: 0.4s; }
                .generating-loader-letter:nth-child(6) { animation-delay: 0.5s; }
                .generating-loader-letter:nth-child(7) { animation-delay: 0.6s; }
                .generating-loader-letter:nth-child(8) { animation-delay: 0.7s; }
                .generating-loader-letter:nth-child(9) { animation-delay: 0.8s; }
                .generating-loader-letter:nth-child(10) { animation-delay: 0.9s; }
                .generating-loader-letter:nth-child(11) { animation-delay: 1.0s; }
                .generating-loader-letter:nth-child(12) { animation-delay: 1.1s; }
                .generating-loader-letter:nth-child(13) { animation-delay: 1.2s; }
                .generating-loader-letter:nth-child(14) { animation-delay: 1.3s; }
                .generating-loader-letter:nth-child(15) { animation-delay: 1.4s; }
                .generating-loader-letter:nth-child(16) { animation-delay: 1.5s; }
                .generating-loader-letter:nth-child(17) { animation-delay: 1.6s; }
                .generating-loader-letter:nth-child(18) { animation-delay: 1.7s; }
                .generating-loader-letter:nth-child(19) { animation-delay: 1.8s; }
                .generating-loader-letter:nth-child(20) { animation-delay: 1.9s; }

                .generating-loader-bar {
                    position: relative;
                    width: 200px;
                    height: 4px;
                    background-color: rgb(226 232 240);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .dark .generating-loader-bar {
                    background-color: rgb(51 65 85);
                }

                .generating-loader-bar::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgb(59 130 246), transparent);
                    animation: generating-loader-bar-anim 2s infinite;
                }

                .dark .generating-loader-bar::before {
                    background: linear-gradient(90deg, transparent, rgb(96 165 250), transparent);
                }
            `}</style>
            <div className="generating-loader-wrapper">
                <div className="generating-loader-text">
                    {text.split('').map((letter, index) => (
                        <span key={index} className="generating-loader-letter">
                            {letter}
                        </span>
                    ))}
                </div>
                <div className="generating-loader-bar"></div>
            </div>
        </>
    );
};

export default function SystemOverview({
    project,
    overviewVersions: initialOverviewVersions,
    hasFeatures,
    isGenerating: initialIsGenerating = false,
    sections = { overview: null, prd: null, data_modeling: null, non_functional_requirements: null },
    features = [],
}: Props) {
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const getInitials = useInitials();
    const [currentVersion, setCurrentVersion] = useState<OverviewVersion | null>(null);
    const [overviewVersions, setOverviewVersions] = useState<OverviewVersion[]>(initialOverviewVersions || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isInitialGeneration, setIsInitialGeneration] = useState(initialIsGenerating);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [projectHasFeatures, setProjectHasFeatures] = useState(hasFeatures);
    const [leftPaneWidth, setLeftPaneWidth] = useState<number>(40); // percentage
    const [isResizing, setIsResizing] = useState(false);
    const [isOpeningFeatureSuggestions, setIsOpeningFeatureSuggestions] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current = requestAnimationFrame(() => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
                const constrained = Math.min(80, Math.max(20, newWidth));
                setLeftPaneWidth(constrained);
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

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project?.name || 'Project', href: `/projects/${project?.id}` },
        { title: 'System Overview', href: `/projects/${project?.id}/system-overview` },
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
                return <CircleIcon className="h-4 w-4" />;
            case 'in_progress':
                return <ClockIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            default:
                return <AlertCircleIcon className="h-4 w-4" />;
        }
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

    // Custom component for Mermaid diagrams
    const MermaidDiagram = ({ children }: { children: string }) => {
        const [svg, setSvg] = useState<string>('');
        const [error, setError] = useState<string>('');
        const [showCode, setShowCode] = useState(false);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [copied, setCopied] = useState(false);

        useEffect(() => {
            const renderDiagram = async () => {
                try {
                    setError('');
                    const cleanChildren = convertEscapedMermaid(children);

                    // Debug: log the cleaned code
                    console.log('Cleaned Mermaid code:', cleanChildren);

                    // Show warning if content was modified
                    if (children !== cleanChildren) {
                        console.warn('Mermaid code was automatically cleaned to fix syntax issues');
                    }

                    // Validate syntax before rendering
                    // const validation = validateMermaidSyntax(cleanChildren);
                    // if (!validation.isValid) {
                    //     setError(validation.error || 'Invalid Mermaid syntax');
                    //     return;
                    // }

                    const { svg: renderedSvg } = await mermaid.render(`mermaid-${Date.now()}`, cleanChildren);
                    setSvg(renderedSvg);
                } catch (err) {
                    console.error('Mermaid rendering error:', err);
                    setError(err instanceof Error ? err.message : 'Failed to render diagram');
                }
            };

            if (children.trim()) {
                renderDiagram();
            }
        }, [children]);

        const copyCode = async () => {
            try {
                const cleanCode = convertEscapedMermaid(children);
                await navigator.clipboard.writeText(cleanCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        };

        const openPreviewInNewTab = () => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/projects/${project?.id}/system-overview/preview-mermaid`;
            form.target = '_blank';

            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content');

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
            contentInput.value = children;
            form.appendChild(contentInput);

            const titleInput = document.createElement('input');
            titleInput.type = 'hidden';
            titleInput.name = 'title';
            titleInput.value = 'System Overview Mermaid Diagram';
            form.appendChild(titleInput);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        };

        if (error) {
            return (
                <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <div className="mb-2">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            <strong>Mermaid Diagram Error</strong>
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                    <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-red-500 hover:underline dark:text-red-400">Show debugging info</summary>
                        <div className="mt-2 space-y-2">
                            <div>
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">Raw code:</p>
                                <pre className="overflow-x-auto rounded bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    {children}
                                </pre>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">Cleaned code:</p>
                                <pre className="overflow-x-auto rounded bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    {convertEscapedMermaid(children)}
                                </pre>
                                {children !== convertEscapedMermaid(children) && (
                                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                        ⚠️ Code was automatically cleaned to fix syntax issues
                                    </p>
                                )}
                            </div>
                        </div>
                    </details>
                </div>
            );
        }

        if (!svg) {
            return (
                <div className="my-4 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-800">
                    <TextShimmer className="text-sm text-slate-500 dark:text-slate-400">Rendering diagram...</TextShimmer>
                </div>
            );
        }

        return (
            <div className="my-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)} className="h-8 text-xs">
                            <CodeIcon className="mr-1 h-3 w-3" />
                            {showCode ? 'Show Diagram' : 'Show Code'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyCode} className="h-8 text-xs" aria-live="polite">
                            {copied ? (
                                <>
                                    <CheckIcon className="mr-1 h-3 w-3 text-emerald-600" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <CopyIcon className="mr-1 h-3 w-3" />
                                    Copy Code
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={openPreviewInNewTab} className="h-8 text-xs">
                            <EyeIcon className="mr-1 h-3 w-3" />
                            Preview in New Tab
                        </Button>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <EyeIcon className="mr-1 h-3 w-3" />
                                Preview
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-full md:max-w-4xl lg:max-w-6xl">
                            <DialogHeader>
                                <DialogTitle>Mermaid Diagram Preview</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 flex justify-center">
                                <div
                                    className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {showCode ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                        <pre className="text-sm text-slate-700 dark:text-slate-300">
                            <code>{convertEscapedMermaid(children)}</code>
                        </pre>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div
                            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    </div>
                )}
            </div>
        );
    };

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

                    // Update hasFeatures state if provided
                    if (typeof data.hasFeatures === 'boolean') {
                        setProjectHasFeatures(data.hasFeatures);
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

                // Update hasFeatures state if provided
                if (typeof data.hasFeatures === 'boolean') {
                    setProjectHasFeatures(data.hasFeatures);
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
    const handleContentUpdate = async () => {
        if (!currentVersion || !editedContent.trim()) return;

        console.log('Updating content for version:', currentVersion.id);
        console.log('Project ID:', project?.id);
        console.log('URL:', `/projects/${project?.id}/system-overview/${currentVersion.id}/user-update`);

        try {
            // Get CSRF token from meta tag or cookie
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

            console.log('CSRF Token:', csrfToken);

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

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                // Update local state
                const updatedVersion = { ...currentVersion, overview: editedContent };
                setCurrentVersion(updatedVersion);
                setOverviewVersions((prev) => prev.map((v) => (v.id === currentVersion.id ? updatedVersion : v)));
                setIsEditing(false);

                // Update hasFeatures state if provided
                if (typeof data.hasFeatures === 'boolean') {
                    setProjectHasFeatures(data.hasFeatures);
                }
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Failed to update overview');
            }
        } catch (error) {
            console.error('Error updating overview:', error);
        }
    };

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
                // Refresh the page to get updated versions
                window.location.reload();
            } else {
                throw new Error('Failed to mark version as base');
            }
        } catch (error) {
            console.error('Error marking version as base:', error);
        }
    };

    const handleVersionSelect = (version: OverviewVersion) => {
        setCurrentVersion(version);
        setEditedContent(version.overview);
        setIsEditing(false);
    };

    const completionPercentage = useMemo(() => {
        const total = 5;
        let done = 0;
        if (sections.overview) done++;
        if (sections.prd) done++;
        if (sections.data_modeling) done++;
        if (project?.c4) done++;
        if (sections.non_functional_requirements) done++;
        return Math.round((done / total) * 100);
    }, [sections, project?.c4]);

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

    const navGroups: Array<{
        label: string;
        items: Array<{
            key: string;
            icon: any;
            label: string;
            onClick: () => void;
            active?: boolean;
            emphasize?: boolean;
            muted?: boolean;
            disabled?: boolean;
        }>;
    }> = [
        {
            label: 'Plan',
            items: [
                { key: 'home', icon: HomeIcon, label: 'Project Home', onClick: () => router.visit(`/projects/${project?.id}`) },
                {
                    key: 'overview',
                    icon: FileIcon,
                    label: 'System Overview',
                    active: true,
                    onClick: () => router.get(`/projects/${project?.id}/system-overview`),
                },
                {
                    key: 'prd',
                    icon: FileIcon,
                    label: sections.prd ? 'PRD' : 'Generate PRD',
                    emphasize: !sections.prd,
                    disabled: !sections.prd,
                    onClick: () => (sections.prd ? router.get(`/projects/${project?.id}/prd`) : router.post(`/projects/${project?.id}/prd/generate`)),
                },
                { key: 'features', icon: ZapIcon, label: 'Features', onClick: () => router.visit(`/projects/${project?.id}`) },
            ],
        },
        {
            label: 'Design',
            items: [
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    onClick: () => router.get(`/projects/${project?.id}/brainstorming`),
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
                    muted: !sections.data_modeling,
                    disabled: !sections.data_modeling,
                    onClick: () => sections.data_modeling && router.get(`/projects/${project?.id}/erd`),
                },
                {
                    key: 'c4',
                    icon: LayersIcon,
                    label: project?.c4 ? 'System Architecture' : 'Generate C4',
                    emphasize: !project?.c4,
                    disabled: !project?.c4,
                    onClick: () => (project?.c4 ? router.get(`/projects/${project?.id}/c4`) : router.post(`/projects/${project?.id}/c4/generate`)),
                },
                { key: 'technology', icon: CodeIcon, label: 'Technology Stack', onClick: () => router.get(`/projects/${project?.id}/technology`) },
            ],
        },
    ];

    return (
        <>
            <Head title={`System Overview - ${project?.name || 'Project'}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}>
                        <div
                            className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        >
                            <div className="overflow-y-auto">
                                <div className="mb-6">
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h1 className="text-sm font-semibold truncate">{project?.name}</h1>
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
                                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                                <AvatarFallback className="text-[10px] bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {auth.user?.name ? getInitials(auth.user.name) : ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-xs font-medium text-foreground">{auth.user?.name}</div>
                                                <div className="truncate text-[10px] text-muted-foreground">{auth.user?.email}</div>
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
                            <div className="px-4 py-4 sm:px-6 lg:px-8">
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
                                            {!projectHasFeatures && (
                                                <Button
                                                    onClick={() => {
                                                        setIsOpeningFeatureSuggestions(true);
                                                        router.visit(`/features/create/${project?.id}`);
                                                    }}
                                                    className="rounded-lg border border-primary/20 bg-primary/5 text-primary backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/10"
                                                    disabled={
                                                        !currentVersion ||
                                                        !(currentVersion.overview && currentVersion.overview.trim().length > 0) ||
                                                        isOpeningFeatureSuggestions
                                                    }
                                                >
                                                    <SparklesIcon className="mr-2 h-4 w-4" />
                                                    Generate Features
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
            </div>

            {/* Overlay Loading when opening Feature Suggestions */}
            {isOpeningFeatureSuggestions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-8 shadow-lg">
                        <div className="relative">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-6 w-6 animate-pulse rounded-full bg-primary/20"></div>
                            </div>
                        </div>
                        <div className="space-y-1 text-center">
                            <TextShimmer className="text-lg font-semibold">Generating Features</TextShimmer>
                            <p className="text-sm text-muted-foreground">Preparing AI suggestions for {project?.name || 'project'}...</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
