import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Key, Link, Lock, Edit2, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
        <TooltipProvider delayDuration={300}>
            <Card className="w-64 border-2 border-border bg-background shadow-lg group overflow-hidden">
                <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-primary" />

                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CardTitle 
                                    className="text-lg font-bold text-foreground truncate flex-1 min-w-0 cursor-help" 
                                >
                                    {tableName}
                                </CardTitle>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-sm bg-slate-900 dark:bg-slate-800 text-slate-50 border-slate-700 dark:border-slate-600 shadow-xl">
                                <div className="space-y-1.5">
                                    <p className="font-semibold text-sm text-slate-50">{tableName}</p>
                                    <p className="text-xs text-slate-300">
                                        {fields.length} field{fields.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="text-xs pt-1.5 border-t border-slate-600">
                                        <p className="text-slate-300">Primary Keys: <span className="font-medium text-yellow-400">{fields.filter(f => f.isPrimaryKey).length}</span></p>
                                        <p className="text-slate-300">Foreign Keys: <span className="font-medium text-blue-400">{fields.filter(f => f.isForeignKey).length}</span></p>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                >
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0 overflow-hidden">
                    <div className="space-y-1">
                        {fields.map((field: TableField, index: number) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <div 
                                        className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50 min-w-0 cursor-help"
                                    >
                                        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                                            <span 
                                                className="font-medium truncate max-w-[100px]"
                                            >
                                                {field.name}
                                            </span>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {field.isPrimaryKey && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="border-yellow-300 bg-yellow-100 px-1 py-0 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                                                    >
                                                        <Key className="mr-1 h-2.5 w-2.5 text-yellow-600 dark:text-yellow-400" />
                                                        PK
                                                    </Badge>
                                                )}
                                                {field.isForeignKey && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-blue-300 bg-blue-100 px-1 py-0 text-xs text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                                    >
                                                        <Link className="mr-1 h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                                                        FK
                                                    </Badge>
                                                )}
                                                {field.isUnique && !field.isPrimaryKey && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-purple-300 bg-purple-100 px-1 py-0 text-xs text-purple-800 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                                                    >
                                                        UQ
                                                    </Badge>
                                                )}
                                                {field.isNotNull && !field.isPrimaryKey && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-red-300 bg-red-100 px-1 py-0 text-xs text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                                                    >
                                                        <Lock className="mr-1 h-2.5 w-2.5 text-red-600 dark:text-red-400" />
                                                        NN
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex-shrink-0 truncate max-w-[60px]">
                                            {field.type}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-sm bg-slate-900 dark:bg-slate-800 text-slate-50 border-slate-700 dark:border-slate-600 shadow-xl">
                                    <div className="space-y-2">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-50">{field.name}</p>
                                            <p className="text-xs text-slate-300 mt-0.5">Type: <span className="font-mono text-emerald-400">{field.type}</span></p>
                                        </div>
                                        {(field.isPrimaryKey || field.isForeignKey || field.isUnique || field.isNotNull) && (
                                            <div className="pt-1.5 border-t border-slate-600 space-y-1">
                                                <p className="text-xs font-semibold mb-1.5 text-slate-200">Constraints:</p>
                                                {field.isPrimaryKey && (
                                                    <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded">
                                                        <Key className="h-3 w-3 text-yellow-400" />
                                                        <span className="text-xs text-yellow-300">Primary Key</span>
                                                    </div>
                                                )}
                                                {field.isForeignKey && (
                                                    <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded">
                                                        <Link className="h-3 w-3 text-blue-400" />
                                                        <span className="text-xs text-blue-300">Foreign Key</span>
                                                    </div>
                                                )}
                                                {field.isUnique && (
                                                    <div className="flex items-center gap-1.5 bg-purple-500/10 px-2 py-1 rounded">
                                                        <span className="text-xs text-purple-300">✓ Unique</span>
                                                    </div>
                                                )}
                                                {field.isNotNull && (
                                                    <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded">
                                                        <Lock className="h-3 w-3 text-red-400" />
                                                        <span className="text-xs text-red-300">Not Null</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </CardContent>

                <Handle type="source" position={Position.Bottom} className="h-3 w-3 !bg-primary" />
            </Card>
        </TooltipProvider>
    );
};

export default memo(TableNode);