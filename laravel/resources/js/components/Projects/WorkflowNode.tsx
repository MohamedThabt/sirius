import { cn } from '@/lib/utils';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { CheckIcon, ChevronDown, ChevronUp, Loader2, Lock as LockIcon, AlertTriangle } from 'lucide-react';
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

    // Status-based accent color using system design tokens
    const getAccentColor = () => {
        if (isLoading) return 'text-primary';
        if (isCompleted) return 'text-emerald-500';
        if (isCurrent) return iconColorClass || 'text-primary';
        if (isLocked || isHardLocked) return 'text-muted-foreground/40';
        return 'text-muted-foreground/60';
    };

    return (
        <div
            className={cn(
                // Base styles - uses system card colors
                'group relative w-[220px] rounded-xl border transition-all duration-200 ease-out',
                // Card background - matches system card color
                'bg-card/95 backdrop-blur-sm',
                // Border color based on state - using system colors
                isCompleted && 'border-emerald-500/40',
                isCurrent && !isCompleted && 'border-primary/50',
                isLoading && 'border-primary/40',
                (isLocked || isHardLocked) && 'border-border/40',
                !isCompleted && !isCurrent && !isLoading && !isLocked && !isHardLocked && 'border-border/60',
                // Interaction states
                isClickable && 'cursor-pointer hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5',
                !isClickable && 'cursor-not-allowed opacity-50',
                // Selected state
                selected && 'ring-2 ring-primary/60 ring-offset-2 ring-offset-transparent',
            )}
            onClick={isClickable ? onClick : undefined}
        >
            {/* Input Handle - uses system primary color */}
            {showInputHandle && (
                <Handle
                    id={inputHandleId}
                    type="target"
                    position={inputHandlePosition}
                    className="!h-2 !w-2 !rounded-full !border-0 !bg-border transition-all duration-200 group-hover:!bg-primary group-hover:!scale-125"
                />
            )}

            {/* Main content container */}
            <div className="p-4 space-y-3">
                {/* Header row - Icon + Title + Status */}
                <div className="flex items-start justify-between gap-3">
                    {/* Icon with system-matched background */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                            className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                                // Background using system accent/muted colors
                                isCompleted && 'bg-emerald-500/15',
                                isCurrent && !isCompleted && 'bg-primary/15',
                                isLoading && 'bg-primary/15',
                                (isLocked || isHardLocked) && 'bg-muted/30',
                                !isCompleted && !isCurrent && !isLoading && !isLocked && !isHardLocked && 'bg-muted/50',
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : isHardLocked || isLocked ? (
                                <LockIcon className="h-4 w-4 text-muted-foreground/50" />
                            ) : (
                                <Icon className={cn('h-4 w-4 transition-colors', getAccentColor())} />
                            )}
                        </div>
                        {/* Title using system foreground color */}
                        <h3 className="text-sm font-semibold tracking-tight text-card-foreground truncate">
                            {title}
                        </h3>
                    </div>

                    {/* Status indicator - minimal dot */}
                    <div
                        className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-200',
                            isLoading && 'bg-primary/20',
                            isCompleted && 'bg-emerald-500',
                            isCurrent && !isCompleted && !isLoading && 'bg-primary',
                            (isLocked || isHardLocked) && 'bg-muted/50',
                            !isCompleted && !isCurrent && !isLoading && !isLocked && !isHardLocked && 'bg-muted/40',
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                        ) : isCompleted ? (
                            <CheckIcon className="h-2.5 w-2.5 text-white" />
                        ) : isCurrent ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
                        ) : (isLocked || isHardLocked) ? (
                            <LockIcon className="h-2.5 w-2.5 text-muted-foreground/60" />
                        ) : null}
                    </div>
                </div>

                {/* Description using muted-foreground */}
                <p className="text-xs leading-relaxed text-muted-foreground/80 line-clamp-2">
                    {description}
                </p>

                {/* Progress bar using system primary */}
                {typeof progress === 'number' && (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-muted/60 overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/70 tabular-nums">
                            {progress}%
                        </span>
                    </div>
                )}

                {/* Status pill - using system colors */}
                <div className="pt-0.5">
                    <div
                        className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200',
                            isLoading && 'bg-primary/15 text-primary',
                            isCompleted && 'bg-emerald-500/15 text-emerald-500',
                            isCurrent && !isCompleted && !isLoading && 'bg-primary text-primary-foreground',
                            (isLocked || isHardLocked) && 'bg-muted/40 text-muted-foreground/60',
                            !isCompleted && !isCurrent && !isLoading && !isLocked && !isHardLocked && 'bg-muted/30 text-muted-foreground/70',
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                <span>Generating</span>
                            </>
                        ) : isCompleted ? (
                            <>
                                <CheckIcon className="h-2.5 w-2.5" />
                                <span>Completed</span>
                            </>
                        ) : isCurrent ? (
                            <span>{currentBadgeLabel}</span>
                        ) : (isLocked || isHardLocked) ? (
                            <span>Locked</span>
                        ) : (
                            <span>Ready</span>
                        )}
                    </div>
                </div>

                {/* Out of sync warning */}
                {isOutOfSync && (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span className="text-[10px] font-medium">Out of sync</span>
                    </div>
                )}

                {/* Prerequisite message */}
                {(isHardLocked || isLocked) && prerequisiteMessage && (
                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        {prerequisiteMessage}
                    </p>
                )}
            </div>

            {/* Expandable footer */}
            {isExpandable && ((features && features.length > 0) || (modules && modules.length > 0)) && (
                <div className="px-4 pb-3">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleExpand) onToggleExpand();
                        }}
                        className="nodrag flex w-full items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground/70 hover:text-card-foreground hover:bg-muted/30 transition-colors"
                    >
                        <span>
                            {features && features.length > 0
                                ? `${features.length} features`
                                : `${modules?.length} modules`}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            )}

            {/* Output Handle */}
            {showOutputHandle && (
                <Handle
                    id={outputHandleId}
                    type="source"
                    position={outputHandlePosition}
                    className="!h-2 !w-2 !rounded-full !border-0 !bg-border transition-all duration-200 group-hover:!bg-primary group-hover:!scale-125"
                />
            )}
            {showSecondaryOutputHandle && (
                <Handle
                    id={secondaryOutputHandleId}
                    type="source"
                    position={secondaryOutputHandlePosition}
                    className="!h-2 !w-2 !rounded-full !border-0 !bg-border transition-all duration-200 group-hover:!bg-primary group-hover:!scale-125"
                />
            )}
        </div>
    );
});

WorkflowNode.displayName = 'WorkflowNode';

export default WorkflowNode;
