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
    onEdit?: () => void;
    onDelete?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TableNode = ({ data }: NodeProps<any>) => {
    const { tableName, fields, onEdit, onDelete } = data as TableNodeData;

    return (
        <Card className="group w-64 overflow-hidden rounded-lg border border-border/60 bg-card shadow-md">
            <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-primary" />

            {/* Header */}
            <CardHeader className="border-b border-border/40 bg-muted/30 px-3 py-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary/80" />
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
                                    {field.isForeignKey && <Link2 className="h-3 w-3 text-blue-500" />}
                                </div>
                                <span
                                    className={`truncate text-xs ${
                                        field.isPrimaryKey || field.isForeignKey ? 'font-medium text-foreground' : 'text-muted-foreground'
                                    }`}
                                >
                                    {field.name}
                                </span>
                            </div>
                            <span className="ml-2 flex-shrink-0 font-mono text-[10px] text-muted-foreground/70">{field.type}</span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-primary" />
        </Card>
    );
};

export default memo(TableNode);
