import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Edit2, Key, Link2, Trash2 } from 'lucide-react';
import { memo } from 'react';

interface TableField {
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    isUnique?: boolean;
    isNotNull?: boolean;
}

interface TableNodeData {
    tableName: string;
    fields: TableField[];
    color?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

// Distinct, readable hues for table headers and their relationships.
const TABLE_PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#84cc16'];

/** Stable colour per table name, shared by table headers and the edges leaving them. */
export function tableColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return TABLE_PALETTE[Math.abs(hash) % TABLE_PALETTE.length];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TableNode = ({ data }: NodeProps<any>) => {
    const { tableName, fields, onEdit, onDelete, color: dataColor } = data as TableNodeData;
    const color = dataColor ?? tableColor(tableName);
    const handleStyle = { background: color };

    return (
        <Card
            className="group w-64 overflow-hidden rounded-xl border bg-card shadow-md"
            style={{ borderColor: `color-mix(in srgb, ${color} 35%, var(--border))` }}
        >
            <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-card" style={handleStyle} />

            {/* Header */}
            <CardHeader
                className="border-b px-3 py-2.5"
                style={{
                    background: `color-mix(in srgb, ${color} 14%, var(--card))`,
                    borderColor: `color-mix(in srgb, ${color} 30%, var(--border))`,
                    boxShadow: `inset 0 3px 0 ${color}`,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: color }} />
                        <span className="truncate text-sm font-semibold text-foreground">{tableName}</span>
                    </div>
                    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                            >
                                <Edit2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                            >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            {/* Fields */}
            <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                    {fields.map((field: TableField, index: number) => (
                        <div key={index} className="flex items-center justify-between px-3 py-1.5 transition-colors hover:bg-muted/30">
                            <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                {/* Constraint indicators */}
                                <div className="flex flex-shrink-0 items-center gap-0.5">
                                    {field.isPrimaryKey && <Key className="h-3 w-3 text-amber-500" />}
                                    {field.isForeignKey && <Link2 className="h-3 w-3 text-sky-500" />}
                                </div>
                                <span
                                    className={`truncate text-xs ${
                                        field.isPrimaryKey
                                            ? 'font-semibold text-amber-600 dark:text-amber-400'
                                            : field.isForeignKey
                                              ? 'font-medium text-sky-600 dark:text-sky-400'
                                              : 'text-foreground/80'
                                    }`}
                                >
                                    {field.name}
                                </span>
                            </div>
                            <span className="ml-2 flex-shrink-0 rounded bg-muted px-1.5 py-px font-mono text-[10px] text-muted-foreground">
                                {field.type}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-card" style={handleStyle} />
        </Card>
    );
};

export default memo(TableNode);
