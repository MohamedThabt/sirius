import { Edge, Node } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';

interface ParsedParticipant {
    name: string;
    type: 'participant' | 'actor';
}

interface ParsedMessage {
    id: string;
    from: string;
    to: string;
    message: string;
    type: 'solid' | 'dashed' | 'note';
}

interface ParsedSequenceSchema {
    participants: ParsedParticipant[];
    messages: ParsedMessage[];
}

interface ParsedJourneyStep {
    id: string;
    action: string;
    score: number;
    actor: string;
}

interface ParsedJourneySchema {
    title: string;
    sections: Array<{
        name: string;
        steps: ParsedJourneyStep[];
    }>;
}

// Simple Mermaid Sequence Diagram parser
const parseSequenceDiagram = (mermaid: string): ParsedSequenceSchema => {
    const participants: ParsedParticipant[] = [];
    const messages: ParsedMessage[] = [];

    const lines = mermaid
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

    let messageIndex = 0;

    for (const line of lines) {
        // Parse participants
        if (line.startsWith('participant ')) {
            const name = line.replace('participant ', '').trim();
            participants.push({ name, type: 'participant' });
        } else if (line.startsWith('actor ')) {
            const name = line.replace('actor ', '').trim();
            participants.push({ name, type: 'actor' });
        }

        // Parse messages
        const messageMatch = line.match(/^(\w+)(->>?|-->>?)(\w+):\s*(.+)$/);
        if (messageMatch) {
            const [, from, arrow, to, message] = messageMatch;
            const type = arrow.includes('--') ? 'dashed' : 'solid';

            messages.push({
                id: `msg-${messageIndex++}`,
                from,
                to,
                message,
                type,
            });
        }

        // Parse notes
        const noteMatch = line.match(/^Note\s+(?:right of|left of|over)\s+(\w+):\s*(.+)$/);
        if (noteMatch) {
            const [, participant, note] = noteMatch;
            messages.push({
                id: `note-${messageIndex++}`,
                from: participant,
                to: participant,
                message: note,
                type: 'note',
            });
        }
    }

    return { participants, messages };
};

// Simple Mermaid User Journey parser
const parseUserJourney = (mermaid: string): ParsedJourneySchema => {
    const sections: Array<{ name: string; steps: ParsedJourneyStep[] }> = [];
    const lines = mermaid
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

    let currentSection: { name: string; steps: ParsedJourneyStep[] } | null = null;
    let stepIndex = 0;

    for (const line of lines) {
        // Parse title
        if (line.startsWith('title ')) {
            // Title is handled separately
            continue;
        }

        // Parse sections
        if (line.startsWith('section ')) {
            if (currentSection) {
                sections.push(currentSection);
            }
            const sectionName = line.replace('section ', '').trim();
            currentSection = { name: sectionName, steps: [] };
        }

        // Parse steps
        if (currentSection && line.includes(':')) {
            const stepMatch = line.match(/^\s*([^:]+):\s*(\d+):\s*(.+)$/);
            if (stepMatch) {
                const [, action, scoreStr, actor] = stepMatch;
                currentSection.steps.push({
                    id: `step-${stepIndex++}`,
                    action: action.trim(),
                    score: parseInt(scoreStr),
                    actor: actor.trim(),
                });
            }
        }
    }

    if (currentSection) {
        sections.push(currentSection);
    }

    return {
        title: 'User Journey',
        sections,
    };
};

// Calculate layout for sequence diagram
const calculateSequenceLayout = (participants: ParsedParticipant[]): { x: number; y: number }[] => {
    const positions: { x: number; y: number }[] = [];
    const nodeWidth = 200;
    const spacing = 100;

    participants.forEach((_, index) => {
        positions.push({
            x: index * (nodeWidth + spacing),
            y: 0,
        });
    });

    return positions;
};

// Calculate layout for user journey
const calculateJourneyLayout = (sections: Array<{ name: string; steps: ParsedJourneyStep[] }>): { x: number; y: number }[] => {
    const positions: { x: number; y: number }[] = [];
    const nodeWidth = 300;
    const nodeHeight = 150;
    const spacing = 50;

    let currentY = 0;

    sections.forEach((section, sectionIndex) => {
        section.steps.forEach((_, stepIndex) => {
            positions.push({
                x: stepIndex * (nodeWidth + spacing),
                y: currentY,
            });
        });
        currentY += nodeHeight + spacing;
    });

    return positions;
};

export const useMermaidParser = (content: string, diagramType: 'sequence' | 'journey') => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const parseSchema = useCallback(async (contentText: string, type: 'sequence' | 'journey') => {
        if (!contentText.trim()) {
            setNodes([]);
            setEdges([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate async parsing
            await new Promise((resolve) => setTimeout(resolve, 100));

            if (type === 'sequence') {
                const schema = parseSequenceDiagram(contentText);
                const positions = calculateSequenceLayout(schema.participants);

                // Convert participants to React Flow nodes
                const flowNodes: Node[] = schema.participants.map((participant, index) => ({
                    id: participant.name,
                    type: 'default',
                    position: positions[index] || { x: 0, y: 0 },
                    data: {
                        label: participant.name,
                        type: participant.type,
                    },
                }));

                // Convert messages to React Flow edges
                const flowEdges: Edge[] = schema.messages.map((message) => ({
                    id: message.id,
                    source: message.from,
                    target: message.to,
                    label: message.message,
                    type: message.type === 'dashed' ? 'straight' : 'smoothstep',
                    animated: message.type === 'solid',
                    style: {
                        stroke: message.type === 'note' ? '#f59e0b' : '#6366f1',
                        strokeWidth: message.type === 'dashed' ? 1 : 2,
                        strokeDasharray: message.type === 'dashed' ? '5,5' : undefined,
                    },
                }));

                setNodes(flowNodes);
                setEdges(flowEdges);
            } else if (type === 'journey') {
                const schema = parseUserJourney(contentText);
                const positions = calculateJourneyLayout(schema.sections);

                // Convert journey steps to React Flow nodes
                const flowNodes: Node[] = [];
                const flowEdges: Edge[] = [];
                let nodeIndex = 0;

                schema.sections.forEach((section, sectionIndex) => {
                    section.steps.forEach((step, stepIndex) => {
                        const nodeId = `${section.name}-${step.id}`;

                        flowNodes.push({
                            id: nodeId,
                            type: 'default',
                            position: positions[nodeIndex] || { x: 0, y: 0 },
                            data: {
                                label: step.action,
                                section: section.name,
                                score: step.score,
                                actor: step.actor,
                            },
                        });

                        // Connect steps within the same section
                        if (stepIndex > 0) {
                            const prevNodeId = `${section.name}-${section.steps[stepIndex - 1].id}`;
                            flowEdges.push({
                                id: `edge-${prevNodeId}-${nodeId}`,
                                source: prevNodeId,
                                target: nodeId,
                                type: 'smoothstep',
                                style: {
                                    stroke: '#6366f1',
                                    strokeWidth: 2,
                                },
                            });
                        }

                        nodeIndex++;
                    });
                });

                setNodes(flowNodes);
                setEdges(flowEdges);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to parse ${type} diagram`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced parsing
    useEffect(() => {
        const timer = setTimeout(() => {
            parseSchema(content, diagramType);
        }, 300);

        return () => clearTimeout(timer);
    }, [content, diagramType, parseSchema]);

    return {
        nodes,
        edges,
        error,
        isLoading,
        parseSchema,
    };
};
