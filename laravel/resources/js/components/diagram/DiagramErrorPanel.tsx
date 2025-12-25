import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface DiagramErrorPanelProps {
    /** The error message to display */
    error: string;
    /** Callback when user clicks "Fix with AI" - receives a pre-formatted prompt */
    onFixRequest: (errorPrompt: string) => void;
    /** Custom title for the error panel */
    title?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * DiagramErrorPanel Component
 *
 * A reusable error display panel for diagram pages that includes a "Fix with AI" button.
 * When clicked, it pre-populates the AI prompt with the error context to help users
 * quickly regenerate and fix diagram syntax errors.
 *
 * Usage:
 * ```tsx
 * <DiagramErrorPanel
 *     error={parseError}
 *     onFixRequest={(prompt) => {
 *         setPrompt(prompt);
 *         handleGenerate();
 *     }}
 * />
 * ```
 */
export function DiagramErrorPanel({
    error,
    onFixRequest,
    title = 'Parse Error',
    className,
}: DiagramErrorPanelProps) {
    const handleFix = () => {
        const fixPrompt = `Fix the following syntax error in the diagram:\n\n${error}`;
        onFixRequest(fixPrompt);
    };

    return (
        <div
            className={cn(
                'rounded-lg border-l-4 border-destructive bg-destructive/10 p-4',
                className
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <div>
                        <p className="font-medium text-destructive-foreground">
                            {title}
                        </p>
                        <p className="mt-1 text-sm text-destructive-foreground/80">
                            {error}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFix}
                    className="shrink-0 border-destructive/50 text-destructive-foreground hover:bg-destructive/20"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Fix with AI
                </Button>
            </div>
        </div>
    );
}
