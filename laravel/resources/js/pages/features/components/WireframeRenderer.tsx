import React from 'react';
import { getSelectionStyles, getStyles, headingStyles, type WireframeMode } from './wireframe-styles';

type FieldDef = { name: string; type: 'text' | 'email' | 'password' };

export type SchemaNode = {
    id: string;
    type:
        | 'page'
        | 'container'
        | 'section'
        | 'grid'
        | 'card'
        | 'navbar'
        | 'hero'
        | 'form'
        | 'footer'
        | 'button'
        | 'link'
        | 'heading'
        | 'divider'
        | 'spacer'
        | 'input'
        | 'textarea'
        | 'select'
        | 'checkbox'
        | 'radio-group'
        | 'switch'
        | 'datepicker'
        | 'tabs'
        | 'accordion'
        | 'modal'
        | 'video'
        | 'icon'
        | 'breadcrumb'
        | 'pagination'
        | 'progress'
        | 'skeleton'
        | 'text'
        | 'image'
        | 'datatable';
    layout?: 'row' | 'column';
    className?: string;
    title?: string;
    button?: string;
    submit?: string;
    text?: string;
    items?: string[];
    fields?: FieldDef[];
    onClick?: { action: 'navigateTo'; targetId: string };
    children?: SchemaNode[];
    // Optional for datatable
    columns?: string[];
    rows?: Array<Record<string, any> | any[]>;
    // Optional for input (e.g. dropdown)
    options?: string[];
    // For grid
    columnsCount?: number;
    gap?: number;
    // For heading
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    // For tabs/accordion
    itemsMap?: Array<{ id: string; label: string; content?: SchemaNode | SchemaNode[] }>;
    // For modal
    open?: boolean;
    // For video/icon
    src?: string;
    name?: string;
    // For breadcrumb
    crumbs?: Array<{ label: string; href?: string }>;
    // For pagination
    total?: number;
    page?: number;
    // For progress
    value?: number;
    // For skeleton
    width?: number | string;
    height?: number | string;
};

interface Props {
    node: SchemaNode;
    selectedNodeId?: string | null;
    onSelectNode?: (id: string) => void;
    mode?: WireframeMode;
}

