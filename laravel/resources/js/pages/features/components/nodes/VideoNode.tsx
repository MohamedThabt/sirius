import React from 'react';
import { type WireframeMode, getSelectionStyles, getStyles } from '../wireframe-styles';

interface VideoNodeProps {
    node: any;
    selectedNodeId: string | null;
    onSelectNode?: (id: string) => void;
    mode: WireframeMode;
}

export function VideoNode({ node, selectedNodeId, onSelectNode, mode }: VideoNodeProps) {
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
                width: '100%',
                maxWidth: 480,
                aspectRatio: '16/9',
                background: isPreview ? `linear-gradient(135deg, ${s.muted} 0%, ${s.accent} 50%, ${s.muted} 100%)` : s.muted,
                border: `1px solid ${s.border}`,
                borderRadius: s.radius.xl,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.mutedForeground,
                fontSize: s.fontSize.sm,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isPreview ? s.shadow.md : 'none',
                ...selectionStyle,
                cursor: 'pointer',
            }}
        >
            {/* Video Thumbnail Overlay */}
            {isPreview && (
                <>
                    {/* Fake video frame lines */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `
                            linear-gradient(${s.border} 1px, transparent 1px),
                            linear-gradient(90deg, ${s.border} 1px, transparent 1px)
                        `,
                            backgroundSize: '40px 40px',
                            opacity: 0.1,
                        }}
                    />

                    {/* Duration badge */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: s.spacing.sm,
                            right: s.spacing.sm,
                            padding: `${s.spacing.xs}px ${s.spacing.sm}px`,
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            borderRadius: s.radius.sm,
                            fontSize: s.fontSize.xs,
                            fontWeight: s.fontWeight.medium,
                        }}
                    >
                        3:45
                    </div>
                </>
            )}

            {/* Play Button */}
            <div
                style={{
                    width: isPreview ? 64 : 48,
                    height: isPreview ? 64 : 48,
                    borderRadius: s.radius.full,
                    background: isPreview ? 'rgba(0,0,0,0.6)' : s.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isPreview ? s.shadow.lg : s.shadow.sm,
                    border: isPreview ? '2px solid rgba(255,255,255,0.3)' : `1px solid ${s.border}`,
                    transition: s.transition.fast,
                }}
            >
                <span
                    style={{
                        fontSize: isPreview ? 24 : 18,
                        marginLeft: isPreview ? 4 : 2,
                        color: isPreview ? '#fff' : s.mutedForeground,
                    }}
                >
                    ▶
                </span>
            </div>

            {/* Label for wireframe mode */}
            {!isPreview && (
                <span
                    style={{
                        position: 'absolute',
                        bottom: s.spacing.sm,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: s.fontSize.xs,
                        color: s.mutedForeground,
                    }}
                >
                    Video Player
                </span>
            )}
        </div>
    );
}
