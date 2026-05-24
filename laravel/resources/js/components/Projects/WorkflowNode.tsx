import { cn } from '@/lib/utils';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, Lock as LockIcon } from 'lucide-react';
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
}

type WorkflowNodeProps = NodeProps<WorkflowNodeData>;

const WorkflowNode = memo(({ data, selected }: WorkflowNodeProps) => {
    const {
        title,
        description,
        icon: Icon,
        iconColorClass,
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
    } = data;

    const isClickable = !isHardLocked;

    const getAccentColor = () => {
        if (isLoading) return 'text-primary';
        if (isCompleted) return 'text-emerald-600 dark:text-emerald-400';
        if (isCurrent) return iconColorClass || 'text-primary';
        if (isLocked || isHardLocked) return 'text-muted-foreground/30';
        return 'text-muted-foreground/50';
    };

    const getAccentBarColor = () => {
        if (isCompleted) return 'bg-emerald-500/40';
        if (isCurrent && !isLoading) return 'bg-primary/30';
        if (isLoading) return 'bg-primary/20';
        return 'bg-transparent';
    };

    return (
        <div
            className={cn(
                'group relative w-[260px] overflow-hidden rounded-[22px] border transition-all duration-200 ease-out',
                'bg-card',
                isCompleted && 'border-border/50',
                isCurrent && !isCompleted && 'border-border/70',
                !isCompleted && !isCurrent && 'border-border/40',
                isClickable && 'cursor-pointer hover:-translate-y-0.5 hover:border-border/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]',
                !isClickable && 'cursor-not-allowed opacity-45',
                selected && 'ring-1 ring-primary/30 ring-offset-2 ring-offset-transparent',
            )}
            onClick={isClickable ? onClick : undefined}
        >
            {/* Subtle left accent bar */}
            <div className={cn('absolute top-0 left-0 h-full w-[3px] rounded-l-[22px] transition-colors duration-300', getAccentBarColor())} />

            {showInputHandle && (
                <Handle
                    id={inputHandleId}
                    type="target"
                    position={inputHandlePosition}
                    className="!h-2 !w-2 !rounded-full !border-0 !bg-border/40 transition-all duration-200 group-hover:!scale-125 group-hover:!bg-primary/60"
                />
            )}

            <div className="space-y-2.5 py-4 pr-4 pl-5">
                {/* Icon + Title row */}
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-all duration-200',
                            isCompleted && 'bg-emerald-500/8',
                            isCurrent && !isCompleted && 'bg-primary/8',
                            isLoading && 'bg-primary/8',
                            (isLocked || isHardLocked) && 'bg-muted/20',
                            !isCompleted && !isCurrent && !isLoading && !isLocked && !isHardLocked && 'bg-muted/30',
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary/70" />
                        ) : isHardLocked || isLocked ? (
                            <LockIcon className="h-3.5 w-3.5 text-muted-foreground/30" />
                        ) : (
                            <Icon className={cn('h-3.5 w-3.5 transition-colors', getAccentColor())} />
                        )}
                    </div>
                    <h3 className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight text-card-foreground/90">{title}</h3>
                </div>

                {/* Description */}
                <p className="line-clamp-2 text-[11px] leading-[1.5] text-muted-foreground/70">{description}</p>

                {/* Progress bar */}
                {typeof progress === 'number' && (
                    <div className="flex items-center gap-2.5">
                        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/30">
                            <div
                                className="h-full rounded-full bg-foreground/20 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">{progress}%</span>
                    </div>
                )}

                {/* Status indicator */}
                <div className="flex items-center justify-between pt-0.5">
                    <div
                        className={cn(
                            'inline-flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase transition-all duration-200',
                            isLoading && 'text-muted-foreground/60',
                            isCompleted && 'text-emerald-600/70 dark:text-emerald-400/70',
                            isCurrent && !isCompleted && !isLoading && 'text-primary/70',
                            (isLocked || isHardLocked) && 'text-muted-foreground/30',
                            !isCompleted && !isCurrent && !isLoading && !isLocked && !isHardLocked && 'text-muted-foreground/40',
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                <span>Generating</span>
                            </>
                        ) : isCompleted ? (
                            <>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                                <span>Done</span>
                            </>
                        ) : isCurrent ? (
                            <>
                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50" />
                                <span>{currentBadgeLabel}</span>
                            </>
                        ) : isLocked || isHardLocked ? (
                            <LockIcon className="h-2.5 w-2.5" />
                        ) : (
                            <>
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                                <span>Ready</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Out of sync warning */}
                {isOutOfSync && (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-500/8 px-2.5 py-1.5">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500/70" />
                        <span className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/70">Out of sync</span>
                    </div>
                )}

                {/* Prerequisite message */}
                {(isHardLocked || isLocked) && prerequisiteMessage && (
                    <p className="text-[10px] leading-relaxed text-muted-foreground/40">{prerequisiteMessage}</p>
                )}
            </div>

            {/* Expandable footer */}
            {isExpandable && ((features && features.length > 0) || (modules && modules.length > 0)) && (
                <div className="border-t border-border/20 px-5 py-2.5">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleExpand) onToggleExpand();
                        }}
                        className="nodrag flex w-full items-center justify-center gap-1.5 text-[10px] font-medium tracking-wide text-muted-foreground/50 uppercase transition-colors hover:text-muted-foreground/80"
                    >
                        <span>{features && features.length > 0 ? `${features.length} features` : `${modules?.length} modules`}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                </div>
            )}

            {showOutputHandle && (
                <Handle
                    id={outputHandleId}
                    type="source"
                    position={outputHandlePosition}
                    className="!h-2 !w-2 !rounded-full !border-0 !bg-border/40 transition-all duration-200 group-hover:!scale-125 group-hover:!bg-primary/60"
                />
            )}
            {showSecondaryOutputHandle && (
                <Handle
                    id={secondaryOutputHandleId}
                    type="source"
                    position={secondaryOutputHandlePosition}
                    className="!h-2 !w-2 !rounded-full !border-0 !bg-border/40 transition-all duration-200 group-hover:!scale-125 group-hover:!bg-primary/60"
                />
            )}
        </div>
    );
});

WorkflowNode.displayName = 'WorkflowNode';

export default WorkflowNode;