export function WireframeRenderer({ node, selectedNodeId = null, onSelectNode, mode = 'wireframe' }: Props) {
    if (!node) return null;

    // Get styles based on mode
    const s = getStyles(mode);
    const isPreview = mode === 'preview';

    const layoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: node.layout || 'column',
        gap: s.spacing.sm,
        padding: node.type === 'page' ? s.spacing.lg : s.spacing.sm,
        border: `1px solid ${s.border}`,
        width: '100%',
        borderRadius: s.radius.lg,
        background: s.background,
        color: s.foreground,
        fontFamily: s.fontFamily,
        transition: s.transition.fast,
    };

    const isSelected = node.id === selectedNodeId;
    const selectionStyle = getSelectionStyles(isSelected, mode);
    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
    };

    const renderNode = () => {
        switch (node.type) {
            case 'page':
            case 'container':
            case 'section':
            case 'card':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            ...layoutStyle,
                            background: node.type === 'card' ? s.card : s.background,
                            boxShadow: node.type === 'card' && isPreview ? s.shadow.md : 'none',
                            border: isPreview && node.type === 'card' ? `1px solid transparent` : `1px solid ${s.border}`,
                            borderImage: isPreview && node.type === 'card' ? `linear-gradient(135deg, ${s.border}, transparent) 1` : undefined,
                            maxWidth: node.type === 'page' ? 960 : undefined,
                            margin: node.type === 'page' ? '0 auto' : undefined,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        className={node.className}
                    >
                        {node.type === 'page' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: s.spacing.sm }}>
                                <div
                                    style={{
                                        fontSize: s.fontSize.xs,
                                        opacity: 0.6,
                                        fontWeight: isPreview ? s.fontWeight.medium : s.fontWeight.normal,
                                    }}
                                >
                                    {node.id}
                                </div>
                                <div
                                    style={{
                                        width: 80,
                                        height: 6,
                                        borderRadius: s.radius.full,
                                        background: isPreview ? `linear-gradient(90deg, ${s.primary}, ${s.accent})` : s.muted,
                                    }}
                                />
                            </div>
                        )}
                        {(node.children || []).map((child) => (
                            <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} mode={mode} />
                        ))}
                    </div>
                );

            case 'grid': {
                const columns = Math.max((node as any).columnsCount ?? 2, 1);
                const gap = (node as any).gap ?? 16;
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            gap: Math.min(gap || 8, s.spacing.sm),
                            padding: s.spacing.sm,
                            border: `1px solid ${s.border}`,
                            borderRadius: s.radius.lg,
                            background: s.background,
                            transition: s.transition.fast,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        className={(node as any).className}
                    >
                        {(node.children || []).map((child) => (
                            <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} mode={mode} />
                        ))}
                    </div>
                );
            }

            case 'navbar':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            gap: s.spacing.md,
                            padding: `${s.spacing.sm}px ${s.spacing.lg}px`,
                            border: isPreview ? 'none' : `1px solid ${s.border}`,
                            background: isPreview ? s.card : s.muted,
                            borderRadius: s.radius.lg,
                            alignItems: 'center',
                            boxShadow: isPreview ? s.shadow.md : 'none',
                            backdropFilter: isPreview ? 'blur(8px)' : 'none',
                            transition: s.transition.fast,
                            cursor: 'pointer',
                            ...selectionStyle,
                        }}
                    >
                        {(node.items || []).map((item, idx) => (
                            <span
                                key={item}
                                style={{
                                    fontWeight: idx === 0 ? s.fontWeight.bold : s.fontWeight.medium,
                                    fontSize: s.fontSize.sm,
                                    color: idx === 0 ? s.foreground : s.mutedForeground,
                                }}
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                );

            case 'hero':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            ...layoutStyle,
                            alignItems: 'center',
                            textAlign: 'center',
                            background: isPreview ? `linear-gradient(135deg, ${s.muted} 0%, ${s.background} 50%, ${s.accent} 100%)` : s.muted,
                            padding: `${s.spacing.xl * 2.5}px ${s.spacing.lg}px`,
                            borderRadius: s.radius.xl,
                            boxShadow: isPreview ? s.shadow.lg : 'none',
                            border: isPreview ? 'none' : `1px solid ${s.border}`,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        className={node.className}
                    >
                        <h1
                            style={{
                                margin: 0,
                                fontSize: isPreview ? '2.75rem' : '1.5rem',
                                fontWeight: s.fontWeight.bold,
                                color: s.foreground,
                                lineHeight: 1.1,
                                letterSpacing: isPreview ? '-0.02em' : 'normal',
                                textShadow: isPreview ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            }}
                        >
                            {node.title || 'Hero Title'}
                        </h1>
                        {node.button && (
                            <button
                                disabled
                                style={{
                                    marginTop: s.spacing.xl,
                                    padding: `${s.spacing.md}px ${s.spacing.xl}px`,
                                    borderRadius: isPreview ? s.radius.lg : s.radius.md,
                                    border: isPreview ? 'none' : `1px solid ${s.border}`,
                                    background: isPreview
                                        ? `linear-gradient(135deg, ${s.primary}, color-mix(in srgb, ${s.primary} 85%, ${s.foreground}))`
                                        : 'transparent',
                                    color: isPreview ? s.primaryForeground : s.foreground,
                                    fontSize: s.fontSize.base,
                                    fontWeight: s.fontWeight.semibold,
                                    cursor: 'pointer',
                                    transition: s.transition.fast,
                                    boxShadow: isPreview ? `0 4px 14px 0 color-mix(in srgb, ${s.primary} 40%, transparent)` : 'none',
                                }}
                            >
                                {node.button}
                            </button>
                        )}
                        {(node.children || []).map((child) => (
                            <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} mode={mode} />
                        ))}
                    </div>
                );

            case 'heading': {
                const level = (node as any).level ?? 2;
                const Tag = `h${Math.min(Math.max(level, 1), 6)}` as unknown as keyof JSX.IntrinsicElements;
                const headingStyle = headingStyles[level as keyof typeof headingStyles] || headingStyles[2];
                return (
                    <Tag
                        onClick={handleSelect}
                        className={(node as any).className}
                        style={{
                            margin: 0,
                            fontSize: headingStyle.fontSize,
                            fontWeight: headingStyle.fontWeight,
                            lineHeight: headingStyle.lineHeight,
                            color: s.foreground,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        {node.text || 'Heading'}
                    </Tag>
                );
            }

            case 'link':
                return (
                    <a
                        onClick={handleSelect}
                        className={(node as any).className}
                        style={{
                            color: isPreview ? s.primary : s.foreground,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: s.fontSize.sm,
                            fontWeight: s.fontWeight.medium,
                            transition: s.transition.fast,
                            ...selectionStyle,
                        }}
                    >
                        {node.text || 'Link'}
                    </a>
                );

            case 'divider':
                return (
                    <hr
                        onClick={handleSelect}
                        style={{
                            border: 0,
                            borderTop: `1px solid ${s.border}`,
                            margin: `${s.spacing.sm}px 0`,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    />
                );

            case 'spacer':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            height: (node as any).height ?? s.spacing.lg,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    />
                );

            case 'image':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: s.radius.lg,
                            overflow: 'hidden',
                            border: `1px solid ${s.border}`,
                            background: isPreview ? `linear-gradient(135deg, ${s.muted} 0%, ${s.accent} 100%)` : s.muted,
                            color: s.mutedForeground,
                            fontSize: s.fontSize.xs,
                            fontWeight: s.fontWeight.medium,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        {isPreview ? '🖼️' : 'Image'}
                    </div>
                );

            case 'form':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: s.spacing.md,
                            padding: s.spacing.lg,
                            border: `1px solid ${s.border}`,
                            borderRadius: s.radius.lg,
                            background: s.card,
                            boxShadow: isPreview ? s.shadow.sm : 'none',
                            cursor: 'pointer',
                            transition: s.transition.fast,
                            ...selectionStyle,
                        }}
                    >
                        <h4
                            style={{
                                margin: 0,
                                fontSize: s.fontSize.lg,
                                fontWeight: s.fontWeight.semibold,
                                color: s.foreground,
                            }}
                        >
                            Form
                        </h4>
                        {(node.fields || []).map((field) => (
                            <div key={field.name}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: s.spacing.xs,
                                        fontSize: s.fontSize.sm,
                                        fontWeight: s.fontWeight.medium,
                                        color: s.foreground,
                                    }}
                                >
                                    {field.name}
                                </label>
                                <input
                                    type={field.type}
                                    placeholder={field.name}
                                    disabled
                                    style={{
                                        width: '100%',
                                        maxWidth: 280,
                                        padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                                        borderRadius: s.radius.md,
                                        border: `1px solid ${s.border}`,
                                        background: s.background,
                                        fontSize: s.fontSize.sm,
                                        transition: s.transition.fast,
                                    }}
                                />
                            </div>
                        ))}
                        {node.submit && (
                            <button
                                disabled
                                style={{
                                    width: '100%',
                                    maxWidth: 280,
                                    padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                                    borderRadius: s.radius.md,
                                    border: isPreview ? 'none' : `1px solid ${s.border}`,
                                    background: isPreview ? s.primary : 'transparent',
                                    color: isPreview ? s.primaryForeground : s.foreground,
                                    fontSize: s.fontSize.sm,
                                    fontWeight: s.fontWeight.medium,
                                    cursor: 'pointer',
                                    transition: s.transition.fast,
                                }}
                            >
                                {node.submit}
                            </button>
                        )}
                    </div>
                );

            case 'button':
                return (
                    <button
                        onClick={handleSelect}
                        disabled
                        style={{
                            padding: `${s.spacing.sm}px ${s.spacing.lg}px`,
                            borderRadius: isPreview ? s.radius.lg : s.radius.md,
                            border: isPreview ? 'none' : `1px solid ${s.border}`,
                            background: isPreview
                                ? `linear-gradient(135deg, ${s.primary}, color-mix(in srgb, ${s.primary} 85%, ${s.foreground}))`
                                : 'transparent',
                            color: isPreview ? s.primaryForeground : s.foreground,
                            cursor: 'pointer',
                            fontSize: s.fontSize.sm,
                            fontWeight: s.fontWeight.semibold,
                            transition: s.transition.fast,
                            boxShadow: isPreview ? `0 2px 8px 0 color-mix(in srgb, ${s.primary} 30%, transparent)` : 'none',
                            letterSpacing: isPreview ? '0.01em' : 'normal',
                            ...selectionStyle,
                        }}
                        className={(node as any).className}
                    >
                        {node.text || 'Button'}
                    </button>
                );

            case 'text':
                return (
                    <p
                        onClick={handleSelect}
                        className={(node as any).className}
                        style={{
                            margin: 0,
                            lineHeight: s.lineHeight.relaxed,
                            fontSize: s.fontSize.sm,
                            color: s.foreground,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        {node.text || 'Lorem ipsum dolor sit amet.'}
                    </p>
                );

            case 'input': {
                const isCheckbox = (node as any).className?.includes('checkbox');
                const isDropdown = (node as any).className?.includes('dropdown');

                if (isCheckbox) {
                    return (
                        <label
                            onClick={handleSelect}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: s.spacing.sm,
                                cursor: 'pointer',
                                fontSize: s.fontSize.sm,
                                color: s.foreground,
                                ...selectionStyle,
                            }}
                        >
                            <input
                                type="checkbox"
                                disabled
                                style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: s.radius.sm,
                                    border: `1px solid ${s.border}`,
                                    accentColor: isPreview ? s.primary : undefined,
                                }}
                            />
                            <span>{node.text || 'Checkbox'}</span>
                        </label>
                    );
                }

                if (isDropdown) {
                    const options = (node as any).options && Array.isArray((node as any).options) ? (node as any).options : [];
                    return (
                        <select
                            onClick={handleSelect}
                            disabled
                            className={(node as any).className}
                            style={{
                                padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                                borderRadius: s.radius.md,
                                border: `1px solid ${s.border}`,
                                minWidth: 200,
                                background: s.background,
                                color: s.foreground,
                                fontSize: s.fontSize.sm,
                                transition: s.transition.fast,
                                ...selectionStyle,
                                cursor: 'pointer',
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>
                                {node.text || 'Select'}
                            </option>
                            {options.map((opt: string, index: number) => (
                                <option key={`${opt}-${index}`} value={opt}>
                                    {typeof opt === 'string' ? opt : String(opt)}
                                </option>
                            ))}
                        </select>
                    );
                }

                return (
                    <input
                        onClick={handleSelect}
                        type="text"
                        placeholder={node.text || 'Input'}
                        disabled
                        className={(node as any).className}
                        style={{
                            width: '100%',
                            maxWidth: 280,
                            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                            borderRadius: isPreview ? s.radius.lg : s.radius.md,
                            border: `1px solid ${s.border}`,
                            background: isPreview ? `color-mix(in srgb, ${s.background} 98%, ${s.foreground})` : s.background,
                            color: s.foreground,
                            fontSize: s.fontSize.sm,
                            transition: s.transition.fast,
                            boxShadow: isPreview ? `inset 0 1px 2px rgba(0,0,0,0.05)` : 'none',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    />
                );
            }

            case 'textarea':
                return (
                    <textarea
                        onClick={handleSelect}
                        placeholder={node.text || 'Textarea'}
                        disabled
                        className={(node as any).className}
                        style={{
                            width: '100%',
                            maxWidth: 360,
                            height: 100,
                            padding: `${s.spacing.md}px`,
                            borderRadius: isPreview ? s.radius.lg : s.radius.md,
                            border: `1px solid ${s.border}`,
                            background: isPreview ? `color-mix(in srgb, ${s.background} 98%, ${s.foreground})` : s.background,
                            color: s.foreground,
                            fontSize: s.fontSize.sm,
                            resize: 'none',
                            transition: s.transition.fast,
                            boxShadow: isPreview ? `inset 0 1px 2px rgba(0,0,0,0.05)` : 'none',
                            lineHeight: s.lineHeight.relaxed,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    />
                );

            case 'select': {
                const options = (node as any).options && Array.isArray((node as any).options) ? (node as any).options : [];
                return (
                    <select
                        onClick={handleSelect}
                        disabled
                        className={(node as any).className}
                        style={{
                            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                            borderRadius: s.radius.md,
                            border: `1px solid ${s.border}`,
                            minWidth: 200,
                            background: s.background,
                            color: s.foreground,
                            fontSize: s.fontSize.sm,
                            transition: s.transition.fast,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            {node.text || 'Select'}
                        </option>
                        {options.map((opt: string, index: number) => (
                            <option key={`${opt}-${index}`} value={opt}>
                                {typeof opt === 'string' ? opt : String(opt)}
                            </option>
                        ))}
                    </select>
                );
            }

            case 'checkbox':
                return (
                    <label
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: s.spacing.sm,
                            cursor: 'pointer',
                            fontSize: s.fontSize.sm,
                            color: s.foreground,
                            ...selectionStyle,
                        }}
                    >
                        <input
                            type="checkbox"
                            disabled
                            style={{
                                width: 16,
                                height: 16,
                                borderRadius: s.radius.sm,
                                accentColor: isPreview ? s.primary : undefined,
                            }}
                        />
                        <span>{node.text || 'Checkbox'}</span>
                    </label>
                );

            case 'radio-group': {
                const options = (node as any).options && Array.isArray((node as any).options) ? (node as any).options : ['Option A', 'Option B'];
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: s.spacing.sm,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        {options.map((opt: string, index: number) => (
                            <label
                                key={`${opt}-${index}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: s.spacing.sm,
                                    fontSize: s.fontSize.sm,
                                    color: s.foreground,
                                }}
                            >
                                <input
                                    type="radio"
                                    disabled
                                    style={{
                                        width: 16,
                                        height: 16,
                                        accentColor: isPreview ? s.primary : undefined,
                                    }}
                                />
                                <span>{typeof opt === 'string' ? opt : String(opt)}</span>
                            </label>
                        ))}
                    </div>
                );
            }

            case 'switch':
                return (
                    <label
                        onClick={handleSelect}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: s.spacing.md,
                            cursor: 'pointer',
                            fontSize: s.fontSize.sm,
                            color: s.foreground,
                            ...selectionStyle,
                        }}
                    >
                        <span
                            style={{
                                width: 44,
                                height: 24,
                                borderRadius: s.radius.full,
                                background: isPreview ? `linear-gradient(135deg, ${s.muted}, ${s.accent})` : s.muted,
                                display: 'inline-block',
                                position: 'relative',
                                transition: s.transition.fast,
                                border: isPreview ? 'none' : `1px solid ${s.border}`,
                                boxShadow: isPreview ? `inset 0 1px 3px rgba(0,0,0,0.1)` : 'none',
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 2,
                                    left: 2,
                                    width: 20,
                                    height: 20,
                                    borderRadius: s.radius.full,
                                    background: isPreview ? s.card : s.card,
                                    boxShadow: isPreview ? s.shadow.md : s.shadow.sm,
                                    transition: s.transition.fast,
                                }}
                            />
                        </span>
                        <span style={{ fontWeight: s.fontWeight.medium }}>{node.text || 'Switch'}</span>
                    </label>
                );

            case 'datepicker':
                return (
                    <input
                        onClick={handleSelect}
                        type="date"
                        disabled
                        className={(node as any).className}
                        style={{
                            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                            borderRadius: s.radius.md,
                            border: `1px solid ${s.border}`,
                            background: s.background,
                            color: s.foreground,
                            fontSize: s.fontSize.sm,
                            transition: s.transition.fast,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    />
                );

            case 'tabs': {
                const items = (node as any).itemsMap || [
                    { id: 'one', label: 'Tab One' },
                    { id: 'two', label: 'Tab Two' },
                ];
                return (
                    <div onClick={handleSelect} style={{ ...selectionStyle, cursor: 'pointer' }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: s.spacing.xs,
                                marginBottom: s.spacing.sm,
                                borderBottom: `1px solid ${s.border}`,
                                paddingBottom: s.spacing.xs,
                            }}
                        >
                            {items.map((it: any, index: number) => (
                                <button
                                    key={`${it.id}-${index}`}
                                    disabled
                                    style={{
                                        padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                                        borderRadius: `${s.radius.md} ${s.radius.md} 0 0`,
                                        border: index === 0 ? `1px solid ${s.border}` : `1px solid transparent`,
                                        borderBottom: index === 0 ? `1px solid ${s.card}` : `1px solid transparent`,
                                        marginBottom: -1,
                                        background: index === 0 ? (isPreview ? s.card : s.background) : 'transparent',
                                        color: index === 0 ? s.foreground : s.mutedForeground,
                                        fontSize: s.fontSize.sm,
                                        fontWeight: index === 0 ? s.fontWeight.medium : s.fontWeight.normal,
                                        transition: s.transition.fast,
                                    }}
                                >
                                    {it.label || `Tab ${index + 1}`}
                                </button>
                            ))}
                        </div>
                        <div
                            style={{
                                border: `1px solid ${s.border}`,
                                borderRadius: s.radius.lg,
                                padding: s.spacing.md,
                                background: s.card,
                                boxShadow: isPreview ? s.shadow.sm : 'none',
                            }}
                        >
                            {(node.children || []).map((child, index) => (
                                <WireframeRenderer
                                    key={`${child.id}-${index}`}
                                    node={child}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={onSelectNode}
                                    mode={mode}
                                />
                            ))}
                        </div>
                    </div>
                );
            }

            case 'accordion': {
                const items = (node as any).itemsMap || [
                    { id: 'a', label: 'Section A' },
                    { id: 'b', label: 'Section B' },
                ];
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: s.spacing.sm,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        {items.map((it: any, index: number) => (
                            <div
                                key={`${it.id}-${index}`}
                                style={{
                                    border: `1px solid ${s.border}`,
                                    borderRadius: s.radius.lg,
                                    overflow: 'hidden',
                                    boxShadow: isPreview ? s.shadow.sm : 'none',
                                }}
                            >
                                <div
                                    style={{
                                        padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                                        background: isPreview ? s.muted : s.muted,
                                        fontWeight: s.fontWeight.semibold,
                                        color: s.foreground,
                                        fontSize: s.fontSize.sm,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {it.label || `Section ${index + 1}`}
                                    <span style={{ color: s.mutedForeground, fontSize: s.fontSize.xs }}>▼</span>
                                </div>
                                <div style={{ padding: s.spacing.md, background: s.card }}>
                                    {(Array.isArray(it.content) ? it.content : [it.content]).filter(Boolean).map((child: any, childIndex: number) => (
                                        <WireframeRenderer
                                            key={`${child.id || `child-${childIndex}`}-${index}`}
                                            node={child}
                                            selectedNodeId={selectedNodeId}
                                            onSelectNode={onSelectNode}
                                            mode={mode}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'modal':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            position: 'relative',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: isPreview ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
                                borderRadius: s.radius.lg,
                                backdropFilter: isPreview ? 'blur(4px)' : 'none',
                            }}
                        />
                        <div
                            style={{
                                position: 'relative',
                                margin: `${s.spacing.xl * 1.5}px auto`,
                                maxWidth: 500,
                                border: isPreview ? 'none' : `1px solid ${s.border}`,
                                borderRadius: isPreview ? s.radius.xl : s.radius.lg,
                                background: s.card,
                                padding: s.spacing.xl,
                                boxShadow: isPreview
                                    ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px color-mix(in srgb, ${s.border} 50%, transparent)`
                                    : s.shadow.sm,
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: s.fontWeight.semibold,
                                    marginBottom: s.spacing.lg,
                                    fontSize: s.fontSize.xl,
                                    color: s.foreground,
                                    letterSpacing: isPreview ? '-0.01em' : 'normal',
                                }}
                            >
                                {node.title || 'Modal Title'}
                            </div>
                            {(node.children || []).map((child) => (
                                <WireframeRenderer
                                    key={child.id}
                                    node={child}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={onSelectNode}
                                    mode={mode}
                                />
                            ))}
                        </div>
                    </div>
                );

            case 'video':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            width: '100%',
                            maxWidth: 440,
                            aspectRatio: '16/9',
                            background: isPreview ? `linear-gradient(135deg, ${s.muted} 0%, ${s.accent} 50%, ${s.muted} 100%)` : s.muted,
                            border: isPreview ? 'none' : `1px solid ${s.border}`,
                            borderRadius: isPreview ? s.radius.xl : s.radius.lg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: s.mutedForeground,
                            fontSize: s.fontSize.sm,
                            boxShadow: isPreview ? s.shadow.lg : 'none',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        {isPreview ? (
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: s.radius.full,
                                    background: `linear-gradient(135deg, ${s.card}, color-mix(in srgb, ${s.card} 90%, ${s.foreground}))`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `${s.shadow.lg}, 0 0 0 4px color-mix(in srgb, ${s.card} 50%, transparent)`,
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                <span style={{ fontSize: 24, marginLeft: 4, color: s.primary }}>▶</span>
                            </div>
                        ) : (
                            'Video'
                        )}
                    </div>
                );

            case 'icon':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: s.radius.md,
                            background: isPreview ? s.accent : s.muted,
                            border: `1px solid ${s.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: s.mutedForeground,
                            transition: s.transition.fast,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: s.fontSize.xs, fontWeight: s.fontWeight.medium }}>{(node as any).name || '⬢'}</span>
                    </div>
                );

            case 'breadcrumb': {
                const crumbs = (node as any).crumbs || [{ label: 'Home' }, { label: 'Page' }];
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            gap: s.spacing.sm,
                            alignItems: 'center',
                            fontSize: s.fontSize.sm,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        {crumbs.map((c: any, idx: number) => (
                            <React.Fragment key={c.label + idx}>
                                <span
                                    style={{
                                        color: idx === crumbs.length - 1 ? s.foreground : s.mutedForeground,
                                        fontWeight: idx === crumbs.length - 1 ? s.fontWeight.medium : s.fontWeight.normal,
                                    }}
                                >
                                    {c.label}
                                </span>
                                {idx < crumbs.length - 1 && <span style={{ color: s.mutedForeground, opacity: 0.5 }}>/</span>}
                            </React.Fragment>
                        ))}
                    </div>
                );
            }

            case 'pagination': {
                const total = (node as any).total ?? 5;
                const page = Math.min(Math.max((node as any).page ?? 1, 1), total);
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            gap: s.spacing.xs,
                            alignItems: 'center',
                            fontSize: s.fontSize.sm,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <button
                            disabled
                            style={{
                                padding: `${s.spacing.xs}px ${s.spacing.sm}px`,
                                borderRadius: s.radius.md,
                                border: `1px solid ${s.border}`,
                                background: 'transparent',
                                color: s.mutedForeground,
                                fontSize: s.fontSize.sm,
                                transition: s.transition.fast,
                            }}
                        >
                            Prev
                        </button>
                        {Array.from({ length: total }).map((_, i) => (
                            <button
                                key={i}
                                disabled
                                style={{
                                    padding: `${s.spacing.xs}px ${s.spacing.sm}px`,
                                    borderRadius: s.radius.md,
                                    border: `1px solid ${i + 1 === page ? (isPreview ? s.primary : s.border) : s.border}`,
                                    background: i + 1 === page ? (isPreview ? s.primary : s.muted) : 'transparent',
                                    color: i + 1 === page ? (isPreview ? s.primaryForeground : s.foreground) : s.mutedForeground,
                                    fontSize: s.fontSize.sm,
                                    fontWeight: i + 1 === page ? s.fontWeight.medium : s.fontWeight.normal,
                                    transition: s.transition.fast,
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled
                            style={{
                                padding: `${s.spacing.xs}px ${s.spacing.sm}px`,
                                borderRadius: s.radius.md,
                                border: `1px solid ${s.border}`,
                                background: 'transparent',
                                color: s.mutedForeground,
                                fontSize: s.fontSize.sm,
                                transition: s.transition.fast,
                            }}
                        >
                            Next
                        </button>
                    </div>
                );
            }

            case 'progress':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            width: '100%',
                            maxWidth: 320,
                            height: isPreview ? 10 : 8,
                            borderRadius: s.radius.full,
                            background: isPreview ? `color-mix(in srgb, ${s.muted} 80%, ${s.background})` : s.muted,
                            border: isPreview ? 'none' : `1px solid ${s.border}`,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: isPreview ? `inset 0 1px 2px rgba(0,0,0,0.08)` : 'none',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${Math.min(Math.max((node as any).value ?? 40, 0), 100)}%`,
                                background: isPreview
                                    ? `linear-gradient(90deg, ${s.primary}, color-mix(in srgb, ${s.primary} 80%, ${s.accent}))`
                                    : s.mutedForeground,
                                borderRadius: s.radius.full,
                                transition: s.transition.normal,
                                boxShadow: isPreview ? `0 0 8px color-mix(in srgb, ${s.primary} 40%, transparent)` : 'none',
                            }}
                        />
                    </div>
                );

            case 'skeleton':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            width: (node as any).width ?? 280,
                            height: (node as any).height ?? 16,
                            borderRadius: s.radius.md,
                            background: isPreview ? `linear-gradient(90deg, ${s.muted} 25%, ${s.accent} 50%, ${s.muted} 75%)` : s.muted,
                            backgroundSize: '200% 100%',
                            animation: isPreview ? 'shimmer 1.5s infinite' : 'none',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    />
                );

            case 'datatable': {
                const columns =
                    (node as any).columns && (node as any).columns.length > 0
                        ? (node as any).columns
                        : Array.isArray((node as any).rows) && (node as any).rows.length > 0
                          ? Array.isArray((node as any).rows[0])
                              ? ((node as any).rows[0] as any[]).map((_: any, idx: number) => `Col ${idx + 1}`)
                              : Object.keys((node as any).rows[0] as Record<string, any>)
                          : [];

                const rows = Array.isArray((node as any).rows) ? (node as any).rows : [];

                const getCell = (row: any, idx: number, key?: string) => {
                    if (Array.isArray(row)) return row[idx];
                    if (key) return row[key];
                    return '';
                };

                return (
                    <div onClick={handleSelect} style={{ ...selectionStyle, cursor: 'pointer', width: '100%' }}>
                        <div
                            style={{
                                overflowX: 'auto',
                                border: `1px solid ${s.border}`,
                                borderRadius: s.radius.lg,
                                background: s.card,
                                boxShadow: isPreview ? s.shadow.sm : 'none',
                            }}
                        >
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                    <tr>
                                        {columns.map((col: string) => (
                                            <th
                                                key={col}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                                                    borderBottom: `1px solid ${s.border}`,
                                                    background: s.muted,
                                                    fontWeight: s.fontWeight.semibold,
                                                    fontSize: s.fontSize.xs,
                                                    color: s.foreground,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                }}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row: any, rIdx: number) => (
                                        <tr
                                            key={rIdx}
                                            style={{
                                                background: isPreview && rIdx % 2 === 1 ? s.muted : 'transparent',
                                            }}
                                        >
                                            {columns.map((col: string, cIdx: number) => (
                                                <td
                                                    key={col + cIdx}
                                                    style={{
                                                        padding: `${s.spacing.sm}px ${s.spacing.md}px`,
                                                        borderBottom: `1px solid ${s.border}`,
                                                        fontSize: s.fontSize.sm,
                                                        color: s.foreground,
                                                    }}
                                                >
                                                    {getCell(row, cIdx, col) ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={Math.max(columns.length, 1)}
                                                style={{
                                                    padding: s.spacing.lg,
                                                    fontSize: s.fontSize.sm,
                                                    color: s.mutedForeground,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                Empty table
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }

            case 'footer':
                return (
                    <div
                        style={{
                            padding: `${s.spacing.md}px ${s.spacing.lg}px`,
                            borderTop: `1px solid ${s.border}`,
                            color: s.mutedForeground,
                            fontSize: s.fontSize.xs,
                            textAlign: 'center',
                            background: isPreview ? s.muted : 'transparent',
                        }}
                    >
                        {node.text || '© 2025'}
                    </div>
                );

            default:
                return (
                    <div
                        style={{
                            border: `2px dashed ${s.destructive}`,
                            padding: s.spacing.md,
                            borderRadius: s.radius.md,
                            background: `${s.destructive}10`,
                            color: s.foreground,
                            fontSize: s.fontSize.sm,
                        }}
                    >
                        Unknown Type: {node.type}
                    </div>
                );
        }
    };

    return renderNode();
}
