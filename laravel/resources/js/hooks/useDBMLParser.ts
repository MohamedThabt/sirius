import { convertFormat, detectFormat } from '@/utils/formatConverters';
import { Edge, Node } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';

interface ParsedTable {
    name: string;
    fields: Array<{
        name: string;
        type: string;
        isPrimaryKey?: boolean;
        isForeignKey?: boolean;
        isUnique?: boolean;
        isNotNull?: boolean;
        foreignKeyReference?: {
            referencedTable: string;
            referencedField: string;
        };
    }>;
}

interface ParsedRelation {
    id: string;
    fromTable: string;
    toTable: string;
    fromField: string;
    toField: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

interface ParsedSchema {
    tables: ParsedTable[];
    relations: ParsedRelation[];
}

// Simple DBML parser (basic implementation for demo)
const parseDBML = (dbml: string): ParsedSchema => {
    const tables: ParsedTable[] = [];
    const relations: ParsedRelation[] = [];

    // Parse tables
    const tableRegex = /Table\s+(\w+)\s*\{([^}]+)\}/g;
    let tableMatch;

    while ((tableMatch = tableRegex.exec(dbml)) !== null) {
        const tableName = tableMatch[1];
        const fieldsBlock = tableMatch[2];

        const fields = fieldsBlock
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('//'))
            .map((line) => {
                // Parse field definition: fieldname type [attributes]
                const fieldMatch = line.match(/(\w+)\s+(\w+)(?:\s*\[([^\]]+)\])?/);
                if (!fieldMatch) return null;

                const [, name, type, attributes] = fieldMatch;
                const attrs = attributes?.toLowerCase() || '';
                
                // Check for inline ref: syntax for FK references
                const refMatch = line.match(/ref:(\w+)\.(\w+)/);
                const isForeignKey = attrs.includes('ref') || attrs.includes('fk') || !!refMatch;

                const field: ParsedTable['fields'][0] = {
                    name,
                    type,
                    isPrimaryKey: attrs.includes('pk') || attrs.includes('primary key'),
                    isForeignKey,
                    isUnique: attrs.includes('unique'),
                    isNotNull: attrs.includes('not null') || attrs.includes('pk'),
                };

                // Add FK reference if present
                if (refMatch) {
                    field.foreignKeyReference = {
                        referencedTable: refMatch[1],
                        referencedField: refMatch[2],
                    };
                }

                return field;
            })
            .filter(Boolean) as ParsedTable['fields'];

        tables.push({ name: tableName, fields });
    }

    // Parse relationships
    const refRegex = /Ref:\s*(\w+)\.(\w+)\s*([><-]+)\s*(\w+)\.(\w+)/g;
    let refMatch;
    let refIndex = 0;

    while ((refMatch = refRegex.exec(dbml)) !== null) {
        const [, fromTable, fromField, relationSymbol, toTable, toField] = refMatch;

        let type: ParsedRelation['type'] = 'one-to-many';
        if (relationSymbol.includes('<>')) type = 'many-to-many';
        else if (relationSymbol.includes('-')) type = 'one-to-one';

        relations.push({
            id: `rel-${refIndex++}`,
            fromTable,
            toTable,
            fromField,
            toField,
            type,
        });
    }

    return { tables, relations };
};

// Auto-layout algorithm (grid layout - consistent with DiagramCanvas)
const calculateLayout = (tables: ParsedTable[]): { x: number; y: number }[] => {
    const positions: { x: number; y: number }[] = [];
    const cols = Math.ceil(Math.sqrt(tables.length));
    const nodeWidth = 300;
    const nodeHeight = 400;
    const spacing = 50;

    tables.forEach((_, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        positions.push({
            x: col * (nodeWidth + spacing),
            y: row * (nodeHeight + spacing),
        });
    });

    return positions;
};

export const useDBMLParser = (content: string) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const parseSchema = useCallback(async (contentText: string) => {
        if (!contentText.trim()) {
            setNodes([]);
            setEdges([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate async parsing
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Auto-detect format and convert to DBML for parsing if needed
            const detectedFormat = detectFormat(contentText);
            const dbmlContent = detectedFormat === 'mermaid' ? convertFormat(contentText, 'mermaid', 'dbml') : contentText;

            const schema = parseDBML(dbmlContent);
            const positions = calculateLayout(schema.tables);

            // Convert tables to React Flow nodes
            const flowNodes: Node[] = schema.tables.map((table, index) => ({
                id: table.name,
                type: 'tableNode',
                position: positions[index] || { x: 0, y: 0 },
                data: {
                    tableName: table.name,
                    fields: table.fields,
                },
            }));

            // Convert relations to React Flow edges
            const flowEdges: Edge[] = schema.relations.map((relation) => {
                const relationTypeDisplay = relation.type === 'one-to-many' ? '1:N' : relation.type === 'one-to-one' ? '1:1' : 'N:M';

                const relationName = `${relation.fromTable}-${relation.toTable}`;

                return {
                    id: relation.id,
                    source: relation.fromTable,
                    target: relation.toTable,
                    label: `${relationName} (${relationTypeDisplay})`,
                    type: 'smoothstep',
                    animated: true,
                    style: {
                        stroke: '#6366f1',
                        strokeWidth: 2,
                    },
                };
            });

            setNodes(flowNodes);
            setEdges(flowEdges);
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to parse content`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced parsing
    useEffect(() => {
        const timer = setTimeout(() => {
            parseSchema(content);
        }, 300);

        return () => clearTimeout(timer);
    }, [content, parseSchema]);

    return {
        nodes,
        edges,
        error,
        isLoading,
        parseSchema,
    };
};
