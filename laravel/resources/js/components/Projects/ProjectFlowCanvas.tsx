import GitHubNode from '@/components/Projects/GitHubNode';
import WorkflowNode from '@/components/Projects/WorkflowNode';
import { cn } from '@/lib/utils';
import type { Repository } from '@/types';
import { router } from '@inertiajs/react';
import {
    Background,
    BackgroundVariant,
    Edge,
    MarkerType,
    Node,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box as BoxIcon, Zap as ZapIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColorClass?: string;
    iconBgClass?: string;
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    isHardLocked: boolean;
    actionType: 'navigate' | 'generate' | 'view' | 'create';
    actionPath: string | null;
    prerequisiteMessage?: string;
    isLoading?: boolean;
    isOutOfSync?: boolean;
    onClick: () => void;
    currentBadgeLabel?: string;
}

interface Health {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface FeatureItem {
    id: number;
    name: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'in_progress' | 'completed' | 'archived' | 'done' | 'todo' | 'review';
    order_of_implementation: number;
    progress?: number;
}

interface ModuleItem {
    id: number;
    name: string;
    description: string;
    status: 'planned' | 'in_progress' | 'completed';
    order_of_implementation: number;
    metrics?: string | null;
    erd?: string | null;
    progress?: number;
    features?: FeatureItem[];
}

interface ProjectFlowCanvasProps {
    steps: WorkflowStep[];
    className?: string;
    completionPercentage?: number;
    completedStepsCount?: number;
    totalStepsCount?: number;
    health?: Health;
    teamMembers?: any[];
    teamMembersCount?: number;
    projectId?: number;
    modules?: ModuleItem[];
    repository?: Repository | null;
    onConnectRepo?: () => void;
    onManageRepo?: () => void;
}

const nodeTypes = {
    workflowNode: WorkflowNode as any,
    githubNode: GitHubNode as any,
};

// Inner component to access ReactFlow context
const FlowCanvas = ({
    steps,
    completionPercentage,
    completedStepsCount,
    totalStepsCount,
    health,
    modules,
    projectId,
    repository,
    onConnectRepo,
    onManageRepo,
}: {
    steps: WorkflowStep[];
    completionPercentage?: number;
    completedStepsCount?: number;
    totalStepsCount?: number;
    health?: Health;
    modules?: ModuleItem[];
    projectId?: number;
    repository?: Repository | null;
    onConnectRepo?: () => void;
    onManageRepo?: () => void;
}) => {
    const { fitView } = useReactFlow();
    const [isModulesExpanded, setIsModulesExpanded] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    // Theme-aware edge colors (warm editorial palette)
    const completedEdgeColor = isDarkMode ? '#a8a29e' : '#292524';
    const incompleteEdgeColor = isDarkMode ? '#44403c' : '#d6d3d1';

    const toggleModuleExpanded = useCallback((moduleId: number) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    }, []);

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodeWidth = 260;
        const columnSpacing = 370;
        const rowSpacing = 200;
        const startX = 100;
        const startY = 100;

        // New Column layout for workflow:
        // Col 0: Brief
        // Col 1: Overview (row 0), Technical Details (row 1)
        // Col 2: Modules
        // Col 3: PRD (row 0), Architecture (row 1), ERD (row 2)
        const columnLayout: { [key: string]: { col: number; row: number } } = {
            brief: { col: 0, row: 0.5 },
            overview: { col: 1, row: 0 },
            technical_details: { col: 1, row: 1 },
            modules: { col: 2, row: 0.5 },
            prd: { col: 3, row: 0 },
            architecture: { col: 3, row: 1 },
            erd: { col: 3, row: 2 },
        };

        const nodes: Node[] = steps.map((step) => {
            const layout = columnLayout[step.id] || { col: 0, row: 0 };
            const isModulesNode = step.id === 'modules';
            return {
                id: step.id,
                type: 'workflowNode',
                position: {
                    x: startX + layout.col * columnSpacing,
                    y: startY + layout.row * rowSpacing,
                },
                data: {
                    title: step.title,
                    description: step.description,
                    icon: step.icon,
                    iconColorClass: step.iconColorClass,
                    iconBgClass: step.iconBgClass,
                    isCompleted: step.isCompleted,
                    isCurrent: step.isCurrent,
                    isLocked: step.isLocked,
                    isHardLocked: step.isHardLocked,
                    isLoading: step.isLoading,
                    isOutOfSync: step.isOutOfSync,
                    onClick: step.onClick,
                    prerequisiteMessage: step.prerequisiteMessage,
                    currentBadgeLabel: step.currentBadgeLabel,
                    inputHandlePosition: Position.Left,
                    outputHandlePosition: isModulesNode ? Position.Bottom : Position.Right,
                    outputHandleId: isModulesNode ? 'modules-bottom' : undefined,
                    secondaryOutputHandlePosition: isModulesNode ? Position.Right : Position.Right,
                    secondaryOutputHandleId: isModulesNode ? 'modules-right' : undefined,
                    showSecondaryOutputHandle: isModulesNode,
                    ...(isModulesNode && modules && modules.length > 0
                        ? {
                              modules,
                              isExpandable: true,
                              isExpanded: isModulesExpanded,
                              onToggleExpand: () => setIsModulesExpanded((prev) => !prev),
                          }
                        : {}),
                },
                draggable: false,
                selectable: true,
            };
        });

