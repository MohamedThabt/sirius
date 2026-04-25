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
export function DiagramErrorPanel({ error, onFixRequest, title = 'Parse Error', className }: DiagramErrorPanelProps) {
    const handleFix = () => {
        const fixPrompt = `Fix the following syntax error in the diagram:\n\n${error}`;
        onFixRequest(fixPrompt);
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 shadow-sm',
                className,
            )}
        >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,currentColor_10px,currentColor_11px)]" />
            </div>

            <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-500/30">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-amber-900 dark:text-amber-100">{title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-amber-800/90 dark:text-amber-200/80">{error}</p>
                    </div>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleFix}
                    className="shrink-0 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/25"
                >
                    <Sparkles className="h-4 w-4" />
                    Fix with AI
                </Button>
            </div>
        </div>
    );
}
