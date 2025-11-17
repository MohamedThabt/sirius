import ReactFlowControls from '@/components/ui/ReactFlowControls';
import { addEdge, Background, BackgroundVariant, Connection, Edge, Node, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import TableNode from './TableNode';

interface DiagramCanvasProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[]) => void;
    onNodeEdit?: (nodeId: string) => void;
    onNodeDelete?: (nodeId: string) => void;
    searchQuery?: string;
    backgroundVariant?: BackgroundVariant;
    backgroundOptions?: any;
    layoutTrigger?: { algorithm: string; timestamp: number } | null;
}

const nodeTypes = {
    tableNode: TableNode as any,
};

const DiagramCanvas = forwardRef<HTMLDivElement, DiagramCanvasProps>(
    (
        {
            nodes: initialNodes,
            edges: initialEdges,
            onNodesChange,
            onEdgesChange,
            onNodeEdit,
            onNodeDelete,
            searchQuery = '',
            backgroundVariant = BackgroundVariant.Dots,
            backgroundOptions = { gap: 20, size: 1 },
            layoutTrigger,
        },
        ref,
    ) => {
        const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
        const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
        const [filteredNodes, setFilteredNodes] = useState<Node[]>(initialNodes);
        const [filteredEdges, setFilteredEdges] = useState<Edge[]>(initialEdges);
        const hasAppliedInitialLayout = useRef(false);

        // Enhance nodes with edit/delete callbacks
        const enhancedNodes = filteredNodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                onEdit: onNodeEdit ? () => onNodeEdit(node.id) : undefined,
                onDelete: onNodeDelete ? () => onNodeDelete(node.id) : undefined,
            },
        }));

        // Layout Algorithm Implementations
        const applyGridLayout = (nodes: Node[]) => {
            const cols = Math.ceil(Math.sqrt(nodes.length));
            const nodeWidth = 300;
            const nodeHeight = 400;
            const spacing = 50;

            return nodes.map((node, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);

                return {
                    ...node,
                    position: {
                        x: col * (nodeWidth + spacing),
                        y: row * (nodeHeight + spacing),
                    },
                };
            });
        };

        const applyHierarchicalLayout = (nodes: Node[]) => {
            // Simple hierarchical layout - primary key tables at top
            const pkTables = nodes.filter((node) => node.data?.fields?.some((field: any) => field.isPrimaryKey && !field.isForeignKey));
            const fkTables = nodes.filter((node) => node.data?.fields?.some((field: any) => field.isForeignKey) && !pkTables.includes(node));
            const otherTables = nodes.filter((node) => !pkTables.includes(node) && !fkTables.includes(node));

            const nodeWidth = 300;
            const nodeHeight = 400;
            const spacing = 80;
            const levelSpacing = 200;

            let layoutNodes: Node[] = [];
            let currentY = 50;

            // Top level - Primary key tables
            pkTables.forEach((node, index) => {
                layoutNodes.push({
                    ...node,
                    position: {
                        x: index * (nodeWidth + spacing) + 50,
                        y: currentY,
                    },
                });
            });

            currentY += levelSpacing;

            // Second level - Foreign key tables
            fkTables.forEach((node, index) => {
                layoutNodes.push({
                    ...node,
                    position: {
                        x: index * (nodeWidth + spacing) + 50,
                        y: currentY,
                    },
                });
            });

            currentY += levelSpacing;

            // Third level - Other tables
            otherTables.forEach((node, index) => {
                layoutNodes.push({
                    ...node,
                    position: {
                        x: index * (nodeWidth + spacing) + 50,
                        y: currentY,
                    },
                });
            });

            return layoutNodes;
        };

        const applySnowflakeLayout = (nodes: Node[]) => {
            // Beautiful snowflake/star pattern layout with gaps
            const centerX = 600;
            const centerY = 500;
            const arms = 6; // Number of snowflake arms
            const nodeWidth = 300;

            if (nodes.length === 0) return nodes;

            // Place center node if odd number
            let layoutNodes: Node[] = [];
            let nodeIndex = 0;

            if (nodes.length % 2 === 1) {
                // Center node
                layoutNodes.push({
                    ...nodes[0],
                    position: { x: centerX - nodeWidth / 2, y: centerY - 250 },
                });
                nodeIndex = 1;
            }

            const remainingNodes = nodes.slice(nodeIndex);
            const nodesPerArm = Math.ceil(remainingNodes.length / arms);

            remainingNodes.forEach((node, index) => {
                const armIndex = Math.floor(index / nodesPerArm);
                const positionInArm = index % nodesPerArm;

                // Calculate arm angle (6 arms = 60 degrees each)
                const armAngle = (armIndex / arms) * 2 * Math.PI;

                // Distance from center increases with larger gaps
                const baseDistance = 350; // Increased base distance for more space
                const gapBetweenNodes = 280; // Larger gaps between nodes on same arm
                const distance = baseDistance + positionInArm * gapBetweenNodes;

                // Add slight randomness for organic snowflake look
                const angleVariation = (Math.random() - 0.5) * 0.2;
                const distanceVariation = (Math.random() - 0.5) * 60;

                const finalAngle = armAngle + angleVariation;
                const finalDistance = distance + distanceVariation;

                const x = centerX + finalDistance * Math.cos(finalAngle);
                const y = centerY + finalDistance * Math.sin(finalAngle);

                layoutNodes.push({
                    ...node,
                    position: { x: Math.max(50, x), y: Math.max(50, y) },
                });
            });

            return layoutNodes;
        };

        // Update nodes when props change
        useEffect(() => {
            setNodes(initialNodes);
        }, [initialNodes, setNodes]);

        // Update edges when props change
        useEffect(() => {
            setEdges(initialEdges);
        }, [initialEdges, setEdges]);

        // Apply grid layout by default when nodes are first loaded
        useEffect(() => {
            if (initialNodes.length > 0 && !hasAppliedInitialLayout.current) {
                hasAppliedInitialLayout.current = true;
                // Apply grid layout automatically on first load
                const gridNodes = applyGridLayout(initialNodes);
                setNodes(gridNodes);
            }
            // Reset flag when nodes become empty
            if (initialNodes.length === 0) {
                hasAppliedInitialLayout.current = false;
            }
        }, [initialNodes.length, setNodes]);

        // Filter nodes based on search query
        useEffect(() => {
            if (!searchQuery.trim()) {
                setFilteredNodes(nodes);
                setFilteredEdges(edges);
                return;
            }

            const query = searchQuery.toLowerCase();
            const matchingNodes = nodes.filter((node) => {
                const tableName = node.data?.tableName?.toLowerCase() || '';
                const fields = node.data?.fields || [];

                // Check table name
                if (tableName.includes(query)) return true;

                // Check field names
                return fields.some((field: any) => field.name?.toLowerCase().includes(query) || field.type?.toLowerCase().includes(query));
            });

            const matchingNodeIds = new Set(matchingNodes.map((node) => node.id));
            const matchingEdges = edges.filter((edge) => matchingNodeIds.has(edge.source) || matchingNodeIds.has(edge.target));

            setFilteredNodes(matchingNodes);
            setFilteredEdges(matchingEdges);
        }, [searchQuery, nodes, edges]);

        // Handle layout trigger
        useEffect(() => {
            if (!layoutTrigger) return;

            const { algorithm } = layoutTrigger;

            // Get current nodes at the time of layout trigger
            setNodes((currentNodes) => {
                let newNodes = [...currentNodes];

                switch (algorithm) {
                    case 'grid':
                        newNodes = applyGridLayout(currentNodes);
                        break;
                    case 'dagre':
                        newNodes = applyHierarchicalLayout(currentNodes);
                        break;
                    case 'snowflake':
                        newNodes = applySnowflakeLayout(currentNodes);
                        break;
                    default:
                        newNodes = applyGridLayout(currentNodes);
                }

                return newNodes;
            });
        }, [layoutTrigger]);

        const onConnect = useCallback(
            (params: Connection) => {
                const newEdge: Edge = {
                    ...params,
                    id: `${params.source}-${params.target}`,
                    type: 'smoothstep',
                    animated: true,
                };
                setEdges((eds) => {
                    const updatedEdges = addEdge(newEdge, eds);
                    onEdgesChange?.(updatedEdges);
                    return updatedEdges;
                });
            },
            [setEdges, onEdgesChange],
        );

        const handleNodesChange = useCallback(
            (changes: any) => {
                onNodesChangeInternal(changes);
                // Notify parent of node changes
                setNodes((currentNodes) => {
                    onNodesChange?.(currentNodes);
                    return currentNodes;
                });
            },
            [onNodesChangeInternal, onNodesChange, setNodes],
        );

        const handleEdgesChange = useCallback(
            (changes: any) => {
                onEdgesChangeInternal(changes);
                // Notify parent of edge changes
                setEdges((currentEdges) => {
                    onEdgesChange?.(currentEdges);
                    return currentEdges;
                });
            },
            [onEdgesChangeInternal, onEdgesChange, setEdges],
        );

        return (
            <div ref={ref} className="diagram-canvas-cursor h-full w-full">
                <ReactFlow
                    nodes={enhancedNodes}
                    edges={filteredEdges}
                    nodeTypes={nodeTypes}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    fitView
                    attributionPosition="bottom-left"
                    nodesDraggable={true}
                    nodesConnectable={true}
                    elementsSelectable={true}
                >
                    <Background
                        variant={backgroundVariant}
                        gap={backgroundOptions.gap}
                        size={backgroundOptions.size}
                        style={{
                            backgroundColor: 'transparent',
                            opacity: 0.4,
                        }}
                    />
                    <ReactFlowControls position="bottom-left" className="diagram-canvas-controls" />
                </ReactFlow>
                <style>{`
                    .diagram-canvas-cursor,
                    .diagram-canvas-cursor .react-flow__pane {
                        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="%23a855f7" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23a855f7"/></svg>') 12 12, auto !important;
                    }
                    .diagram-canvas-cursor .react-flow__node {
                        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 12 L12 3 L21 12 L12 21 Z" fill="none" stroke="%2306b6d4" stroke-width="2"/><path d="M8 12 L12 8 L16 12 L12 16 Z" fill="%2306b6d4"/></svg>') 12 12, move !important;
                    }
                    @media (prefers-color-scheme: dark) {
                        .diagram-canvas-cursor,
                        .diagram-canvas-cursor .react-flow__pane {
                            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="%23c084fc" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23c084fc"/></svg>') 12 12, auto !important;
                        }
                        .diagram-canvas-cursor .react-flow__node {
                            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 12 L12 3 L21 12 L12 21 Z" fill="none" stroke="%2322d3ee" stroke-width="2"/><path d="M8 12 L12 8 L16 12 L12 16 Z" fill="%2322d3ee"/></svg>') 12 12, move !important;
                        }
                    }
                `}</style>
            </div>
        );
    },
);

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;