        // GitHub integration node (always visible)
        const githubHandleIds = ['github-input-top', 'github-input-center', 'github-input-bottom'];
        nodes.push({
            id: 'github',
            type: 'githubNode',
            position: {
                x: startX + 4 * columnSpacing,
                y: startY + 0.5 * rowSpacing,
            },
            data: {
                repository: repository ?? null,
                isConnected: !!repository,
                onConnect: onConnectRepo ?? (() => {}),
                onManage: onManageRepo ?? (() => {}),
                inputHandleIds: githubHandleIds,
            },
            draggable: false,
            selectable: true,
        });

        // Generate module child nodes when expanded
        if (isModulesExpanded && modules && modules.length > 0) {
            const moduleNodeWidth = 220;
            const moduleSpacing = 64;
            const moduleStride = moduleNodeWidth + moduleSpacing;
            const modulesNodeLayout = columnLayout['modules'] || { col: 0, row: 0 };
            const modulesNodeX = startX + modulesNodeLayout.col * columnSpacing;
            const modulesNodeY = startY + modulesNodeLayout.row * rowSpacing;
            // Position module nodes below all main flow nodes (shifted down)
            const moduleRowY = startY + 3 * rowSpacing; // Below the ERD node (row 2)
            const totalWidth = modules.length * moduleNodeWidth + (modules.length - 1) * moduleSpacing;
            const startModuleX = modulesNodeX - totalWidth / 2 + moduleNodeWidth / 2;

            // Calculate which modules are expanded and their feature counts
            const expandedModuleIndices = modules
                .map((m, i) => ({
                    index: i,
                    isExpanded: expandedModules[m.id] || false,
                    featureCount: m.features?.length || 0,
                    module: m,
                }))
                .filter((m) => m.isExpanded);

            // Calculate cumulative horizontal offset for each expanded module's features
            let cumulativeFeatureOffset = 0;
            const featureOffsets: Record<number, { startX: number; rowY: number }> = {};

            const featureNodeWidth = 200;
            const featureSpacing = 60;
            const featureStride = featureNodeWidth + featureSpacing;
            const baseFeatureRowY = moduleRowY + 280;

            expandedModuleIndices.forEach((expandedModule, expandedIndex) => {
                const totalFeatureWidth = expandedModule.featureCount * featureNodeWidth + (expandedModule.featureCount - 1) * featureSpacing;

                // Stagger rows: even indices at one level, odd at another
                const rowOffset = expandedIndex % 2 === 1 ? 250 : 0;

                featureOffsets[expandedModule.module.id] = {
                    startX: cumulativeFeatureOffset,
                    rowY: baseFeatureRowY + rowOffset,
                };

                cumulativeFeatureOffset += totalFeatureWidth + 100; // Add gap between module's features
            });

            // Center all features under the modules
            const totalAllFeaturesWidth = cumulativeFeatureOffset - 100; // Remove last gap
            const centerOffset = totalAllFeaturesWidth > 0 ? -totalAllFeaturesWidth / 2 + modulesNodeX : 0;

            modules.forEach((module, index) => {
                const hasFeatures = module.features && module.features.length > 0;
                const isModuleExpanded = expandedModules[module.id] || false;

                nodes.push({
                    id: `module-${module.id}`,
                    type: 'workflowNode',
                    position: {
                        x: startModuleX + index * moduleStride,
                        y: moduleRowY,
                    },
                    data: {
                        title: module.name,
                        description: module.description || 'Module details',
                        icon: BoxIcon,
                        isCompleted: module.progress === 100 || module.status === 'completed',
                        isCurrent: module.status === 'in_progress',
                        isLocked: false,
                        isHardLocked: false,
                        onClick: () => router.visit(`/projects/${projectId}/modules/${module.id}`),
                        prerequisiteMessage: undefined,
                        inputHandlePosition: Position.Top,
                        inputHandleId: `module-${module.id}-input`,
                        outputHandlePosition: hasFeatures ? Position.Bottom : undefined,
                        outputHandleId: hasFeatures ? `module-${module.id}-output` : undefined,
                        showOutputHandle: hasFeatures,
                        // Progress indicator
                        progress: module.progress,
                        // Feature expansion props
                        features: module.features,
                        isExpandable: hasFeatures,
                        isExpanded: isModuleExpanded,
                        onToggleExpand: hasFeatures ? () => toggleModuleExpanded(module.id) : undefined,
                    },
                    draggable: false,
                    selectable: true,
                });

                // Generate feature child nodes when this module is expanded
                if (isModuleExpanded && module.features && module.features.length > 0) {
                    const offset = featureOffsets[module.id];

                    module.features.forEach((feature, featureIndex) => {
                        const featureX = centerOffset + offset.startX + featureIndex * featureStride;

                        nodes.push({
                            id: `feature-${feature.id}`,
                            type: 'workflowNode',
                            position: {
                                x: featureX,
                                y: offset.rowY,
                            },
                            data: {
                                title: feature.name,
                                description: feature.summary || 'Feature details',
                                icon: ZapIcon,
                                isCompleted: feature.progress === 100 || feature.status === 'done',
                                isCurrent: feature.status === 'in_progress',
                                isLocked: false,
                                isHardLocked: false,
                                onClick: () => router.visit(`/projects/${projectId}/modules/${module.id}/features/${feature.id}`),
                                prerequisiteMessage: undefined,
                                progress: feature.progress ?? 0,
                                inputHandlePosition: Position.Top,
                                inputHandleId: `feature-${feature.id}-input`,
                                showOutputHandle: false,
                            },
                            draggable: false,
                            selectable: true,
                        });
                    });
                }
            });
        }

