import React from 'react';
import { BaseNodeProps, useSelection } from './types';

export function TextNode({ node, selectedNodeId, onSelectNode }: BaseNodeProps) {
    const { selectionStyle } = useSelection(node, selectedNodeId);
    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    return (
        <p onClick={handleSelect} className={node.className} style={{ margin: 0, lineHeight: 1.6, cursor: 'pointer', ...selectionStyle }}>
            {node.text || 'Lorem ipsum dolor sit amet.'}
        </p>
    );
}
