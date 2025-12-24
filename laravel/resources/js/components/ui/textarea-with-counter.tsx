import { Label } from '@/components/ui/label';

interface TextareaWithCounterProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    hint?: string;
    maxLength?: number;
    rows?: number;
    className?: string;
}

/**
 * Reusable textarea component with character counter and accessibility support.
 * Extracted from Prepare.tsx where this pattern was repeated 6+ times.
 * 
 * WHY: Each textarea in Prepare.tsx was ~25 lines of identical JSX with:
 * - Label
 * - Textarea with consistent styling
 * - Hint text
 * - Character counter with aria-live
 * 
 * This reduces ~150 lines to simple component usage.
 */
export function TextareaWithCounter({
    id,
    value,
    onChange,
    placeholder = '',
    label,
    hint,
    maxLength = 2000,
    rows = 4,
    className = '',
}: TextareaWithCounterProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <Label htmlFor={id} className="text-sm">
                    {label}
                </Label>
            )}
            <textarea
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                rows={rows}
                maxLength={maxLength}
                aria-describedby={`${id}-hint ${id}-counter`}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                {hint && <span id={`${id}-hint`}>{hint}</span>}
                <span id={`${id}-counter`} aria-live="polite">
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}

export default TextareaWithCounter;
