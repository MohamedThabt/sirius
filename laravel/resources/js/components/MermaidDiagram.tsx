import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { convertEscapedMermaid, validateMermaidSyntax, parseMermaidError } from '@/utils/mermaid';
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
    const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
    const [showCode, setShowCode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const renderDiagram = async () => {
            const tempId = `mermaid-temp-${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
            let tempContainer: HTMLDivElement | null = null;

            try {
                setError('');
                setValidationWarnings([]);
                const cleanChildren = convertEscapedMermaid(children);

                // Ensure mermaid is configured to suppress error rendering
                const isDarkMode = document.documentElement.classList.contains('dark');
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'dark',
                    securityLevel: 'loose',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    suppressErrorRendering: true,
                });

                // Pre-validate syntax
                const validation = validateMermaidSyntax(cleanChildren);
                if (!validation.valid) {
                    setError(validation.errors.join('\n'));
                    return;
                }
                if (validation.warnings.length > 0) {
                    setValidationWarnings(validation.warnings);
                }

                // Parse first to validate syntax without rendering (prevents error display)
                await mermaid.parse(cleanChildren);

                // Create a hidden container to render into (prevents mermaid error from showing)
                tempContainer = document.createElement('div');
                tempContainer.id = tempId;
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                tempContainer.style.visibility = 'hidden';
                document.body.appendChild(tempContainer);

                const { svg: renderedSvg } = await mermaid.render(tempId, cleanChildren);
                setSvg(renderedSvg);
            } catch (err) {
                console.error('[MermaidDiagram] Rendering error:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
                setError(parseMermaidError(errorMessage));
            } finally {
                // Clean up temp container and any mermaid error elements
                if (tempContainer && tempContainer.parentNode) {
                    tempContainer.parentNode.removeChild(tempContainer);
                }
                // Also clean up any orphaned mermaid error elements
                const errorElement = document.getElementById(`d${tempId}`);
                if (errorElement && errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
                // Clean up mermaid's error rendering (bomb icon with error text)
                document.querySelectorAll('[id^="mermaid-temp-"]').forEach(el => el.remove());
                document.querySelectorAll('.mermaid-error, .error-icon, [id*="mermaid"][id*="error"]').forEach(el => el.remove());
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

    // Error state - gracefully show code and error details
    if (error) {
        const cleanedCode = convertEscapedMermaid(children);

        // Log error for debugging
        console.warn('[MermaidDiagram] Rendering failed, showing code fallback:', error);

        return (
            <div className="my-4">
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Diagram Code</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyCode}
                        className="h-6 text-xs"
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
                                Copy
                            </>
                        )}
                    </Button>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <pre className="overflow-x-auto text-sm text-slate-700 dark:text-slate-300">
                        <code>{cleanedCode}</code>
                    </pre>
                </div>
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

            {/* Validation Warnings */}
            {validationWarnings.length > 0 && (
                <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                        ⚠️ Diagram Warnings
                    </p>
                    <ul className="mt-1 list-inside list-disc text-xs text-yellow-600 dark:text-yellow-500">
                        {validationWarnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

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
