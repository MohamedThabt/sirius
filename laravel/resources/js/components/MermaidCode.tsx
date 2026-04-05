import { Button } from '@/components/ui/button';
import { CheckIcon, CodeIcon, CopyIcon, EyeIcon, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

/**
 * Cleans and normalizes Mermaid code for rendering.
 * WHY: Mermaid code from markdown/backend may have escaped characters, 
 * markdown fences, or extra tags that need to be stripped.
 */
function normalizeMermaidCode(code: string): string {
    let cleaned = code;
    
    // Remove markdown code fences if present
    cleaned = cleaned.replace(/^```mermaid\s*/gi, '');
    cleaned = cleaned.replace(/^```\s*/gm, '');
    cleaned = cleaned.replace(/```\s*$/g, '');
    
    // Remove any XML/HTML-like tags that might be wrapping the content
    cleaned = cleaned.replace(/<\/?[A-Z][A-Z0-9]*>/gi, '');
    
    // Convert escaped newlines to actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    // Fix Windows newlines
    cleaned = cleaned.replace(/\r\n/g, '\n');
    
    // Remove extra empty lines (more than 2 consecutive)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
}

interface MermaidCodeProps {
    children: string;
    id?: string;
}

/**
 * Renders Mermaid diagrams with a toggle to show raw code.
 * WHY: Extracted from Specs.tsx for reuse and to properly render Mermaid diagrams.
 */
export function MermaidCode({ children, id }: MermaidCodeProps) {
    const [copied, setCopied] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const cleanCode = normalizeMermaidCode(children);

    const copyCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(cleanCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    }, [cleanCode]);

    useEffect(() => {
        if (showCode) return;

        let cancelled = false;

        const renderMermaid = async () => {
            setIsRendering(true);
            setError(null);
            setSvgContent(null);

            try {
                // Dynamically import mermaid to avoid SSR issues
                const mermaid = (await import('mermaid')).default;
                
                if (cancelled) return;

                // Initialize mermaid with theme settings
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'dark',
                    securityLevel: 'loose',
                    fontFamily: 'inherit',
                    suppressErrorRendering: true,
                });

                // Generate unique ID for this diagram (alphanumeric only to avoid CSS selector issues)
                const uniqueId = id || `mermaid${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
                
                // Parse to validate syntax first
                await mermaid.parse(cleanCode);
                
                // Render the diagram
                const { svg } = await mermaid.render(uniqueId, cleanCode);
                
                if (cancelled) return;
                
                setSvgContent(svg);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to render diagram');
                }
            } finally {
                if (!cancelled) {
                    setIsRendering(false);
                }
            }
        };

        renderMermaid();

        return () => {
            cancelled = true;
        };
    }, [cleanCode, id, showCode]);

    return (
        <div className="my-4 rounded-lg border border-border/60 bg-card/50 overflow-hidden">
            {/* Header with controls */}
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">Mermaid Diagram</span>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowCode(!showCode)} 
                        className="h-7 text-xs gap-1.5"
                    >
                        {showCode ? (
                            <>
                                <EyeIcon className="h-3 w-3" />
                                Preview
                            </>
                        ) : (
                            <>
                                <CodeIcon className="h-3 w-3" />
                                Code
                            </>
                        )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyCode} className="h-7 text-xs gap-1.5" aria-live="polite">
                        {copied ? (
                            <>
                                <CheckIcon className="h-3 w-3 text-emerald-600" />
                                Copied
                            </>
                        ) : (
                            <>
                                <CopyIcon className="h-3 w-3" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Content area */}
            <div className="p-4">
                {showCode ? (
                    <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-sm text-foreground">
                        <code>{cleanCode}</code>
                    </pre>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-sm text-destructive mb-2">Failed to render diagram</p>
                        <p className="text-xs text-muted-foreground max-w-md">{error}</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowCode(true)} 
                            className="mt-4"
                        >
                            View Raw Code
                        </Button>
                    </div>
                ) : isRendering || !svgContent ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Rendering diagram...</span>
                    </div>
                ) : (
                    <div 
                        className="flex justify-center overflow-x-auto [&_svg]:max-w-full"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                )}
            </div>
        </div>
    );
}

