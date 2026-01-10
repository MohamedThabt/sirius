import WorkflowNode from '@/components/Projects/WorkflowNode';
import { cn } from '@/lib/utils';
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
}

const nodeTypes = {
    workflowNode: WorkflowNode as any,
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
}: {
    steps: WorkflowStep[];
    completionPercentage?: number;
    completedStepsCount?: number;
    totalStepsCount?: number;
    health?: Health;
    modules?: ModuleItem[];
    projectId?: number;
}) => {
    const { fitView } = useReactFlow();
    const [isModulesExpanded, setIsModulesExpanded] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    const toggleModuleExpanded = useCallback((moduleId: number) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    }, []);

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodeWidth = 240;
        const columnSpacing = 350;
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
            const expandedModuleIndices = modules.map((m, i) => ({
                index: i,
                isExpanded: expandedModules[m.id] || false,
                featureCount: m.features?.length || 0,
                module: m
            })).filter(m => m.isExpanded);

            // Calculate cumulative horizontal offset for each expanded module's features
            let cumulativeFeatureOffset = 0;
            const featureOffsets: Record<number, { startX: number; rowY: number }> = {};
            
            const featureNodeWidth = 200;
            const featureSpacing = 60;
            const featureStride = featureNodeWidth + featureSpacing;
            const baseFeatureRowY = moduleRowY + 280;

            expandedModuleIndices.forEach((expandedModule, expandedIndex) => {
                const totalFeatureWidth = expandedModule.featureCount * featureNodeWidth + 
                    (expandedModule.featureCount - 1) * featureSpacing;
                
                // Stagger rows: even indices at one level, odd at another
                const rowOffset = expandedIndex % 2 === 1 ? 250 : 0;
                
                featureOffsets[expandedModule.module.id] = {
                    startX: cumulativeFeatureOffset,
                    rowY: baseFeatureRowY + rowOffset
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
                    animated: isCompleted,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: isCompleted ? '#e05d38' : '#9ca3af',
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: isCompleted ? '#e05d38' : '#9ca3af',
                    },
                };
            })
            .filter((edge): edge is Edge => edge !== null);

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
                    animated: isCompleted,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: isCompleted ? '#e05d38' : '#9ca3af',
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: isCompleted ? '#e05d38' : '#9ca3af',
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
                            animated: isFeatureCompleted,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: isFeatureCompleted ? '#e05d38' : '#9ca3af',
                            },
                            style: {
                                strokeWidth: 2,
                                stroke: isFeatureCompleted ? '#e05d38' : '#9ca3af',
                            },
                        });
                    });
                }
            });
        }

        return { nodes, edges };
    }, [steps, modules, isModulesExpanded, expandedModules, projectId]);

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
            <div className="relative h-full min-h-[500px] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
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
                >
                    <Background
                        gap={24}
                        size={1.5}
                        variant={BackgroundVariant.Dots}
                        color={isDarkMode ? '#4a4a4a' : '#b0b0b0'}
                        bgColor={isDarkMode ? '#1f1f1f' : '#e8e8e8'}
                    />

                </ReactFlow>

                {/* Enhanced Progress Badge with PROJECT STATUS */}
                {completionPercentage !== undefined && completedStepsCount !== undefined && totalStepsCount !== undefined && health && (
                    <div className="pointer-events-none absolute top-4 left-4 z-10">
                        <div className="pointer-events-auto flex flex-col gap-2 rounded-xl border border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-md">
                            {/* Header */}
                            <div className="flex items-center gap-2 border-b border-border/30 pb-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                                    <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Status</span>
                            </div>
                            
                            {/* Content */}
                            <div className="flex items-center gap-4">
                                {/* Progress Ring */}
                                <div className="relative h-12 w-12">
                                    <svg className="h-12 w-12 -rotate-90 transform">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-muted/20"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(completionPercentage / 100) * 125.6} 125.6`}
                                            className={cn(
                                                'transition-all duration-700 ease-out',
                                                completionPercentage >= 80 ? 'text-emerald-500' :
                                                completionPercentage >= 50 ? 'text-blue-500' :
                                                completionPercentage >= 25 ? 'text-amber-500' : 'text-primary'
                                            )}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-bold text-foreground">{completionPercentage}%</span>
                                    </div>
                                </div>
                                
                                {/* Stats */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-5 w-5 items-center justify-center rounded bg-muted/50">
                                            <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{completedStepsCount} of {totalStepsCount} steps</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            'flex h-5 w-5 items-center justify-center rounded',
                                            completionPercentage >= 80 ? 'bg-emerald-500/10' :
                                            completionPercentage >= 50 ? 'bg-blue-500/10' :
                                            completionPercentage >= 25 ? 'bg-amber-500/10' : 'bg-primary/10'
                                        )}>
                                            <health.Icon className={cn('h-3 w-3', health.color)} />
                                        </div>
                                        <span className={cn('text-sm font-medium capitalize', health.color)}>{health.label}</span>
                                    </div>
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
                />
            </ReactFlowProvider>
        </div>
    );
};

export default ProjectFlowCanvas;
