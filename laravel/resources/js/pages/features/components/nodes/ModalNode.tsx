import React from 'react';
import { type WireframeMode, getStyles, getSelectionStyles } from '../wireframe-styles';

interface ModalNodeProps {
    node: any;
    selectedNodeId: string | null;
    onSelectNode?: (id: string) => void;
    mode: WireframeMode;
    renderChildren: (children: any[], mode: WireframeMode) => React.ReactNode;
}

export function ModalNode({ node, selectedNodeId, onSelectNode, mode, renderChildren }: ModalNodeProps) {
    const s = getStyles(mode);
    const isPreview = mode === 'preview';
    const isSelected = node.id === selectedNodeId;
    const selectionStyle = getSelectionStyles(isSelected, mode);

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    return (
        <div 
            onClick={handleSelect} 
            style={{ 
                position: 'relative', 
                ...selectionStyle, 
                cursor: 'pointer',
            }}
        >
            {/* Backdrop */}
            <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: isPreview ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)', 
                borderRadius: s.radius.lg,
                backdropFilter: isPreview ? 'blur(4px)' : 'none',
                transition: s.transition.normal,
            }} />
            
            {/* Modal Content */}
            <div
                style={{
                    position: 'relative',
                    margin: `${s.spacing.xl * 1.5}px auto`,
                    maxWidth: 520,
                    border: `1px solid ${s.border}`,
                    borderRadius: s.radius.xl,
                    background: s.card,
                    padding: 0,
                    boxShadow: isPreview ? s.shadow.lg : s.shadow.sm,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${s.spacing.md}px ${s.spacing.lg}px`,
                    borderBottom: `1px solid ${s.border}`,
                    background: isPreview ? s.muted : 'transparent',
                }}>
                    <div style={{ 
                        fontWeight: s.fontWeight.semibold, 
                        fontSize: s.fontSize.lg, 
                        color: s.foreground,
                    }}>
                        {node.title || 'Modal Title'}
                    </div>
                    <button
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: s.radius.md,
                            border: 'none',
                            background: isPreview ? s.accent : s.muted,
                            color: s.mutedForeground,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 16,
                            transition: s.transition.fast,
                        }}
                    >
                        ×
                    </button>
                </div>
                
                {/* Body */}
                <div style={{ padding: s.spacing.lg }}>
                    {renderChildren(node.children || [], mode)}
                </div>
                
                {/* Footer (optional) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: s.spacing.sm,
                    padding: `${s.spacing.md}px ${s.spacing.lg}px`,
                    borderTop: `1px solid ${s.border}`,
                    background: isPreview ? s.muted : 'transparent',
                }}>
                    <button
                        style={{
                            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                            borderRadius: s.radius.md,
                            border: `1px solid ${s.border}`,
                            background: 'transparent',
                            color: s.foreground,
                            fontSize: s.fontSize.sm,
                            fontWeight: s.fontWeight.medium,
                            cursor: 'pointer',
                            transition: s.transition.fast,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        style={{
                            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                            borderRadius: s.radius.md,
                            border: 'none',
                            background: isPreview ? s.primary : s.mutedForeground,
                            color: isPreview ? s.primaryForeground : s.background,
                            fontSize: s.fontSize.sm,
                            fontWeight: s.fontWeight.medium,
                            cursor: 'pointer',
                            transition: s.transition.fast,
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
