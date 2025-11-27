import WorkflowNode from '@/components/Projects/WorkflowNode';
import ReactFlowControls from '@/components/ui/ReactFlowControls';
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
import { Zap as ZapIcon } from 'lucide-react';
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
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    order_of_implementation: number;
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
    features?: FeatureItem[];
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
    features,
}: {
    steps: WorkflowStep[];
    completionPercentage?: number;
    completedStepsCount?: number;
    totalStepsCount?: number;
    health?: Health;
    features?: FeatureItem[];
}) => {
    const { fitView } = useReactFlow();
    const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);
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
            features: { col: 1, row: 1 },
            erd: { col: 2, row: 0 },
            architecture: { col: 2, row: 1 },
        };

        const nodes: Node[] = steps.map((step) => {
            const layout = columnLayout[step.id] || { col: 0, row: 0 };
            const isFeaturesNode = step.id === 'features';
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
                    onClick: step.onClick,
                    prerequisiteMessage: step.prerequisiteMessage,
                    inputHandlePosition: Position.Left,
                    outputHandlePosition: isFeaturesNode ? Position.Bottom : Position.Right,
                    outputHandleId: isFeaturesNode ? 'features-bottom' : undefined,
                    secondaryOutputHandlePosition: isFeaturesNode ? Position.Right : Position.Right,
                    secondaryOutputHandleId: isFeaturesNode ? 'features-right' : undefined,
                    showSecondaryOutputHandle: isFeaturesNode,
                    ...(isFeaturesNode && features
                        ? {
                              features,
                              isExpandable: true,
                              isExpanded: isFeaturesExpanded,
                              onToggleExpand: () => setIsFeaturesExpanded((prev) => !prev),
                          }
                        : {}),
                },
                draggable: false,
                selectable: true,
            };
        });

        // Generate feature child nodes when expanded
        if (isFeaturesExpanded && features && features.length > 0) {
            const featureNodeWidth = 220;
            const featureSpacing = 64;
            const featureStride = featureNodeWidth + featureSpacing;
            const featuresNodeLayout = columnLayout['features'] || { col: 0, row: 0 };
            const featuresNodeX = startX + featuresNodeLayout.col * columnSpacing;
            const featuresNodeY = startY + featuresNodeLayout.row * rowSpacing;
            const featureRowY = featuresNodeY + 220;
            const totalWidth = features.length * featureNodeWidth + (features.length - 1) * featureSpacing;
            const startFeatureX = featuresNodeX - totalWidth / 2 + featureNodeWidth / 2;

            features.forEach((feature, index) => {
                nodes.push({
                    id: `feature-${feature.id}`,
                    type: 'workflowNode',
                    position: {
                        x: startFeatureX + index * featureStride,
                        y: featureRowY,
                    },
                    data: {
                        title: feature.name,
                        description: feature.summary || 'Feature details',
                        icon: ZapIcon,
                        isCompleted: feature.status === 'completed',
                        isCurrent: feature.status === 'in_progress',
                        isLocked: false,
                        isHardLocked: false,
                        onClick: () => router.visit(`/features/${feature.id}`),
                        prerequisiteMessage: undefined,
                        inputHandlePosition: Position.Top,
                        inputHandleId: `feature-${feature.id}-input`,
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
            { from: 'overview', to: 'features' },
            { from: 'technical_details', to: 'prd' },
            { from: 'features', to: 'erd', sourceHandle: 'features-right' },
            { from: 'features', to: 'architecture', sourceHandle: 'features-right' },
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

        // Add feature edges
        if (isFeaturesExpanded && features && features.length > 0) {
            features.forEach((feature) => {
                const isCompleted = feature.status === 'completed';
                edges.push({
                    id: `edge-features-feature-${feature.id}`,
                    source: 'features',
                    target: `feature-${feature.id}`,
                    sourceHandle: 'features-bottom',
                    targetHandle: `feature-${feature.id}-input`,
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
    }, [steps, features, isFeaturesExpanded]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView, isFeaturesExpanded]);

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
            <div className="relative h-full w-full">
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
                    <ReactFlowControls position="bottom-left" />
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
    features,
}) => {
    if (!steps || steps.length === 0) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">No workflow steps available.</p>
            </div>
        );
    }

    return (
        <div className={`h-full w-full ${className}`}>
            <ReactFlowProvider>
                <FlowCanvas
                    steps={steps}
                    completionPercentage={completionPercentage}
                    completedStepsCount={completedStepsCount}
                    totalStepsCount={totalStepsCount}
                    health={health}
                    features={features}
                />
            </ReactFlowProvider>
        </div>
    );
};

export default ProjectFlowCanvas;
