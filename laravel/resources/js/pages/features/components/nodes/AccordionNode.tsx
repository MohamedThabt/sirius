import React, { useState } from 'react';
import { type WireframeMode, getStyles, getSelectionStyles } from '../wireframe-styles';

interface AccordionNodeProps {
    node: any;
    selectedNodeId: string | null;
    onSelectNode?: (id: string) => void;
    mode: WireframeMode;
    renderChildren: (children: any[], mode: WireframeMode) => React.ReactNode;
}

export function AccordionNode({ node, selectedNodeId, onSelectNode, mode, renderChildren }: AccordionNodeProps) {
    const s = getStyles(mode);
    const isPreview = mode === 'preview';
    const isSelected = node.id === selectedNodeId;
    const selectionStyle = getSelectionStyles(isSelected, mode);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    const toggleItem = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const items = node.itemsMap || [
        { id: 'a', label: 'Section A' },
        { id: 'b', label: 'Section B' },
    ];

    return (
        <div 
            onClick={handleSelect} 
            style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: isPreview ? 0 : s.spacing.sm,
                border: isPreview ? `1px solid ${s.border}` : 'none',
                borderRadius: isPreview ? s.radius.lg : 0,
                overflow: 'hidden',
                boxShadow: isPreview ? s.shadow.sm : 'none',
                ...selectionStyle, 
                cursor: 'pointer',
            }}
        >
            {items.map((it: any, index: number) => {
                const isExpanded = expandedItems.has(index);
                const isFirst = index === 0;
                const isLast = index === items.length - 1;
                
                return (
                    <div 
                        key={`${it.id}-${index}`} 
                        style={{ 
                            border: isPreview ? 'none' : `1px solid ${s.border}`, 
                            borderTop: isPreview && !isFirst ? `1px solid ${s.border}` : undefined,
                            borderRadius: isPreview ? 0 : s.radius.lg,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <button
                            onClick={(e) => toggleItem(index, e)}
                            style={{ 
                                width: '100%',
                                padding: `${s.spacing.md}px ${s.spacing.lg}px`, 
                                background: isPreview 
                                    ? (isExpanded ? s.muted : s.card)
                                    : s.muted, 
                                fontWeight: s.fontWeight.medium, 
                                color: s.foreground, 
                                fontSize: s.fontSize.sm,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: s.transition.fast,
                            }}
                        >
                            <span>{it.label || `Section ${index + 1}`}</span>
                            <span style={{ 
                                color: s.mutedForeground, 
                                fontSize: s.fontSize.sm,
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: s.transition.fast,
                            }}>
                                ▼
                            </span>
                        </button>
                        
                        {/* Content */}
                        <div style={{ 
                            padding: isExpanded ? s.spacing.lg : 0,
                            maxHeight: isExpanded ? 500 : 0,
                            overflow: 'hidden',
                            background: s.card,
                            transition: isPreview ? s.transition.normal : 'none',
                            opacity: isExpanded ? 1 : 0,
                        }}>
                            {(Array.isArray(it.content) ? it.content : [it.content])
                                .filter(Boolean)
                                .map((child: any, childIndex: number) => (
                                    <div key={`${child.id || `child-${childIndex}`}-${index}`}>
                                        {renderChildren([child], mode)}
                                    </div>
                                ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
