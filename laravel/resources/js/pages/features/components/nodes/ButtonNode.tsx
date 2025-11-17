import { Button } from '@/components/ui/button';
import React from 'react';
import { BaseNodeProps, useSelection } from './types';

export function ButtonNode({ node, selectedNodeId, onSelectNode }: BaseNodeProps) {
    const { isSelected, selectionStyle } = useSelection(node, selectedNodeId);
    const isSecondary = node.className?.includes('button-secondary');
    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    return (
        <div onClick={handleSelect} className={`inline-block ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} style={selectionStyle}>
            <Button variant={isSecondary ? 'outline' : 'default'} disabled>
                {node.text || 'Button'}
            </Button>
        </div>
    );
}
