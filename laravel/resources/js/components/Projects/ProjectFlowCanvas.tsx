import WorkflowNode from '@/components/Projects/WorkflowNode';
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
import { Box as BoxIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    isHardLocked: boolean;
    actionType: 'navigate' | 'generate' | 'view' | 'create';
    actionPath: string | null;
    prerequisiteMessage?: string;
    isLoading?: boolean;
    onClick: () => void;
}

interface Health {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
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
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodeWidth = 240;
        const columnSpacing = 450;
        const rowSpacing = 320;
        const startX = 100;
        const startY = 100;

        // Column layout for workflow
        const columnLayout: { [key: string]: { col: number; row: number } } = {
            overview: { col: 0, row: 0 },
            technical_details: { col: 0, row: 1 },
            prd: { col: 1, row: 0 },
            modules: { col: 1, row: 1 },
            erd: { col: 2, row: 0 },
            architecture: { col: 2, row: 1 },
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
                    isCompleted: step.isCompleted,
                    isCurrent: step.isCurrent,
                    isLocked: step.isLocked,
                    isHardLocked: step.isHardLocked,
                    isLoading: step.isLoading,
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
            const moduleRowY = modulesNodeY + 220;
            const totalWidth = modules.length * moduleNodeWidth + (modules.length - 1) * moduleSpacing;
            const startModuleX = modulesNodeX - totalWidth / 2 + moduleNodeWidth / 2;

            modules.forEach((module, index) => {
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
                        isCompleted: module.status === 'completed',
                        isCurrent: module.status === 'in_progress',
                        isLocked: false,
                        isHardLocked: false,
                        onClick: () => router.visit(`/projects/${projectId}/modules/${module.id}`),
                        prerequisiteMessage: undefined,
                        inputHandlePosition: Position.Top,
                        inputHandleId: `module-${module.id}-input`,
                        showOutputHandle: false,
                    },
                    draggable: false,
                    selectable: true,
                });
            });
        }

        // Define edges
        const edgeConnections = [
            { from: 'overview', to: 'prd' },
            { from: 'overview', to: 'modules' },
            { from: 'technical_details', to: 'prd' },
            { from: 'modules', to: 'erd', sourceHandle: 'modules-right' },
            { from: 'modules', to: 'architecture', sourceHandle: 'modules-right' },
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
                        color: isCompleted ? '#10b981' : '#9ca3af',
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: isCompleted ? '#10b981' : '#9ca3af',
                    },
                };
            })
            .filter((edge): edge is Edge => edge !== null);

        // Add module edges
        if (isModulesExpanded && modules && modules.length > 0) {
            modules.forEach((module) => {
                const isCompleted = module.status === 'completed';
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
                        color: isCompleted ? '#10b981' : '#9ca3af',
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: isCompleted ? '#10b981' : '#9ca3af',
                    },
                });
            });
        }

        return { nodes, edges };
    }, [steps, modules, isModulesExpanded]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView, isModulesExpanded]);

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
            <div className="relative h-full min-h-[500px] w-full">
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
                        gap={16}
                        size={1}
                        variant={BackgroundVariant.Dots}
                        color={isDarkMode ? '#6b7280' : '#9ca3af'}
                    />

                </ReactFlow>

                {/* Progress Badge */}
                {completionPercentage !== undefined && completedStepsCount !== undefined && totalStepsCount !== undefined && health && (
                    <div className="pointer-events-none absolute top-4 left-4 z-10">
                        <div className="pointer-events-auto flex h-[42px] items-center gap-4 rounded-lg border border-border bg-card px-4 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <span>
                                    {completedStepsCount}/{totalStepsCount} Steps
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span>{completionPercentage}% Complete</span>
                                <span className="text-muted-foreground">•</span>
                                <div className="flex items-center gap-1.5">
                                    <health.Icon className={`h-4 w-4 ${health.color}`} />
                                    <span className="capitalize">{health.label}</span>
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
