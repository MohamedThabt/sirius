import { Badge } from '@/components/ui/badge';
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from '@/components/ui/base-node';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { AlertCircleIcon, CheckCircleIcon, ChevronDown, ChevronUp, Loader2, Lock as LockIcon, List } from 'lucide-react';
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
}

type WorkflowNodeProps = NodeProps<WorkflowNodeData>;

const WorkflowNode = memo(({ data, selected }: WorkflowNodeProps) => {
    const {
        title,
        description,
        icon: Icon,
        iconColorClass,
        iconBgClass,
        isCompleted,
        isCurrent,
        isLocked,
        isHardLocked,
        isLoading = false,
        isOutOfSync = false,
        onClick,
        prerequisiteMessage,
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
    } = data;

    const isClickable = !isHardLocked;

    // Simple unified style
    const styles = {
        border: 'border-border',
        background: 'bg-background',
        iconBg: 'bg-muted',
    };

    return (
        <BaseNode
            className={cn(
                'group relative w-[240px] transition-all',
                styles.border,
                styles.background,
                isClickable && 'cursor-pointer hover:shadow-lg',
                !isClickable && 'cursor-not-allowed opacity-75',
                selected && 'ring-2 ring-primary ring-offset-2',
            )}
            onClick={isClickable ? onClick : undefined}
        >
                {/* Input Handle */}
                {showInputHandle && (
                    <Handle
                        id={inputHandleId}
                        type="target"
                        position={inputHandlePosition}
                        className="!h-3 !w-3 !bg-primary !border-2 !border-background"
                    />
                )}

                {/* Header with Icon and Status */}
                <BaseNodeHeader className={cn('justify-between', styles.background)}>
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                                iconBgClass || styles.iconBg,
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : isHardLocked || isLocked ? (
                                <LockIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Icon className={cn('h-4 w-4', iconColorClass || 'text-muted-foreground')} />
                            )}
                        </div>
                        <BaseNodeHeaderTitle className="text-xs">{title}</BaseNodeHeaderTitle>
                    </div>
                    <div>
                        {isCompleted && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <CheckCircleIcon className="h-3 w-3" />
                            </div>
                        )}
                        {isCurrent && !isCompleted && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            </div>
                        )}
                        {(isHardLocked || isLocked) && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                                <LockIcon className="h-3 w-3" />
                            </div>
                        )}
                    </div>
                </BaseNodeHeader>

                {/* Content */}
                <BaseNodeContent className="space-y-3">
                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{description}</p>

                    {/* Status Badge */}
                    <div className="flex justify-center">
                        {isLoading ? (
                            <Badge
                                variant="outline"
                                className="border-blue-500/50 bg-blue-500/10 text-[10px] font-semibold text-blue-600 dark:text-blue-400"
                            >
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Generating...
                            </Badge>
                        ) : isCurrent && !isCompleted ? (
                            <Badge variant="default" className="text-[10px] font-semibold">
                                Current
                            </Badge>
                        ) : isCompleted ? (
                            <Badge
                                variant="outline"
                                className="border-emerald-500/50 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                            >
                                Completed
                            </Badge>
                        ) : (isHardLocked || isLocked) ? (
                            <Badge
                                variant="outline"
                                className="border-amber-500/50 bg-amber-500/10 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
                            >
                                Locked
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold">
                                Ready
                            </Badge>
                        )}
                    </div>

                    {/* Out of Sync Warning */}
                    {isOutOfSync && (
                        <div className="flex items-start gap-1.5 rounded-md bg-orange-500/10 p-2">
                            <AlertCircleIcon className="mt-0.5 h-3 w-3 shrink-0 text-orange-600 dark:text-orange-400" />
                            <p className="text-[10px] leading-tight text-orange-700 dark:text-orange-300">Out of sync with modules/features</p>
                        </div>
                    )}

                    {/* Prerequisite Message */}
                    {(isHardLocked || isLocked) && prerequisiteMessage && (
                        <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 p-2">
                            <AlertCircleIcon className="mt-0.5 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                            <p className="text-[10px] leading-tight text-amber-700 dark:text-amber-300">{prerequisiteMessage}</p>
                        </div>
                    )}
                </BaseNodeContent>

                {/* Footer with Expandable Features */}
                {isExpandable && features && features.length > 0 && (
                    <BaseNodeFooter className="justify-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleExpand) {
                                    onToggleExpand();
                                }
                            }}
                            className="nodrag h-7 text-[10px] font-medium"
                            title={isExpanded ? `Hide ${features.length} features` : `Show ${features.length} features`}
                        >
                            <List className="h-3 w-3" />
                            <span className="hidden sm:inline">{features.length}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                    </BaseNodeFooter>
                )}

                {/* Footer with Expandable Modules */}
                {isExpandable && modules && modules.length > 0 && (
                    <BaseNodeFooter className="justify-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleExpand) {
                                    onToggleExpand();
                                }
                            }}
                            className="nodrag h-7 text-[10px] font-medium"
                            title={isExpanded ? `Hide ${modules.length} modules` : `Show ${modules.length} modules`}
                        >
                            <List className="h-3 w-3" />
                            <span className="hidden sm:inline">{modules.length} modules</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                    </BaseNodeFooter>
                )}

                {/* Output Handle */}
                {showOutputHandle && (
                    <Handle
                        id={outputHandleId}
                        type="source"
                        position={outputHandlePosition}
                        className="!h-3 !w-3 !bg-primary !border-2 !border-background"
                    />
                )}
                {showSecondaryOutputHandle && (
                    <Handle
                        id={secondaryOutputHandleId}
                        type="source"
                        position={secondaryOutputHandlePosition}
                        className="!h-3 !w-3 !bg-primary !border-2 !border-background"
                    />
                )}
            </BaseNode>
    );
});

WorkflowNode.displayName = 'WorkflowNode';

export default WorkflowNode;
