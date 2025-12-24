import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';

interface ContentCardProps {
    title: string;
    field: string;
    icon: React.ComponentType<{ className?: string }>;
    placeholder: string;
    value: string;
    onEdit: (field: string) => void;
    className?: string;
}

/**
 * WHY: Extracted from ModuleShow.tsx to prevent re-creation on each render.
 * When defined inline in a component, this function component is recreated
 * on every parent render, causing unnecessary re-renders of all its children.
 */
export function ContentCard({
    title,
    field,
    icon: Icon,
    placeholder,
    value,
    onEdit,
    className = '',
}: ContentCardProps) {
    return (
        <div
            className={`group relative rounded-xl border border-border/40 bg-card/50 p-6 transition-all hover:border-border/80 hover:bg-card hover:shadow-sm ${className}`}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(field)} 
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <PencilIcon className="mr-2 h-3.5 w-3.5" />
                    Edit
                </Button>
            </div>
            {value ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                    {value}
                </div>
            ) : (
                <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-8 text-center transition-colors hover:bg-muted/50"
                    onClick={() => onEdit(field)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onEdit(field)}
                >
                    <p className="text-sm text-muted-foreground">{placeholder}</p>
                    <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-primary">
                        Add {title}
                    </Button>
                </div>
            )}
        </div>
    );
}
