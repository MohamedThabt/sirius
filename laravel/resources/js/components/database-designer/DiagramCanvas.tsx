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
        const previousNodesLengthRef = useRef(initialNodes.length);
        const [isDarkMode, setIsDarkMode] = useState(() => {
            if (typeof document === 'undefined') return false;
            return document.documentElement.classList.contains('dark');
        });

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
            const pkTables = nodes.filter((node) =>
                (node.data?.fields as any[] | undefined)?.some((field: any) => field.isPrimaryKey && !field.isForeignKey),
            );
            const fkTables = nodes.filter(
                (node) => (node.data?.fields as any[] | undefined)?.some((field: any) => field.isForeignKey) && !pkTables.includes(node),
            );
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

        // Update nodes and edges when props change
        useEffect(() => {
            setNodes(initialNodes);
            setEdges(initialEdges);
            // Immediately update filtered nodes/edges if no search query
            if (!searchQuery.trim()) {
                setFilteredNodes(initialNodes);
                setFilteredEdges(initialEdges);
            }
        }, [initialNodes, initialEdges, setNodes, setEdges, searchQuery]);

        // Apply grid layout by default when nodes are first loaded or when nodes change from empty to populated
        useEffect(() => {
            const previousLength = previousNodesLengthRef.current;
            const currentLength = initialNodes.length;

            // If nodes went from empty to populated, or if nodes are populated and we haven't applied layout yet
            if (currentLength > 0 && (previousLength === 0 || !hasAppliedInitialLayout.current)) {
                hasAppliedInitialLayout.current = true;
                // Use a small delay to ensure nodes are set in state before applying layout
                const timeoutId = setTimeout(() => {
                    setNodes((currentNodes) => {
                        // Use current nodes if available, otherwise use initial nodes
                        const nodesToLayout = currentNodes.length > 0 ? currentNodes : initialNodes;
                        if (nodesToLayout.length > 0) {
                            const layoutedNodes = applyGridLayout(nodesToLayout);
                            // Also update filtered nodes if no search query
                            if (!searchQuery.trim()) {
                                setFilteredNodes(layoutedNodes);
                            }
                            return layoutedNodes;
                        }
                        return nodesToLayout;
                    });
                }, 100);

                return () => clearTimeout(timeoutId);
            }

            // Reset flag when nodes become empty so layout can be applied again when nodes are populated
            if (currentLength === 0 && previousLength > 0) {
                hasAppliedInitialLayout.current = false;
            }

            // Update previous length
            previousNodesLengthRef.current = currentLength;
        }, [initialNodes, setNodes, searchQuery]);

        // Filter nodes based on search query
        useEffect(() => {
            if (!searchQuery.trim()) {
                setFilteredNodes(nodes);
                setFilteredEdges(edges);
                return;
            }

            const query = searchQuery.toLowerCase();
            const matchingNodes = nodes.filter((node) => {
                const nodeData = node.data as { tableName?: string; fields?: any[] };
                const tableName = nodeData?.tableName?.toLowerCase() || '';
                const fields = nodeData?.fields || [];

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

        // Watch for theme changes
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
                // Defer parent notification to avoid setState during render
                if (onNodesChange) {
                    queueMicrotask(() => {
                        setNodes((currentNodes) => {
                            onNodesChange(currentNodes);
                            return currentNodes;
                        });
                    });
                }
            },
            [onNodesChangeInternal, onNodesChange, setNodes],
        );

        const handleEdgesChange = useCallback(
            (changes: any) => {
                onEdgesChangeInternal(changes);
                // Defer parent notification to avoid setState during render
                if (onEdgesChange) {
                    queueMicrotask(() => {
                        setEdges((currentEdges) => {
                            onEdgesChange(currentEdges);
                            return currentEdges;
                        });
                    });
                }
            },
            [onEdgesChangeInternal, onEdgesChange, setEdges],
        );

        return (
            <div ref={ref} className="diagram-canvas-cursor h-full w-full bg-[#e8ebed] dark:bg-[#1c2433]">
                <ReactFlow
                    nodes={enhancedNodes}
                    edges={filteredEdges}
                    nodeTypes={nodeTypes}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    fitView
                    fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                    attributionPosition="bottom-left"
                    nodesDraggable={true}
                    nodesConnectable={true}
                    elementsSelectable={true}
                    colorMode={isDarkMode ? 'dark' : 'light'}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
                    }}
                >
                    <Background
                        variant={backgroundVariant}
                        gap={backgroundOptions.gap}
                        size={backgroundOptions.size}
                        color={isDarkMode ? '#3d4354' : '#dcdfe2'}
                        bgColor={isDarkMode ? '#1c2433' : '#e8ebed'}
                    />
                    <ReactFlowControls position="bottom-left" className="diagram-canvas-controls" />
                </ReactFlow>
                <style>{`
                    .diagram-canvas-cursor,
                    .diagram-canvas-cursor .react-flow__pane {
                        cursor: grab !important;
                    }
                    .diagram-canvas-cursor .react-flow__pane:active {
                        cursor: grabbing !important;
                    }
                    .diagram-canvas-cursor .react-flow__node {
                        cursor: move !important;
                    }
                    .diagram-canvas-cursor .react-flow__node:active {
                        cursor: grabbing !important;
                    }
                    .diagram-canvas-controls {
                        background: hsl(var(--background) / 0.95) !important;
                        border: 1px solid hsl(var(--border)) !important;
                        border-radius: 0.5rem !important;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
                        backdrop-filter: blur(8px) !important;
                    }
                    .diagram-canvas-controls button {
                        background: transparent !important;
                        border: none !important;
                        color: hsl(var(--foreground)) !important;
                    }
                    .diagram-canvas-controls button:hover {
                        background: hsl(var(--muted)) !important;
                    }
                    .react-flow__edge-path {
                        stroke-width: 2 !important;
                    }
                    .react-flow__edge.selected .react-flow__edge-path {
                        stroke: hsl(var(--primary)) !important;
                        stroke-width: 3 !important;
                    }
                `}</style>
            </div>
        );
    },
);

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;
