import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { convertEscapedMermaid } from '@/utils/mermaid';
import { CheckIcon, CodeIcon, CopyIcon, EyeIcon } from 'lucide-react';
import mermaid from 'mermaid';
import { memo, useEffect, useState } from 'react';

/**
 * MermaidDiagram Component
 *
 * WHY: This component was duplicated (with ~200 lines each) in:
 * - PRD.tsx
 * - SystemOverview.tsx
 *
 * This extraction provides:
 * 1. Single source of truth for Mermaid rendering
 * 2. Built-in error handling with debugging info
 * 3. Code preview toggle
 * 4. Copy to clipboard functionality
 * 5. Modal preview for larger diagrams
 * 6. Optional preview in new tab
 *
 * The component is memoized to prevent unnecessary re-renders when the
 * parent's other state changes.
 */

interface MermaidDiagramProps {
    /** Raw Mermaid content (may include escaped characters) */
    children: string;
    /** Optional project ID for preview-in-new-tab feature */
    projectId?: number;
    /** Optional title for new tab preview */
    previewTitle?: string;
}

function MermaidDiagramComponent({
    children,
    projectId,
    previewTitle = 'Mermaid Diagram',
}: MermaidDiagramProps) {
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

                const { svg: renderedSvg } = await mermaid.render(
                    `mermaid-${Date.now()}`,
                    cleanChildren
                );
                setSvg(renderedSvg);
            } catch (err) {
                console.error('[MermaidDiagram] Rendering error:', err);
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
            console.error('[MermaidDiagram] Failed to copy code:', err);
        }
    };

    const openPreviewInNewTab = () => {
        if (!projectId) return;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/projects/${projectId}/system-overview/preview-mermaid`;
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
        titleInput.value = previewTitle;
        form.appendChild(titleInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    // Error state
    if (error) {
        const cleanedCode = convertEscapedMermaid(children);
        const wasModified = children !== cleanedCode;

        return (
            <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="mb-2">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        <strong>Mermaid Diagram Error</strong>
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
                <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-red-500 hover:underline dark:text-red-400">
                        Show debugging info
                    </summary>
                    <div className="mt-2 space-y-2">
                        <div>
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                Raw code:
                            </p>
                            <pre className="overflow-x-auto rounded bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                {children}
                            </pre>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                Cleaned code:
                            </p>
                            <pre className="overflow-x-auto rounded bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                {cleanedCode}
                            </pre>
                            {wasModified && (
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

    // Loading state
    if (!svg) {
        return (
            <div className="my-4 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-800">
                <TextShimmer className="text-sm text-slate-500 dark:text-slate-400">
                    Rendering diagram...
                </TextShimmer>
            </div>
        );
    }

    // Success state
    return (
        <div className="my-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCode(!showCode)}
                        className="h-8 text-xs"
                    >
                        <CodeIcon className="mr-1 h-3 w-3" />
                        {showCode ? 'Show Diagram' : 'Show Code'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyCode}
                        className="h-8 text-xs"
                        aria-live="polite"
                    >
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
                    {projectId && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openPreviewInNewTab}
                            className="h-8 text-xs"
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            Preview in New Tab
                        </Button>
                    )}
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
}

/**
 * Memoized MermaidDiagram component
 *
 * WHY memoize: Prevents re-rendering when parent state changes (e.g., chat messages,
 * version selection) which would cause the Mermaid diagram to re-render unnecessarily.
 */
export const MermaidDiagram = memo(MermaidDiagramComponent);
