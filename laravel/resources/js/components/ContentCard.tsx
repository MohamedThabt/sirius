import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentCardProps {
    title: string;
    field: string;
    icon: React.ComponentType<{ className?: string }>;
    placeholder: string;
    value: string;
    onEdit: (field: string) => void;
    className?: string;
    /** If true, render value as markdown. Defaults to true. */
    renderMarkdown?: boolean;
    /** Max height before content is collapsed, in pixels. Defaults to 200. */
    maxCollapsedHeight?: number;
}

/**
 * WHY: Extracted from ModuleShow.tsx to prevent re-creation on each render.
 * When defined inline in a component, this function component is recreated
 * on every parent render, causing unnecessary re-renders of all its children.
 *
 * Now supports markdown rendering and collapsible content for long text.
 */
export function ContentCard({
    title,
    field,
    icon: Icon,
    placeholder,
    value,
    onEdit,
    className = '',
    renderMarkdown = true,
    maxCollapsedHeight = 200,
}: ContentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if content is likely to be long (simple heuristic: more than 300 chars or 5 newlines)
    const isLongContent = value && (value.length > 300 || (value.match(/\n/g) || []).length > 5);

    return (
        <div
            className={`group relative rounded-lg border border-border/40 bg-card/50 p-5 transition-colors hover:border-border/60 hover:bg-card ${className}`}
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">{title}</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(field)}
                    className="h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <PencilIcon className="h-3 w-3" />
                </Button>
            </div>
            {value ? (
                <div className="relative">
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${!isExpanded && isLongContent ? '' : ''}`}
                        style={{ maxHeight: !isExpanded && isLongContent ? `${maxCollapsedHeight}px` : 'none' }}
                    >
                        {renderMarkdown ? (
                            <div className="prose prose-sm dark:prose-invert prose-headings:text-foreground prose-headings:font-medium prose-headings:text-sm prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none max-w-none text-muted-foreground">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{value}</div>
                        )}
                    </div>

                    {/* Gradient overlay and expand button for long content */}
                    {isLongContent && !isExpanded && (
                        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-card/90 to-transparent" />
                    )}

                    {isLongContent && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 h-7 w-full text-xs text-muted-foreground hover:text-foreground"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUpIcon className="mr-1 h-3 w-3" />
                                    Show less
                                </>
                            ) : (
                                <>
                                    <ChevronDownIcon className="mr-1 h-3 w-3" />
                                    Show more
                                </>
                            )}
                        </Button>
                    )}
                </div>
            ) : (
                <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded border border-dashed border-border/40 py-6 text-center transition-colors hover:border-border/60 hover:bg-muted/30"
                    onClick={() => onEdit(field)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onEdit(field)}
                >
                    <p className="text-xs text-muted-foreground">{placeholder}</p>
                </div>
            )}
        </div>
    );
}
