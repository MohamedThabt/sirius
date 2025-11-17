import { Handle, Position } from '@xyflow/react';

type Field = { name: string; type: 'text' | 'email' | 'password' };

interface FormNodeData {
    title?: string;
    fields?: Field[];
    submit?: string;
}

export function FormNode({ data }: { data: FormNodeData }) {
    return (
        <div
            style={{
                border: '1px solid hsl(var(--border))',
                padding: 12,
                borderRadius: 8,
                background: 'hsl(var(--card))',
                width: 280,
                color: 'hsl(var(--foreground))',
            }}
        >
            <Handle type="target" position={Position.Top} />

            <h4
                style={{
                    margin: 0,
                    marginBottom: 10,
                    paddingBottom: 6,
                    borderBottom: '1px solid hsl(var(--border))',
                    fontWeight: 600,
                }}
            >
                {data.title || 'Form'}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data.fields || []).map((field, i) => (
                    <div key={i}>
                        <label style={{ fontSize: 12, opacity: 0.8 }}>{field.name}</label>
                        <input
                            type={field.type}
                            placeholder={field.name}
                            disabled
                            style={{
                                width: '100%',
                                padding: 6,
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 6,
                                background: 'hsl(var(--muted))',
                                color: 'hsl(var(--foreground))',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                ))}
                {data.submit && (
                    <button
                        disabled
                        style={{
                            marginTop: 6,
                            width: '100%',
                            padding: 8,
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 6,
                            background: 'hsl(var(--accent))',
                            color: 'hsl(var(--accent-foreground))',
                        }}
                    >
                        {data.submit}
                    </button>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
