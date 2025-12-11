import React, { useState } from 'react';
import { type WireframeMode, getStyles, getSelectionStyles } from '../wireframe-styles';

interface TabsNodeProps {
    node: any;
    selectedNodeId: string | null;
    onSelectNode?: (id: string) => void;
    mode: WireframeMode;
    renderChildren: (children: any[], mode: WireframeMode) => React.ReactNode;
}

export function TabsNode({ node, selectedNodeId, onSelectNode, mode, renderChildren }: TabsNodeProps) {
    const s = getStyles(mode);
    const isPreview = mode === 'preview';
    const isSelected = node.id === selectedNodeId;
    const selectionStyle = getSelectionStyles(isSelected, mode);
    const [activeTab, setActiveTab] = useState(0);

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    const items = node.itemsMap || [
        { id: 'one', label: 'Tab One' },
        { id: 'two', label: 'Tab Two' },
    ];

    return (
        <div onClick={handleSelect} style={{ ...selectionStyle, cursor: 'pointer' }}>
            {/* Tab Headers */}
            <div style={{ 
                display: 'flex', 
                gap: isPreview ? 0 : s.spacing.xs, 
                borderBottom: `1px solid ${s.border}`,
                background: isPreview ? s.muted : 'transparent',
                borderRadius: isPreview ? `${s.radius.lg} ${s.radius.lg} 0 0` : 0,
                padding: isPreview ? `${s.spacing.xs}px ${s.spacing.xs}px 0` : 0,
            }}>
                {items.map((it: any, index: number) => {
                    const isActive = index === activeTab;
                    return (
                        <button 
                            key={`${it.id}-${index}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab(index);
                            }}
                            style={{ 
                                padding: `${s.spacing.sm}px ${s.spacing.lg}px`, 
                                borderRadius: isPreview 
                                    ? `${s.radius.md} ${s.radius.md} 0 0`
                                    : s.radius.md,
                                border: isPreview 
                                    ? isActive 
                                        ? `1px solid ${s.border}`
                                        : '1px solid transparent'
                                    : `1px solid ${isActive ? s.border : 'transparent'}`,
                                borderBottom: isPreview && isActive ? `1px solid ${s.card}` : undefined,
                                marginBottom: isPreview && isActive ? -1 : 0,
                                background: isActive 
                                    ? (isPreview ? s.card : s.muted) 
                                    : 'transparent', 
                                color: isActive ? s.foreground : s.mutedForeground, 
                                fontSize: s.fontSize.sm,
                                fontWeight: isActive ? s.fontWeight.medium : s.fontWeight.normal,
                                transition: s.transition.fast,
                                cursor: 'pointer',
                                position: 'relative',
                            }}
                        >
                            {it.label || `Tab ${index + 1}`}
                            {isPreview && isActive && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: s.spacing.sm,
                                    right: s.spacing.sm,
                                    height: 2,
                                    background: s.primary,
                                    borderRadius: s.radius.full,
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>
            
            {/* Tab Content */}
            <div style={{ 
                border: `1px solid ${s.border}`,
                borderTop: 'none',
                borderRadius: isPreview ? `0 0 ${s.radius.lg} ${s.radius.lg}` : s.radius.lg, 
                padding: s.spacing.lg, 
                background: s.card,
                boxShadow: isPreview ? s.shadow.sm : 'none',
                minHeight: 100,
            }}>
                {renderChildren(node.children || [], mode)}
            </div>
        </div>
    );
}
