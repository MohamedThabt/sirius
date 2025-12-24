import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

/**
 * Converts escaped newlines in Mermaid code to actual newlines.
 * WHY: Mermaid code from backend may have escaped characters that need conversion.
 */
function convertEscapedMermaid(code: string): string {
    let cleaned = code.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/^[\s\n]+|[\s\n]+$/g, '');
    return cleaned;
}

interface MermaidCodeProps {
    children: string;
    id?: string;
}

/**
 * Renders Mermaid code with a copy button.
 * WHY: Extracted from Specs.tsx to prevent re-creation on every render
 * and enable reuse across pages that display Mermaid diagrams.
 */
export function MermaidCode({ children, id }: MermaidCodeProps) {
    const [copied, setCopied] = useState(false);

    const copyCode = useCallback(async () => {
        try {
            const cleanCode = convertEscapedMermaid(children);
            await navigator.clipboard.writeText(cleanCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    }, [children]);

    return (
        <div className="my-4" id={id}>
            <div className="mb-3 flex items-center justify-end">
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

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <pre className="text-sm text-slate-700 dark:text-slate-300">
                    <code>{convertEscapedMermaid(children)}</code>
                </pre>
            </div>
        </div>
    );
}
