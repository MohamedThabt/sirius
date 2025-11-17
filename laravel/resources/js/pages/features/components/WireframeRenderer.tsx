import { User } from 'lucide-react';
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

    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const baseBorder = isDarkMode ? '1px solid rgba(148,163,184,.35)' : '1px solid #cbd5e1';

    const layoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: node.layout || 'column',
        gap: '16px',
        padding: node.type === 'page' ? '24px' : '16px',
        border: baseBorder,
        width: '100%',
        borderRadius: 10,
        background: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
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
                            boxShadow:
                                node.type === 'page'
                                    ? '0 1px 0 0 hsl(var(--border)) inset'
                                    : (node as any).className?.includes('profile-card-wrapper')
                                      ? '0 10px 30px rgba(0,0,0,0.08)'
                                      : undefined,
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
                            gap,
                            padding: 8,
                            border: baseBorder,
                            borderRadius: 10,
                            background: 'hsl(var(--card))',
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
                            gap: 20,
                            padding: 10,
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--muted))',
                            borderRadius: 8,
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
                            background: 'hsl(var(--muted))',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                        className={node.className}
                    >
                        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>{node.title || 'Hero Title'}</h1>
                        {node.button && (
                            <button disabled style={{ padding: '8px 12px', borderRadius: 6, border: baseBorder }}>
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
                        style={{ color: 'hsl(var(--primary))', textDecoration: 'underline', cursor: 'pointer', ...selectionStyle }}
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
                            width: 96,
                            height: 96,
                            borderRadius: 9999,
                            overflow: 'hidden',
                            border: baseBorder,
                            background: 'hsl(var(--muted))',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <User size={48} color="hsl(var(--foreground))" />
                    </div>
                );

            case 'form':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            padding: 16,
                            border: baseBorder,
                            borderRadius: 8,
                            cursor: 'pointer',
                            ...selectionStyle,
                        }}
                    >
                        <h4 style={{ margin: 0 }}>Form</h4>
                        {(node.fields || []).map((field) => (
                            <div key={field.name}>
                                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, opacity: 0.8 }}>{field.name}</label>
                                <input
                                    type={field.type}
                                    placeholder={field.name}
                                    disabled
                                    style={{ width: 240, padding: 8, borderRadius: 6, border: baseBorder }}
                                />
                            </div>
                        ))}
                        {node.submit && (
                            <button disabled style={{ width: 240, padding: 8, borderRadius: 6, border: baseBorder }}>
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
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: baseBorder,
                            background: (node as any).className?.includes('button-secondary') ? 'transparent' : 'hsl(var(--accent))',
                            color: (node as any).className?.includes('button-secondary') ? 'hsl(var(--foreground))' : 'hsl(var(--accent-foreground))',
                            opacity: (node as any).className?.includes('button-secondary') ? 0.9 : 1,
                            cursor: 'pointer',
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
                        style={{ width: 240, padding: 8, borderRadius: 6, border: baseBorder, ...selectionStyle, cursor: 'pointer' }}
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
                        style={{ width: 320, height: 96, padding: 8, borderRadius: 6, border: baseBorder, ...selectionStyle, cursor: 'pointer' }}
                    />
                );

            case 'select': {
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
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            {items.map((it: any, index: number) => (
                                <button key={`${it.id}-${index}`} disabled style={{ padding: '6px 10px', borderRadius: 6, border: baseBorder }}>
                                    {it.label || `Tab ${index + 1}`}
                                </button>
                            ))}
                        </div>
                        <div style={{ border: baseBorder, borderRadius: 8, padding: 12, background: 'hsl(var(--card))' }}>
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
                            <div key={`${it.id}-${index}`} style={{ border: baseBorder, borderRadius: 8 }}>
                                <div style={{ padding: 10, background: 'hsl(var(--muted))', fontWeight: 600 }}>
                                    {it.label || `Section ${index + 1}`}
                                </div>
                                <div style={{ padding: 10 }}>
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
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }} />
                        <div
                            style={{
                                position: 'relative',
                                margin: '20px auto',
                                maxWidth: 420,
                                border: baseBorder,
                                borderRadius: 8,
                                background: 'hsl(var(--card))',
                                padding: 16,
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>{node.title || 'Modal Title'}</div>
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
                            width: 320,
                            height: 180,
                            background: 'hsl(var(--muted))',
                            border: baseBorder,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <span>Video</span>
                    </div>
                );

            case 'icon':
                return (
                    <div
                        onClick={handleSelect}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 9999,
                            background: 'hsl(var(--muted))',
                            border: baseBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...selectionStyle,
                            cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: 12 }}>{(node as any).name || 'Icon'}</span>
                    </div>
                );

            case 'breadcrumb': {
                const crumbs = (node as any).crumbs || [{ label: 'Home' }, { label: 'Page' }];
                return (
                    <div onClick={handleSelect} style={{ display: 'flex', gap: 8, alignItems: 'center', ...selectionStyle, cursor: 'pointer' }}>
                        {crumbs.map((c: any, idx: number) => (
                            <React.Fragment key={c.label + idx}>
                                <span style={{ color: 'hsl(var(--primary))' }}>{c.label}</span>
                                {idx < crumbs.length - 1 && <span style={{ opacity: 0.5 }}>/</span>}
                            </React.Fragment>
                        ))}
                    </div>
                );
            }

            case 'pagination': {
                const total = (node as any).total ?? 5;
                const page = Math.min(Math.max((node as any).page ?? 1, 1), total);
                return (
                    <div onClick={handleSelect} style={{ display: 'flex', gap: 6, alignItems: 'center', ...selectionStyle, cursor: 'pointer' }}>
                        <button disabled style={{ padding: '4px 8px', borderRadius: 6, border: baseBorder }}>
                            Prev
                        </button>
                        {Array.from({ length: total }).map((_, i) => (
                            <button
                                key={i}
                                disabled
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: baseBorder,
                                    background: i + 1 === page ? 'hsl(var(--muted))' : 'transparent',
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button disabled style={{ padding: '4px 8px', borderRadius: 6, border: baseBorder }}>
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
                            width: 240,
                            height: 10,
                            borderRadius: 9999,
                            background: 'hsl(var(--muted))',
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
                                background: 'hsl(var(--accent))',
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
                            borderRadius: 8,
                            background: 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted))/80 37%, hsl(var(--muted)) 63%)',
                            backgroundSize: '400% 100%',
                            animation: 'pulse 1.4s ease infinite',
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
                        <div style={{ overflowX: 'auto', border: baseBorder, borderRadius: 8, background: 'hsl(var(--card))' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                <thead>
                                    <tr>
                                        {columns.map((col: string) => (
                                            <th
                                                key={col}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '10px 12px',
                                                    borderBottom: baseBorder,
                                                    background: 'hsl(var(--muted))',
                                                    fontWeight: 600,
                                                    fontSize: 12,
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
                                                <td key={col + cIdx} style={{ padding: '10px 12px', borderBottom: baseBorder, fontSize: 12 }}>
                                                    {getCell(row, cIdx, col) ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={Math.max(columns.length, 1)} style={{ padding: 12, fontSize: 12, opacity: 0.7 }}>
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
                return <div style={{ padding: 10, borderTop: baseBorder, opacity: 0.8 }}>{node.text || '© 2025'}</div>;

            default:
                return <div style={{ border: '1px solid red', padding: 10 }}>Unknown Type: {node.type}</div>;
        }
    };

    return renderNode();
}
