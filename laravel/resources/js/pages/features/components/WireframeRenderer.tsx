import React from 'react';

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
}

export function WireframeRenderer({ node, selectedNodeId = null, onSelectNode }: Props) {
    if (!node) return null;

    // Low-fidelity styling: grayscale only
    const baseBorder = '1px solid #d1d5db'; // gray-300
    const baseBg = '#ffffff'; // white
    const mutedBg = '#f9fafb'; // gray-50
    const textColor = '#111827'; // gray-900
    const textMuted = '#374151'; // gray-700

    const layoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: node.layout || 'column',
        gap: '8px',
        padding: node.type === 'page' ? '16px' : '8px',
        border: baseBorder,
        width: '100%',
        borderRadius: 4,
        background: baseBg,
        color: textColor,
    };

    const isSelected = node.id === selectedNodeId;
    const selectionStyle: React.CSSProperties = isSelected ? { outline: '2px solid #3b82f6', boxShadow: '0 0 0 4px rgba(59,130,246,0.15)' } : {};
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
                            background: (node as any).className?.includes('bg-gray') ? mutedBg : baseBg,
                            maxWidth: node.type === 'page' ? 960 : undefined,
                            margin: node.type === 'page' ? '0 auto' : undefined,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        className={node.className}
                    >
                        {node.type === 'page' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ fontSize: 12, opacity: 0.6 }}>{node.id}</div>
                                <div style={{ width: 80, height: 6, borderRadius: 9999, background: 'hsl(var(--muted))' }} />
                            </div>
                        )}
                        {(node.children || []).map((child) => (
                            <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
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
                            gap: Math.min(gap || 8, 8),
                            padding: 8,
                            border: baseBorder,
                            borderRadius: 4,
                            background: baseBg,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        className={(node as any).className}
                    >
                        {(node.children || []).map((child) => (
                            <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
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
                            gap: 12,
                            padding: 8,
                            border: baseBorder,
                            background: mutedBg,
                            borderRadius: 4,
                            cursor: 'pointer',
                            ...selectionStyle,
                        }}
                    >
                        {(node.items || []).map((item) => (
                            <span key={item} style={{ fontWeight: 600 }}>
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
                            background: mutedBg,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        className={node.className}
                    >
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: textColor }}>{node.title || 'Hero Title'}</h1>
                        {node.button && (
                            <button disabled style={{ padding: '6px 12px', borderRadius: 4, border: baseBorder, background: 'transparent', color: textColor }}>
                                {node.button}
                            </button>
                        )}
                        {(node.children || []).map((child) => (
                            <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
                        ))}
                    </div>
                );

            case 'heading': {
                const level = (node as any).level ?? 2;
                const Tag = `h${Math.min(Math.max(level, 1), 6)}` as unknown as keyof JSX.IntrinsicElements;
                return (
                    <Tag onClick={handleSelect} className={(node as any).className} style={{ margin: 0, ...selectionStyle, cursor: 'pointer' }}>
                        {node.text || 'Heading'}
                    </Tag>
                );
            }

            case 'link':
                return (
                    <a
                        onClick={handleSelect}
                        className={(node as any).className}
                        style={{ color: textColor, textDecoration: 'underline', cursor: 'pointer', ...selectionStyle }}
                    >
                        {node.text || 'Link'}
                    </a>
                );

            case 'divider':
                return <hr onClick={handleSelect} style={{ border: 0, borderTop: baseBorder, ...selectionStyle, cursor: 'pointer' }} />;

            case 'spacer':
                return <div onClick={handleSelect} style={{ height: (node as any).height ?? 16, ...selectionStyle, cursor: 'pointer' }} />;

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
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: baseBorder,
                            background: mutedBg,
                            color: textMuted,
                            fontSize: 12,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        Image
                    </div>
                );

            case 'form':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            padding: 12,
                            border: baseBorder,
                            borderRadius: 4,
                            background: baseBg,
                            cursor: 'pointer',
                            ...selectionStyle,
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textColor }}>Form</h4>
                        {(node.fields || []).map((field) => (
                            <div key={field.name}>
                                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: textMuted }}>{field.name}</label>
                                <input
                                    type={field.type}
                                    placeholder={field.name}
                                    disabled
                                    style={{ width: '100%', maxWidth: 240, padding: 6, borderRadius: 4, border: baseBorder, background: baseBg }}
                                />
                            </div>
                        ))}
                        {node.submit && (
                            <button disabled style={{ width: '100%', maxWidth: 240, padding: 6, borderRadius: 4, border: baseBorder, background: 'transparent', color: textColor }}>
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
                            padding: '6px 12px',
                            borderRadius: 4,
                            border: baseBorder,
                            background: 'transparent',
                            color: textColor,
                            cursor: 'pointer',
                            fontSize: 14,
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
                        style={{ margin: 0, lineHeight: 1.6, ...selectionStyle, cursor: 'pointer' }}
                    >
                        {node.text || 'Lorem ipsum dolor sit amet.'}
                    </p>
                );

            case 'input': {
                const isCheckbox = (node as any).className?.includes('checkbox');
                const isDropdown = (node as any).className?.includes('dropdown');

                if (isCheckbox) {
                    return (
                        <label onClick={handleSelect} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...selectionStyle }}>
                            <input type="checkbox" disabled />
                            <span style={{ fontSize: 14 }}>{node.text || 'Checkbox'}</span>
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
                            style={{ padding: 8, borderRadius: 6, border: baseBorder, minWidth: 200, ...selectionStyle, cursor: 'pointer' }}
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
                        style={{ width: '100%', maxWidth: 240, padding: 6, borderRadius: 4, border: baseBorder, background: baseBg, color: textColor, ...selectionStyle, cursor: 'pointer' }}
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
                        style={{ width: '100%', maxWidth: 320, height: 80, padding: 6, borderRadius: 4, border: baseBorder, background: baseBg, color: textColor, ...selectionStyle, cursor: 'pointer' }}
                    />
                );

            case 'select': {
                const options = (node as any).options && Array.isArray((node as any).options) ? (node as any).options : [];
                return (
                    <select
                        onClick={handleSelect}
                        disabled
                        className={(node as any).className}
                        style={{ padding: 6, borderRadius: 4, border: baseBorder, minWidth: 200, background: baseBg, color: textColor, ...selectionStyle, cursor: 'pointer' }}
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
                    <label onClick={handleSelect} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...selectionStyle }}>
                        <input type="checkbox" disabled />
                        <span style={{ fontSize: 14 }}>{node.text || 'Checkbox'}</span>
                    </label>
                );

            case 'radio-group': {
                const options = (node as any).options && Array.isArray((node as any).options) ? (node as any).options : ['Option A', 'Option B'];
                return (
                    <div onClick={handleSelect} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...selectionStyle, cursor: 'pointer' }}>
                        {options.map((opt: string, index: number) => (
                            <label key={`${opt}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input type="radio" disabled />
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...selectionStyle }}
                    >
                        <span
                            style={{
                                width: 36,
                                height: 20,
                                borderRadius: 9999,
                                background: 'hsl(var(--muted))',
                                display: 'inline-block',
                                position: 'relative',
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 2,
                                    left: 2,
                                    width: 16,
                                    height: 16,
                                    borderRadius: 9999,
                                    background: 'white',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                }}
                            />
                        </span>
                        <span>{node.text || 'Switch'}</span>
                    </label>
                );

            case 'datepicker':
                return (
                    <input
                        onClick={handleSelect}
                        type="date"
                        disabled
                        className={(node as any).className}
                        style={{ padding: 8, borderRadius: 6, border: baseBorder, ...selectionStyle, cursor: 'pointer' }}
                    />
                );

            case 'tabs': {
                const items = (node as any).itemsMap || [
                    { id: 'one', label: 'Tab One' },
                    { id: 'two', label: 'Tab Two' },
                ];
                return (
                    <div onClick={handleSelect} style={{ ...selectionStyle, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                            {items.map((it: any, index: number) => (
                                <button key={`${it.id}-${index}`} disabled style={{ padding: '6px 10px', borderRadius: 4, border: baseBorder, background: 'transparent', color: textColor, fontSize: 14 }}>
                                    {it.label || `Tab ${index + 1}`}
                                </button>
                            ))}
                        </div>
                        <div style={{ border: baseBorder, borderRadius: 4, padding: 12, background: baseBg }}>
                            {(node.children || []).map((child, index) => (
                                <WireframeRenderer
                                    key={`${child.id}-${index}`}
                                    node={child}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={onSelectNode}
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
                    <div onClick={handleSelect} style={{ display: 'flex', flexDirection: 'column', gap: 8, ...selectionStyle, cursor: 'pointer' }}>
                        {items.map((it: any, index: number) => (
                            <div key={`${it.id}-${index}`} style={{ border: baseBorder, borderRadius: 4 }}>
                                <div style={{ padding: 8, background: mutedBg, fontWeight: 600, color: textColor, fontSize: 14 }}>
                                    {it.label || `Section ${index + 1}`}
                                </div>
                                <div style={{ padding: 8 }}>
                                    {(Array.isArray(it.content) ? it.content : [it.content]).filter(Boolean).map((child: any, childIndex: number) => (
                                        <WireframeRenderer
                                            key={`${child.id || `child-${childIndex}`}-${index}`}
                                            node={child}
                                            selectedNodeId={selectedNodeId}
                                            onSelectNode={onSelectNode}
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
                    <div onClick={handleSelect} style={{ position: 'relative', ...selectionStyle, cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', borderRadius: 4 }} />
                        <div
                            style={{
                                position: 'relative',
                                margin: '20px auto',
                                maxWidth: 420,
                                border: baseBorder,
                                borderRadius: 4,
                                background: baseBg,
                                padding: 12,
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16, color: textColor }}>{node.title || 'Modal Title'}</div>
                            {(node.children || []).map((child) => (
                                <WireframeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
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
                            maxWidth: 320,
                            height: 180,
                            background: mutedBg,
                            border: baseBorder,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: textMuted,
                            fontSize: 14,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        Video
                    </div>
                );

            case 'icon':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 4,
                            background: mutedBg,
                            border: baseBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: textMuted,
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: 11 }}>{(node as any).name || 'Icon'}</span>
                    </div>
                );

            case 'breadcrumb': {
                const crumbs = (node as any).crumbs || [{ label: 'Home' }, { label: 'Page' }];
                return (
                    <div onClick={handleSelect} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14, ...selectionStyle, cursor: 'pointer' }}>
                        {crumbs.map((c: any, idx: number) => (
                            <React.Fragment key={c.label + idx}>
                                <span style={{ color: textColor }}>{c.label}</span>
                                {idx < crumbs.length - 1 && <span style={{ color: textMuted }}>/</span>}
                            </React.Fragment>
                        ))}
                    </div>
                );
            }

            case 'pagination': {
                const total = (node as any).total ?? 5;
                const page = Math.min(Math.max((node as any).page ?? 1, 1), total);
                return (
                    <div onClick={handleSelect} style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 14, ...selectionStyle, cursor: 'pointer' }}>
                        <button disabled style={{ padding: '4px 8px', borderRadius: 4, border: baseBorder, background: 'transparent', color: textColor }}>
                            Prev
                        </button>
                        {Array.from({ length: total }).map((_, i) => (
                            <button
                                key={i}
                                disabled
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    border: baseBorder,
                                    background: i + 1 === page ? mutedBg : 'transparent',
                                    color: textColor,
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button disabled style={{ padding: '4px 8px', borderRadius: 4, border: baseBorder, background: 'transparent', color: textColor }}>
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
                            maxWidth: 240,
                            height: 8,
                            borderRadius: 4,
                            background: mutedBg,
                            border: baseBorder,
                            position: 'relative',
                            overflow: 'hidden',
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
                                background: '#6b7280', // gray-500
                            }}
                        />
                    </div>
                );

            case 'skeleton':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            width: (node as any).width ?? 240,
                            height: (node as any).height ?? 16,
                            borderRadius: 4,
                            background: mutedBg,
                            border: baseBorder,
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
                        <div style={{ overflowX: 'auto', border: baseBorder, borderRadius: 4, background: baseBg }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                    <tr>
                                        {columns.map((col: string) => (
                                            <th
                                                key={col}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '8px 10px',
                                                    borderBottom: baseBorder,
                                                    background: mutedBg,
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    color: textColor,
                                                }}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row: any, rIdx: number) => (
                                        <tr key={rIdx}>
                                            {columns.map((col: string, cIdx: number) => (
                                                <td key={col + cIdx} style={{ padding: '8px 10px', borderBottom: baseBorder, fontSize: 12, color: textColor }}>
                                                    {getCell(row, cIdx, col) ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={Math.max(columns.length, 1)} style={{ padding: 12, fontSize: 12, color: textMuted }}>
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
                return <div style={{ padding: 8, borderTop: baseBorder, color: textMuted, fontSize: 12 }}>{node.text || '© 2025'}</div>;

            default:
                return <div style={{ border: '1px solid red', padding: 10 }}>Unknown Type: {node.type}</div>;
        }
    };

    return renderNode();
}
