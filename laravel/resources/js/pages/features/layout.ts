import type { Edge, Node } from '@xyflow/react';

const NODE_WIDTH = 320;
const NODE_HEIGHT = 120;
const H_SPACING = 40;
const V_SPACING = 60;

// Simple, dependency-free layout: top-to-bottom levels based on edges
export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const idToNode = new Map(nodes.map((n) => [n.id, n]));
    const indegree = new Map<string, number>();
    const children = new Map<string, string[]>();

    nodes.forEach((n) => {
        indegree.set(n.id, 0);
        children.set(n.id, []);
    });
    edges.forEach((e) => {
        indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
        children.get(e.source)?.push(e.target);
    });

    // Find roots (no incoming edges)
    const queue: string[] = nodes.map((n) => n.id).filter((id) => (indegree.get(id) || 0) === 0);
    const level = new Map<string, number>();
    queue.forEach((id) => level.set(id, 0));

    // BFS to assign levels
    for (let i = 0; i < queue.length; i++) {
        const cur = queue[i];
        const nextLevel = (level.get(cur) || 0) + 1;
        for (const ch of children.get(cur) || []) {
            if (!level.has(ch)) {
                level.set(ch, nextLevel);
                queue.push(ch);
            }
        }
    }

    // Group by level
    const levelToIds = new Map<number, string[]>();
    nodes.forEach((n) => {
        const l = level.get(n.id) ?? 0;
        if (!levelToIds.has(l)) levelToIds.set(l, []);
        levelToIds.get(l)!.push(n.id);
    });

    // Position nodes per level, horizontally spaced
    const levels = Array.from(levelToIds.keys()).sort((a, b) => a - b);
    levels.forEach((l, idx) => {
        const ids = levelToIds.get(l)!;
        const totalWidth = ids.length * NODE_WIDTH + (ids.length - 1) * H_SPACING;
        let x = -totalWidth / 2;
        const y = idx * (NODE_HEIGHT + V_SPACING);
        ids.forEach((id) => {
            const node = idToNode.get(id)!;
            node.position = { x, y };
            x += NODE_WIDTH + H_SPACING;
        });
    });

    return { nodes, edges };
};
