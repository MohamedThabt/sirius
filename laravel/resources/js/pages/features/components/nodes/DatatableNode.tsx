import React from 'react';
import { type WireframeMode, getStyles, getSelectionStyles } from '../wireframe-styles';

interface DatatableNodeProps {
    node: any;
    selectedNodeId: string | null;
    onSelectNode?: (id: string) => void;
    mode: WireframeMode;
}

export function DatatableNode({ node, selectedNodeId, onSelectNode, mode }: DatatableNodeProps) {
    const s = getStyles(mode);
    const isPreview = mode === 'preview';
    const isSelected = node.id === selectedNodeId;
    const selectionStyle = getSelectionStyles(isSelected, mode);

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    const columns =
        node.columns && node.columns.length > 0
            ? node.columns
            : Array.isArray(node.rows) && node.rows.length > 0
              ? Array.isArray(node.rows[0])
                  ? (node.rows[0] as any[]).map((_: any, idx: number) => `Col ${idx + 1}`)
                  : Object.keys(node.rows[0] as Record<string, any>)
              : [];

    const rows = Array.isArray(node.rows) ? node.rows : [];

    const getCell = (row: any, idx: number, key?: string) => {
        if (Array.isArray(row)) return row[idx];
        if (key) return row[key];
        return '';
    };

    return (
        <div onClick={handleSelect} style={{ ...selectionStyle, cursor: 'pointer', width: '100%' }}>
            <div style={{ 
                overflowX: 'auto', 
                border: `1px solid ${s.border}`, 
                borderRadius: s.radius.lg, 
                background: s.card,
                boxShadow: isPreview ? s.shadow.md : 'none',
            }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                        <tr>
                            {columns.map((col: string, idx: number) => (
                                <th
                                    key={col}
                                    style={{
                                        textAlign: 'left',
                                        padding: `${s.spacing.md}px ${s.spacing.lg}px`,
                                        borderBottom: `2px solid ${s.border}`,
                                        background: isPreview ? s.muted : s.muted,
                                        fontWeight: s.fontWeight.semibold,
                                        fontSize: s.fontSize.xs,
                                        color: s.foreground,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: s.spacing.xs }}>
                                        {col}
                                        {isPreview && (
                                            <span style={{ opacity: 0.5, fontSize: 10 }}>↕</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row: any, rIdx: number) => (
                            <tr 
                                key={rIdx}
                                style={{
                                    background: isPreview && rIdx % 2 === 1 ? `${s.muted}50` : 'transparent',
                                    transition: s.transition.fast,
                                }}
                            >
                                {columns.map((col: string, cIdx: number) => (
                                    <td 
                                        key={col + cIdx} 
                                        style={{ 
                                            padding: `${s.spacing.md}px ${s.spacing.lg}px`, 
                                            borderBottom: `1px solid ${s.border}`, 
                                            fontSize: s.fontSize.sm, 
                                            color: s.foreground,
                                        }}
                                    >
                                        {getCell(row, cIdx, col) ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td 
                                    colSpan={Math.max(columns.length, 1)} 
                                    style={{ 
                                        padding: s.spacing.xl, 
                                        fontSize: s.fontSize.sm, 
                                        color: s.mutedForeground,
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s.spacing.sm }}>
                                        <span style={{ fontSize: 24, opacity: 0.5 }}>📋</span>
                                        <span>No data available</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Table Footer with pagination hint */}
            {isPreview && rows.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                    fontSize: s.fontSize.xs,
                    color: s.mutedForeground,
                    borderTop: `1px solid ${s.border}`,
                    background: s.muted,
                    borderRadius: `0 0 ${s.radius.lg} ${s.radius.lg}`,
                    marginTop: -1,
                }}>
                    <span>Showing {rows.length} of {rows.length} results</span>
                    <div style={{ display: 'flex', gap: s.spacing.xs }}>
                        <button style={{
                            padding: `${s.spacing.xs}px ${s.spacing.sm}px`,
                            borderRadius: s.radius.sm,
                            border: `1px solid ${s.border}`,
                            background: 'transparent',
                            fontSize: s.fontSize.xs,
                            color: s.mutedForeground,
                            cursor: 'pointer',
                        }}>
                            Previous
                        </button>
                        <button style={{
                            padding: `${s.spacing.xs}px ${s.spacing.sm}px`,
                            borderRadius: s.radius.sm,
                            border: `1px solid ${s.border}`,
                            background: 'transparent',
                            fontSize: s.fontSize.xs,
                            color: s.mutedForeground,
                            cursor: 'pointer',
                        }}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