        // Define edges - New Flow: Brief → Overview/Technical → Modules → PRD/Architecture/ERD
        const edgeConnections = [
            // Stage 1 → Stage 2: Brief feeds into Overview and Technical Details
            { from: 'brief', to: 'overview' },
            { from: 'brief', to: 'technical_details' },
            // Stage 2 → Stage 3: Overview and Technical Details feed into Modules
            { from: 'overview', to: 'modules' },
            { from: 'technical_details', to: 'modules' },
            // Stage 3 → Stage 4: Modules feeds into PRD, Architecture, and ERD
            { from: 'modules', to: 'prd', sourceHandle: 'modules-right' },
            { from: 'modules', to: 'architecture', sourceHandle: 'modules-right' },
            { from: 'modules', to: 'erd', sourceHandle: 'modules-right' },
        ];

        const edges: Edge[] = edgeConnections
            .map((connection): Edge | null => {
                const { from, to, sourceHandle } = connection;
                const sourceStep = steps.find((s) => s.id === from);
                const targetStep = steps.find((s) => s.id === to);
                if (!sourceStep || !targetStep) return null;

                const isCompleted = sourceStep.isCompleted && targetStep.isCompleted;

                return {
                    id: `edge-${from}-${to}`,
                    source: from,
                    target: to,
                    sourceHandle,
                    type: 'smoothstep',
                    animated: false,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 16,
                        height: 16,
                        color: isCompleted ? completedEdgeColor : incompleteEdgeColor,
                    },
                    style: {
                        strokeWidth: 1.5,
                        stroke: isCompleted ? completedEdgeColor : incompleteEdgeColor,
                    },
                };
            })
            .filter((edge): edge is Edge => edge !== null);

        // GitHub integration edges (dashed, only when connected)
        if (repository) {
            const githubEdgeConfig = [
                { from: 'prd', targetHandle: 'github-input-top' },
                { from: 'architecture', targetHandle: 'github-input-center' },
                { from: 'erd', targetHandle: 'github-input-bottom' },
            ];
            const githubEdgeColor = isDarkMode ? '#44403c' : '#d6d3d1';
            githubEdgeConfig.forEach(({ from, targetHandle }) => {
                edges.push({
                    id: `edge-${from}-github`,
                    source: from,
                    target: 'github',
                    targetHandle,
                    type: 'smoothstep',
                    animated: false,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 14,
                        height: 14,
                        color: githubEdgeColor,
                    },
                    style: {
                        strokeWidth: 1.5,
                        stroke: githubEdgeColor,
                        strokeDasharray: '6 4',
                    },
                });
            });
        }

        // Add module edges
        if (isModulesExpanded && modules && modules.length > 0) {
            modules.forEach((module) => {
                const isCompleted = module.progress === 100 || module.status === 'completed';
                const isModuleExpanded = expandedModules[module.id] || false;

                edges.push({
                    id: `edge-modules-module-${module.id}`,
                    source: 'modules',
                    target: `module-${module.id}`,
                    sourceHandle: 'modules-bottom',
                    targetHandle: `module-${module.id}-input`,
                    type: 'smoothstep',
                    animated: false,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 16,
                        height: 16,
                        color: isCompleted ? completedEdgeColor : incompleteEdgeColor,
                    },
                    style: {
                        strokeWidth: 1.5,
                        stroke: isCompleted ? completedEdgeColor : incompleteEdgeColor,
                    },
                });

                // Add feature edges when module is expanded
                if (isModuleExpanded && module.features && module.features.length > 0) {
                    module.features.forEach((feature) => {
                        const isFeatureCompleted = feature.progress === 100 || feature.status === 'done';
                        edges.push({
                            id: `edge-module-${module.id}-feature-${feature.id}`,
                            source: `module-${module.id}`,
                            target: `feature-${feature.id}`,
                            sourceHandle: `module-${module.id}-output`,
                            targetHandle: `feature-${feature.id}-input`,
                            type: 'smoothstep',
                            animated: false,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 16,
                                height: 16,
                                color: isFeatureCompleted ? completedEdgeColor : incompleteEdgeColor,
                            },
                            style: {
                                strokeWidth: 1.5,
                                stroke: isFeatureCompleted ? completedEdgeColor : incompleteEdgeColor,
                            },
                        });
                    });
                }
            });
        }

        return { nodes, edges };
    }, [steps, modules, isModulesExpanded, expandedModules, projectId, completedEdgeColor, incompleteEdgeColor, repository, onConnectRepo, onManageRepo]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView, isModulesExpanded, expandedModules]);

    useEffect(() => {
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        checkTheme();

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div className="relative h-full min-h-[500px] w-full overflow-hidden rounded-xl">
                {/* Warm editorial background */}
                <div className="pointer-events-none absolute inset-0">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: isDarkMode
                                ? '#0c0a09'
                                : 'linear-gradient(160deg, #fafaf9 0%, #f5f5f4 40%, #f5f5f5 100%)',
                        }}
                    />
                    {/* Subtle warm corner glow */}
                    <div
                        className="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-40"
                        style={{
                            background: isDarkMode
                                ? 'radial-gradient(circle, rgba(168,162,158,0.04) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(231,229,228,0.8) 0%, transparent 70%)',
                        }}
                    />
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    colorMode={isDarkMode ? 'dark' : 'light'}
                    style={{ background: 'transparent' }}
                >
                    <Background
                        gap={28}
                        size={1}
                        variant={BackgroundVariant.Dots}
                        color={isDarkMode ? 'rgba(168, 162, 158, 0.08)' : 'rgba(41, 37, 36, 0.04)'}
                    />
                </ReactFlow>
                <style>{`
                    .react-flow__background {
                        background: transparent !important;
                    }
                `}</style>

                {/* Progress Badge */}
                {completionPercentage !== undefined && completedStepsCount !== undefined && totalStepsCount !== undefined && health && (
                    <div className="pointer-events-none absolute top-4 left-4 z-10">
                        <div className="pointer-events-auto flex items-center gap-3 rounded-[18px] border border-border/30 bg-card/80 px-4 py-2.5 backdrop-blur-sm">
                            <span className="text-base font-semibold tabular-nums text-foreground/80">{completionPercentage}%</span>
                            <div className="h-3.5 w-px bg-border/30" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-medium tracking-wide text-muted-foreground/60">
                                    {completedStepsCount}/{totalStepsCount} steps
                                </span>
                                <div className="flex items-center gap-1">
                                    <div className={cn('h-1 w-1 rounded-full', health.color.replace('text-', 'bg-').replace(/\/\d+/, '/50'))} />
                                    <span className={cn('text-[9px] font-medium capitalize tracking-wide', health.color.replace(/text-/, 'text-').replace(/\/\d+/, '/50'))}>{health.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const ProjectFlowCanvas: React.FC<ProjectFlowCanvasProps> = ({
    steps,
    className = '',
    completionPercentage,
    completedStepsCount,
    totalStepsCount,
    health,
    modules,
    projectId,
    repository,
    onConnectRepo,
    onManageRepo,
}) => {
    if (!steps || steps.length === 0) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">No workflow steps available.</p>
            </div>
        );
    }

    return (
        <div className={`h-full min-h-[500px] w-full ${className}`}>
            <ReactFlowProvider>
                <FlowCanvas
                    steps={steps}
                    completionPercentage={completionPercentage}
                    completedStepsCount={completedStepsCount}
                    totalStepsCount={totalStepsCount}
                    health={health}
                    modules={modules}
                    projectId={projectId}
                    repository={repository}
                    onConnectRepo={onConnectRepo}
                    onManageRepo={onManageRepo}
                />
            </ReactFlowProvider>
        </div>
    );
};

export default ProjectFlowCanvas;
