import React from 'react';
import { WireframeRenderer } from '../WireframeRenderer';
import { BaseNodeProps, baseBorder, useSelection } from './types';

export function ContainerNode({ node, selectedNodeId, onSelectNode }: BaseNodeProps) {
    const { selectionStyle } = useSelection(node, selectedNodeId);
    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    const layoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: node.layout || 'column',
        gap: '16px',
        padding: node.type === 'page' ? '24px' : '16px',
        border: baseBorder(),
        width: '100%',
        borderRadius: 10,
        background: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
        cursor: 'pointer',
    };

    const style: React.CSSProperties = {
        ...layoutStyle,
        boxShadow:
            node.type === 'page'
                ? '0 1px 0 0 hsl(var(--border)) inset'
                : node.className?.includes('profile-card-wrapper')
                  ? '0 10px 30px rgba(0,0,0,0.08)'
                  : undefined,
        maxWidth: node.type === 'page' ? 960 : undefined,
        margin: node.type === 'page' ? '0 auto' : undefined,
        ...selectionStyle,
    };

    return (
        <div className="wireframe-node relative" onClick={handleSelect} style={style} className={node.className}>
            {node.type === 'page' && (
                <div className="info-overlay absolute -top-5 left-0 rounded bg-blue-500 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity">
                    {node.type}: {node.id}
                </div>
            )}
            {(node.children || []).map((child: any) => (
                <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
            ))}
        </div>
    );
}
