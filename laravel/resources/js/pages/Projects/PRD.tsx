
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
import { type User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
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
    Maximize2,
    Minimize2,
    PanelLeftClose,
    PanelLeftOpen,
    PencilIcon,
    SaveIcon,
    SendIcon,
    TrendingUpIcon,
    ZapIcon,
} from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useMemo, useState } from 'react';
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

interface PRDVersion {
    id: number;
    project_id: number;
    prd_content: string;
    version_number: number;
    is_base_version: boolean;
    user_prompt: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    project?: Project;
    prdVersions: PRDVersion[];
    featuresMarkdown?: string;
    isGenerating?: boolean;
    sections?: Sections;
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
                        placeholder="Ask me to improve or modify the PRD..."
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

    // Handle double square brackets
    cleaned = cleaned.replace(/(\w+)\s*\[\[([^\]]*)\]\]/g, (match, nodeId, content) => {
        const fixedContent = content
            .replace(/[()[\]{}"';]/g, '') // Remove problematic symbols
            .replace(/\s+/g, ' ')
            .trim();
        return `${nodeId}[${fixedContent || 'Unnamed'}]`;
    });

    // Handle single square brackets
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

    // Collect defined nodes
    const lines = cleaned.split('\n');
    const newLines: string[] = [];
    const seenNodes = new Set<string>();
    const subgraphs = new Set<string>();

    // First pass: Collect defined nodes and subgraphs
    for (const line of lines) {
        const nodeMatch = line.match(/^(\w+)\[.*?\]/);
        if (nodeMatch) {
            seenNodes.add(nodeMatch[1]);
        }
        const subgraphMatch = line.match(/^subgraph\s+("[^"]+"|[^\s[{]+)/);
        if (subgraphMatch) {
            const subgraphName = subgraphMatch[1].replace(/"/g, '').trim();
            subgraphs.add(subgraphName);
        }
    }

    // Second pass: Process relationships and handle edge labels
    for (let line of lines) {
        // Handle relationships with edge labels (e.g., A -- Label with spaces --> B)
        const edgeLabelMatch = line.match(/(\w+)\s*--\s*([^|>~\-*\s][^|>~\-*\n]*?)\s*-->\s*(\w+)/);
        if (edgeLabelMatch) {
            const [, source, label, target] = edgeLabelMatch;
            // Wrap label in quotes and replace underscores with spaces
            const fixedLabel = `"${label.replace(/_/g, ' ').trim()}"`;
            line = `${source} -- ${fixedLabel} --> ${target}`;
        }

        // Handle invalid relationships like --> [B, C, E, G]
        const invalidRelationMatch = line.match(/(\w+)\s*-->\s*\[\s*([\w\s,]+)\s*\]/);
        if (invalidRelationMatch) {
            const sourceNode = invalidRelationMatch[1];
            const targetNodes = invalidRelationMatch[2]
                .split(',')
                .map((node) => node.trim())
                .filter((node) => node.length > 0);
            targetNodes.forEach((target) => {
                newLines.push(`${sourceNode} --> ${target}`);
            });
            continue;
        }

        newLines.push(line);
    }

    cleaned = newLines.join('\n');

    // Ensure valid subgraph closure
    cleaned = cleaned.replace(/subgraph\s+([^\s[{]+)\s*\[\s*([^\]]*?)\s*\]/g, 'subgraph $1 [$2]');

    // Replace underscores with spaces in subgraph names
    cleaned = cleaned.replace(/subgraph\s+([^\s[{]+)/g, (match, name) => {
        return `subgraph ${name.replace(/_/g, ' ')}`;
    });

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
//         const subgraphs = new Set<string>();
//         let hasSubgraph = false;
//         let openSubgraphs = 0;

//         for (const line of lines) {
//             // Check for double square brackets
//             if (line.match(/\[\[.*?\]\]/)) {
//                 return {
//                     isValid: false,
//                     error: 'Invalid syntax: Double square brackets detected (e.g., [[Label]]). Use single square brackets [Label].',
//                 };
//             }

//             // Check node definitions (e.g., A[Label])
//             const nodeMatch = line.match(/^(\w+)\[.*?\]/);
//             if (nodeMatch) {
//                 const nodeId = nodeMatch[1];
//                 if (nodeIds.has(nodeId)) {
//                     return { isValid: false, error: `Duplicate node ID: ${nodeId}` };
//                 }
//                 nodeIds.add(nodeId);
//             }

//             // Check subgraph definitions
//             const subgraphMatch = line.match(/^subgraph\s+("[^"]+"|[^\s[{]+)/);
//             if (subgraphMatch) {
//                 const subgraphName = subgraphMatch[1].replace(/"/g, '').trim();
//                 subgraphs.add(subgraphName);
//                 hasSubgraph = true;
//                 openSubgraphs++;
//             } else if (line === 'end') {
//                 openSubgraphs--;
//             }

//             // Check relationships with quoted node references (e.g., A -- "Label" --> "Node")
//             const quotedNodeMatch = line.match(/(\w+)\s*--\s*("[^"]+")\s*-->\s*("[^"]+")/);
//             if (quotedNodeMatch) {
//                 const [, source, , targetLabel] = quotedNodeMatch;
//                 const target = targetLabel.replace(/"/g, '');
//                 if (subgraphs.has(target)) {
//                     return {
//                         isValid: false,
//                         error: `Invalid reference to subgraph '${target}' as a node in a relationship. Subgraphs cannot be used as nodes.`,
//                     };
//                 }
//                 referencedNodes.add(source);
//                 referencedNodes.add(target);
//             }

//             // Check valid relationships (e.g., A --> B)
//             const simpleRelationMatch = line.match(/(\w+)\s*-->\s*(\w+)/);
//             if (simpleRelationMatch) {
//                 const [, source, target] = simpleRelationMatch;
//                 referencedNodes.add(source);
//                 referencedNodes.add(target);
//             }

//             // Check relationships with edge labels (e.g., A -- Label with spaces --> B)
//             const edgeLabelMatch = line.match(/(\w+)\s*--\s*([^|>~\-*\s"][^|>~\-*\n]*?)\s*-->\s*(\w+)/);
//             if (edgeLabelMatch) {
//                 const [, source, label, target] = edgeLabelMatch;
//                 referencedNodes.add(source);
//                 referencedNodes.add(target);
//                 if (nodeIds.has(label.split(' ')[0])) {
//                     return {
//                         isValid: false,
//                         error: `Edge label '${label}' conflicts with an existing node ID '${label.split(' ')[0]}'. Wrap the label in quotes, e.g., "${label}".`,
//                     };
//                 }
//                 if (!label.match(/^".*"$/)) {
//                     return {
//                         isValid: false,
//                         error: `Invalid edge label '${label}' contains spaces and is not quoted. Wrap the label in quotes, e.g., "${label}".`,
//                     };
//                 }
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
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const getInitials = useInitials();
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
        if (project?.c4) done++;
        if (sections?.non_functional_requirements) done++;
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

    const navGroups: NavGroup[] = project
        ? [
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
                          active: true,
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
          ]
        : [];

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
            // Create a form to submit the Mermaid content to the preview route
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/projects/${project?.id}/prd/preview-mermaid`;
            form.target = '_blank';

            // Add CSRF token
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

            // Add content
            const contentInput = document.createElement('input');
            contentInput.type = 'hidden';
            contentInput.name = 'content';
            contentInput.value = children;
            form.appendChild(contentInput);

            // Add title
            const titleInput = document.createElement('input');
            titleInput.type = 'hidden';
            titleInput.name = 'title';
            titleInput.value = 'PRD Mermaid Diagram';
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
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={openPreviewInNewTab} className="h-8 text-xs">
                            <EyeIcon className="mr-1 h-3 w-3" />
                            Preview in New Tab
                        </Button>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                    <EyeIcon className="mr-1 h-3 w-3" />
                                    Quick Preview
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
    const handleContentUpdate = async () => {
        if (!editedContent.trim()) return;

        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                document.querySelector('meta[name="_token"]')?.getAttribute('content') ||
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

            const response = await fetch(`/projects/${project?.id}/prd/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    prd_content: editedContent,
                }),
            });

            if (response.ok) {
                window.location.reload();
                return;
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Failed to update PRD');
            }
        } catch (error) {
            console.error('Error updating PRD:', error);
        }
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
                        <aside
                            className={`${isSidebarCollapsed ? 'w-0' : 'w-60'} hidden shrink-0 border-r transition-all duration-300 lg:block`}
                        >
                            <div
                                className={`sticky top-0 flex h-screen flex-col justify-between py-8 pr-6 pl-4 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                            >
                                <div className="overflow-y-auto scrollbar-hide">
                                    {/* Logo/Brand */}
                                <div className="mb-6 border-b pb-4">
                                    <a href="/" className="flex items-center text-lg font-bold text-foreground transition-opacity hover:opacity-80">
                                        Sirius
                                    </a>
                                </div>

                                    <div className="mb-6">
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
                                                        {Math.max(1, Math.ceil(currentVersion.prd_content.trim().split(/\s+/).filter(Boolean).length / 200))} min
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
                                                        Note: To edit features (name, summary, criteria, etc.), go to each feature's page. The PRD
                                                        page is not for editing features directly.
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
                                                                        return <MermaidDiagram>{String(children).replace(/\n$/, '')}</MermaidDiagram>;
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
                                                    <div className="mt-8 border-t border-border pt-8 px-6">
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
                                        <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">No PRD Available</h3>
                                        <p className="text-slate-600 dark:text-white/70">Start a conversation to generate your first PRD.</p>
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
                                                            code({ node, inline, className, children, ...props }) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                const isMermaid = match && match[1] === 'mermaid';

                                                                if (isMermaid && !inline) {
                                                                    return <MermaidDiagram>{String(children).replace(/\n$/, '')}</MermaidDiagram>;
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
                                                  <div className="mt-8 border-t border-border pt-8 px-6">
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
        </>
    );
}
