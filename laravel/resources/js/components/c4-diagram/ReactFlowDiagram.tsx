import ReactFlowControls from '@/components/ui/ReactFlowControls';
import { C4Diagram, C4Element } from '@/utils/c4Validator';
import {
    Background,
    BackgroundVariant,
    Edge,
    MarkerType,
    Node,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useState } from 'react';
import C4Node from './C4Node';

// Helper function to calculate boundary size with enhanced padding
const calculateBoundarySize = (elements: C4Element[]) => {
    if (elements.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    const padding = 100; // Reasonable padding for system boundary
    elements.forEach((el) => {
        minX = Math.min(minX, el.position?.x ?? 0);
        minY = Math.min(minY, el.position?.y ?? 0);
        maxX = Math.max(maxX, (el.position?.x ?? 0) + 280);
        maxY = Math.max(maxY, (el.position?.y ?? 0) + 180);
    });
    return {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
    };
};

const nodeTypes = {
    c4Node: C4Node as any, // Use a single node type
};

interface ReactFlowDiagramProps {
    c4Diagram?: C4Diagram;
    className?: string;
}

// A new inner component to access the ReactFlow instance context
const Diagram = ({ c4Diagram }: { c4Diagram: C4Diagram }) => {
    const { fitView } = useReactFlow();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        // First, calculate boundary to determine center point
        let boundaryInfo = null;
        if (c4Diagram.groups && c4Diagram.groups.length > 0) {
            const group = c4Diagram.groups[0];
            const groupElements = c4Diagram.elements.filter((el) => group.elements.includes(el.id));
            boundaryInfo = calculateBoundarySize(groupElements);
        }

        // Enhanced spacing for nodes with special handling for external nodes
        let nodes: Node[] = c4Diagram.elements.map((element, index) => {
            let position = element.position;

            // If element has position and is external, push it away from boundary
            if (position && (element.type === 'external-person' || element.type === 'external-system' || element.isExternal)) {
                if (boundaryInfo) {
                    const boundaryCenterX = boundaryInfo.x + boundaryInfo.width / 2;
                    const boundaryCenterY = boundaryInfo.y + boundaryInfo.height / 2;

                    const offsetMultiplier = 1.15; // Push external elements 15% further from center

                    // Calculate direction from boundary center to element
                    const deltaX = position.x - boundaryCenterX;
                    const deltaY = position.y - boundaryCenterY;

                    // Push element further in that direction
                    position = {
                        x: boundaryCenterX + deltaX * offsetMultiplier,
                        y: boundaryCenterY + deltaY * offsetMultiplier,
                    };
                }
            }

            // Fallback for elements without position
            if (!position) {
                const isExternal = element.type === 'external-person' || element.type === 'external-system';
                const horizontalGap = isExternal ? 400 : 340;
                const verticalGap = isExternal ? 280 : 240;
                position = {
                    x: 150 + (index % 4) * horizontalGap,
                    y: 100 + Math.floor(index / 4) * verticalGap,
                };
            }

            return {
                id: element.id,
                type: 'c4Node',
                position,
                data: element as unknown as Record<string, unknown>,
            };
        });

        if (c4Diagram.groups) {
            c4Diagram.groups.forEach((group) => {
                const groupElements = c4Diagram.elements.filter((el) => group.elements.includes(el.id));
                const { x, y, width, height } = calculateBoundarySize(groupElements);

                nodes.push({
                    id: group.id,
                    type: 'c4Node',
                    position: { x: x || 0, y: y || 0 },
                    data: {
                        id: group.id,
                        name: group.name,
                        type: 'boundary',
                        description: group.description || '',
                        width: width || 200,
                        height: height || 200,
                    },
                    zIndex: -1,
                    draggable: false,
                });

                nodes = nodes.map((node) => {
                    if (group.elements.includes(node.id)) {
                        return { ...node, parentNode: group.id, extent: 'parent' as const };
                    }
                    return node;
                });
            });
        }

        const edges: Edge[] = c4Diagram.relationships.map((rel, index) => ({
            id: rel.id || `edge-${index}`,
            source: rel.from,
            target: rel.to,
            label: (
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rel.label}</div>
                    {rel.technology && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">[{rel.technology}]</div>}
                </div>
            ),
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#6b7280' },
            style: { strokeWidth: 2, stroke: '#6b7280' },
            labelBgPadding: [8, 4] as [number, number],
            labelBgBorderRadius: 4,
            labelBgStyle: { fill: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)' },
        }));

        return { nodes, edges };
    }, [c4Diagram]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // ✨ THE FIX: This useEffect hook syncs the diagram state with the props.
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        // This makes the diagram zoom to fit the new elements nicely.
        setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 50);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

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
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                className="c4-diagram-cursor"
                colorMode={isDarkMode ? 'dark' : 'light'}
            >
                <Background color={isDarkMode ? '#6b7280' : '#aaa'} gap={16} variant={BackgroundVariant.Dots} />
                <ReactFlowControls position="bottom-left" className="c4-diagram-controls" />
            </ReactFlow>
            <style>{`
                .c4-diagram-cursor .react-flow__pane {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="%23a855f7" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23a855f7"/></svg>') 12 12, auto !important;
                }
                .c4-diagram-cursor .react-flow__node {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 12 L12 3 L21 12 L12 21 Z" fill="none" stroke="%2306b6d4" stroke-width="2"/><path d="M8 12 L12 8 L16 12 L12 16 Z" fill="%2306b6d4"/></svg>') 12 12, move !important;
                }
                .dark .c4-diagram-cursor .react-flow__pane {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="%23c084fc" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23c084fc"/></svg>') 12 12, auto !important;
                }
                .dark .c4-diagram-cursor .react-flow__node {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 12 L12 3 L21 12 L12 21 Z" fill="none" stroke="%2322d3ee" stroke-width="2"/><path d="M8 12 L12 8 L16 12 L12 16 Z" fill="%2322d3ee"/></svg>') 12 12, move !important;
                }
            `}</style>
        </>
    );
};

const ReactFlowDiagram: React.FC<ReactFlowDiagramProps> = ({ c4Diagram, className = '' }) => {
    if (!c4Diagram) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">No diagram data provided.</p>
            </div>
        );
    }

    return (
        <div className={`h-full w-full ${className}`}>
            <ReactFlowProvider>
                <Diagram c4Diagram={c4Diagram} />
            </ReactFlowProvider>
        </div>
    );
};

export default ReactFlowDiagram;
