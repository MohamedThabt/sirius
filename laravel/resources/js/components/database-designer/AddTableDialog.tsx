import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Node } from '@xyflow/react';

interface ForeignKeyReference {
    referencedTable: string;
    referencedField: string;
}

interface Field {
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    isUnique: boolean;
    isNotNull: boolean;
    foreignKeyReference?: ForeignKeyReference;
}

interface AddTableDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (tableName: string, fields: Field[]) => void;
    existingTables?: Node[];
}

export default function AddTableDialog({ open, onOpenChange, onAdd, existingTables = [] }: AddTableDialogProps) {
    const [tableName, setTableName] = useState('');
    const [fields, setFields] = useState<Field[]>([
        { name: 'id', type: 'integer', isPrimaryKey: true, isForeignKey: false, isUnique: false, isNotNull: true },
    ]);

    // Get available tables for FK reference
    const availableTables = existingTables
        .map((node) => {
            const tableName = node.data?.tableName || node.id;
            const pkField = node.data?.fields?.find((f: any) => f.isPrimaryKey)?.name || 'id';
            return { name: tableName, primaryKeyField: pkField };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleAddField = () => {
        setFields([
            ...fields,
            { name: '', type: 'varchar', isPrimaryKey: false, isForeignKey: false, isUnique: false, isNotNull: false },
        ]);
    };

    const handleRemoveField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index: number, key: keyof Field, value: any) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    const handleSubmit = () => {
        if (!tableName.trim() || fields.length === 0) return;
        
        onAdd(tableName, fields);
        
        // Reset form
        setTableName('');
        setFields([
            { name: 'id', type: 'integer', isPrimaryKey: true, isForeignKey: false, isUnique: false, isNotNull: true },
        ]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                    <DialogDescription>Create a new table with custom fields.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="tableName">Table Name</Label>
                        <Input
                            id="tableName"
                            placeholder="e.g., users, products, orders"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Fields</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddField}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Field
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={index} className="rounded-lg border p-3 space-y-3">
                                    <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-5">
                                            <Input
                                                placeholder="Field name"
                                                value={field.name}
                                                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                value={field.type}
                                                onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                            >
                                                <option value="integer">integer</option>
                                                <option value="varchar">varchar</option>
                                                <option value="text">text</option>
                                                <option value="decimal">decimal</option>
                                                <option value="boolean">boolean</option>
                                                <option value="timestamp">timestamp</option>
                                                <option value="date">date</option>
                                                <option value="json">json</option>
                                            </select>
                                        </div>
                                        <div className="col-span-4 flex items-center justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveField(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`pk-${index}`}
                                                checked={field.isPrimaryKey}
                                                onCheckedChange={(checked) =>
                                                    handleFieldChange(index, 'isPrimaryKey', checked)
                                                }
                                            />
                                            <label
                                                htmlFor={`pk-${index}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Primary Key
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`fk-${index}`}
                                                checked={field.isForeignKey}
                                                onCheckedChange={(checked) => {
                                                    handleFieldChange(index, 'isForeignKey', checked);
                                                    if (!checked) {
                                                        // Clear FK reference when unchecked
                                                        handleFieldChange(index, 'foreignKeyReference', undefined);
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`fk-${index}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Foreign Key
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`unique-${index}`}
                                                checked={field.isUnique}
                                                onCheckedChange={(checked) =>
                                                    handleFieldChange(index, 'isUnique', checked)
                                                }
                                            />
                                            <label
                                                htmlFor={`unique-${index}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Unique
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`notnull-${index}`}
                                                checked={field.isNotNull}
                                                onCheckedChange={(checked) =>
                                                    handleFieldChange(index, 'isNotNull', checked)
                                                }
                                            />
                                            <label
                                                htmlFor={`notnull-${index}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Not Null
                                            </label>
                                        </div>
                                    </div>

                                    {field.isForeignKey && availableTables.length > 0 && (
                                        <div className="ml-6 space-y-2 rounded-md bg-muted/30 p-3">
                                            <Label className="text-sm font-medium">References</Label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                value={field.foreignKeyReference?.referencedTable || ''}
                                                onChange={(e) => {
                                                    const table = e.target.value;
                                                    const refTable = availableTables.find((t) => t.name === table);
                                                    if (refTable) {
                                                        handleFieldChange(index, 'foreignKeyReference', {
                                                            referencedTable: table,
                                                            referencedField: refTable.primaryKeyField,
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Select table to reference...</option>
                                                {availableTables.map((table) => (
                                                    <option key={table.name} value={table.name}>
                                                        {table.name} (pk: {table.primaryKeyField})
                                                    </option>
                                                ))}
                                            </select>
                                            {field.foreignKeyReference && (
                                                <p className="text-xs text-muted-foreground">
                                                    References: <span className="font-mono font-semibold">{field.foreignKeyReference.referencedTable}.{field.foreignKeyReference.referencedField}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={!tableName.trim() || fields.length === 0}>
                        Add Table
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
