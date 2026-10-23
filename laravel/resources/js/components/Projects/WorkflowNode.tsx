import { cn } from '@/lib/utils';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Loader2, Lock as LockIcon } from 'lucide-react';
import { memo } from 'react';

interface FeatureItem {
    id: number;
    name: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
}

interface ModuleItem {
    id: number;
    name: string;
    description: string;
    status: 'planned' | 'in_progress' | 'completed';
    order_of_implementation: number;
    metrics?: string | null;
    erd?: string | null;
}

interface WorkflowNodeData {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColorClass?: string;
    iconBgClass?: string;
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    isHardLocked: boolean;
    isLoading?: boolean;
    isOutOfSync?: boolean;
    onClick: () => void;
    prerequisiteMessage?: string;
    progress?: number;
    features?: FeatureItem[];
    modules?: ModuleItem[];
    isExpandable?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    inputHandlePosition?: Position;
    outputHandlePosition?: Position;
    showInputHandle?: boolean;
    showOutputHandle?: boolean;
    inputHandleId?: string;
    outputHandleId?: string;
    secondaryOutputHandlePosition?: Position;
    secondaryOutputHandleId?: string;
    showSecondaryOutputHandle?: boolean;
    currentBadgeLabel?: string;
    /** Stage colour (hex) used for the icon tile, ring and handles, n8n-style. */
    accent?: string;
}

type WorkflowNodeProps = NodeProps<WorkflowNodeData>;

const WorkflowNode = memo(({ data, selected }: WorkflowNodeProps) => {
    const {
        title,
        description,
        icon: Icon,
        isCompleted,
        isCurrent,
        isLocked,
        isHardLocked,
        isLoading = false,
        isOutOfSync = false,
        onClick,
        prerequisiteMessage,
        progress,
        features,
        modules,
        isExpandable,
        isExpanded = false,
        onToggleExpand,
        inputHandlePosition = Position.Left,
        outputHandlePosition = Position.Right,
        showInputHandle = true,
        showOutputHandle = true,
        inputHandleId,
        outputHandleId,
        secondaryOutputHandlePosition = Position.Right,
        secondaryOutputHandleId,
        showSecondaryOutputHandle = false,
        currentBadgeLabel = 'Start',
        accent = '#a8a29e',
    } = data;

    const isClickable = !isHardLocked;

    const dimmed = isLocked || isHardLocked;
    const handleClass = '!h-3 !w-3 !rounded-full !border-2 !bg-card transition-transform duration-200 group-hover:!scale-125';
    const handleStyle = { borderColor: dimmed ? 'var(--border)' : accent };

    return (
        <div
            className={cn(
                'group relative w-[260px] rounded-2xl border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out',
                isClickable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
                !isClickable && 'cursor-not-allowed opacity-50',
            )}
            style={{
                borderColor: selected || isCurrent ? accent : dimmed ? 'var(--border)' : `color-mix(in srgb, ${accent} 30%, var(--border))`,
                boxShadow: selected ? `0 0 0 3px color-mix(in srgb, ${accent} 22%, transparent)` : undefined,
            }}
            onClick={isClickable ? onClick : undefined}
        >
            {showInputHandle && (
                <Handle id={inputHandleId} type="target" position={inputHandlePosition} className={handleClass} style={handleStyle} />
            )}

            {/* n8n-style status badge */}
            {(isCompleted || isLoading) && (
                <span
                    className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card text-white shadow-sm"
                    style={{ background: isCompleted ? '#10b981' : accent }}
                >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
            )}

            <div className="flex gap-3 p-3.5">
                {/* Coloured icon tile */}
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                    style={
                        dimmed
                            ? { background: 'var(--muted)', borderColor: 'var(--border)' }
                            : {
                                  background: `color-mix(in srgb, ${accent} 14%, var(--card))`,
                                  borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
                                  color: accent,
                              }
                    }
                >
                    {dimmed ? <LockIcon className="h-4 w-4 text-muted-foreground" /> : <Icon className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[13px] font-semibold tracking-tight text-card-foreground">{title}</h3>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-[1.45] text-muted-foreground">{description}</p>

                    {typeof progress === 'number' && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%`, background: accent }}
                                />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{progress}%</span>
                        </div>
                    )}

                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase">
                        {isLoading ? (
                            <span className="text-muted-foreground">Generating…</span>
                        ) : isCompleted ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Done</span>
                        ) : isCurrent ? (
                            <>
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} />
                                <span style={{ color: accent }}>{currentBadgeLabel}</span>
                            </>
                        ) : dimmed ? (
                            <span className="text-muted-foreground">Locked</span>
                        ) : (
                            <span className="text-muted-foreground">Ready</span>
                        )}
                    </div>

                    {isOutOfSync && (
                        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1">
                            <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
                            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Out of sync</span>
                        </div>
                    )}

                    {dimmed && prerequisiteMessage && (
                        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{prerequisiteMessage}</p>
                    )}
                </div>
            </div>

            {isExpandable && ((features && features.length > 0) || (modules && modules.length > 0)) && (
                <div className="border-t border-border px-3.5 py-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleExpand) onToggleExpand();
                        }}
                        className="nodrag flex w-full items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase transition-opacity hover:opacity-80"
                        style={{ color: accent }}
                    >
                        <span>{features && features.length > 0 ? `${features.length} features` : `${modules?.length} modules`}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                </div>
            )}

            {showOutputHandle && (
                <Handle id={outputHandleId} type="source" position={outputHandlePosition} className={handleClass} style={handleStyle} />
            )}
            {showSecondaryOutputHandle && (
                <Handle
                    id={secondaryOutputHandleId}
                    type="source"
                    position={secondaryOutputHandlePosition}
                    className={handleClass}
                    style={handleStyle}
                />
            )}
        </div>
    );
});

WorkflowNode.displayName = 'WorkflowNode';

export default WorkflowNode;
