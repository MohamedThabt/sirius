import { Edge, Node } from '@xyflow/react';

interface TableField {
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
}

/**
 * Convert React Flow nodes and edges back to DBML format
 */
export const nodesToDBML = (nodes: Node[], edges: Edge[]): string => {
    let dbml = '// Database Schema\n// Generated from diagram\n\n';

    // Generate tables
    nodes.forEach((node) => {
        const tableName = node.data?.tableName || node.id;
        const fields: TableField[] = node.data?.fields || [];

        dbml += `Table ${tableName} {\n`;

        fields.forEach((field) => {
            let fieldLine = `  ${field.name} ${field.type}`;

            const attributes = [];
            if (field.isPrimaryKey) attributes.push('pk');
            if (field.isUnique && !field.isPrimaryKey) attributes.push('unique');
            if (field.isNotNull && !field.isPrimaryKey) attributes.push('not null');

            if (attributes.length > 0) {
                fieldLine += ` [${attributes.join(', ')}]`;
            }

            dbml += fieldLine + '\n';
        });

        dbml += '}\n\n';
    });

    // Generate relationships from edges
    if (edges.length > 0) {
        dbml += '// Relationships\n';

        edges.forEach((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            if (!sourceNode || !targetNode) return;

            const sourceForeignKeys = sourceNode.data?.fields?.filter((f: TableField) => f.isForeignKey) || [];
            const targetPrimaryKeys = targetNode.data?.fields?.filter((f: TableField) => f.isPrimaryKey) || [];

            // Use the first foreign key and primary key as defaults
            const sourceField = sourceForeignKeys[0]?.name || 'id';
            const targetField = targetPrimaryKeys[0]?.name || 'id';

            // Determine relationship type from edge label or default to one-to-many
            let relationSymbol = '>';
            if (edge.label?.includes('1:1')) {
                relationSymbol = '-';
            } else if (edge.label?.includes('N:M')) {
                relationSymbol = '<>';
            }

            dbml += `Ref: ${edge.source}.${sourceField} ${relationSymbol} ${edge.target}.${targetField}\n`;
        });
    }

    return dbml;
};

/**
 * Generate Mermaid ERD from nodes and edges
 * Output format compatible with FastAPI ERD generator
 */
export const nodesToMermaid = (nodes: Node[], edges: Edge[]): string => {
    let mermaid = 'erDiagram\n';

    // Generate tables
    nodes.forEach((node) => {
        const tableName = node.data?.tableName || node.id;
        const fields: TableField[] = node.data?.fields || [];

        mermaid += `    ${tableName} {\n`;

        fields.forEach((field) => {
            // Format: type column_name "constraints"
            // Example: bigint user_id "FK, NOT NULL, ref:users.id"
            const constraints: string[] = [];

            if (field.isPrimaryKey) constraints.push('PK');
            if (field.isForeignKey) constraints.push('FK');
            if (field.isUnique && !field.isPrimaryKey) constraints.push('UNIQUE');
            if (field.isNotNull && !field.isPrimaryKey) constraints.push('NOT NULL');

            // Add ref: for foreign key references
            if (field.isForeignKey && field.foreignKeyReference) {
                constraints.push(`ref:${field.foreignKeyReference.referencedTable}.${field.foreignKeyReference.referencedField}`);
            }

            let fieldLine = `        ${field.type} ${field.name}`;

            if (constraints.length > 0) {
                fieldLine += ` "${constraints.join(', ')}"`;
            }

            mermaid += fieldLine + '\n';
        });

        mermaid += '    }\n\n';
    });

    // Generate relationships
    // Format: ChildTable }o--|| ParentTable : "fk_column to pk_column"
    edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (!sourceNode || !targetNode) return;

        const sourceForeignKeys = (sourceNode.data?.fields as TableField[] | undefined)?.filter((f) => f.isForeignKey) || [];
        const targetPrimaryKeys = (targetNode.data?.fields as TableField[] | undefined)?.filter((f) => f.isPrimaryKey) || [];

        const sourceField = sourceForeignKeys[0]?.name || 'id';
        const targetField = targetPrimaryKeys[0]?.name || 'id';

        // Determine relationship symbol based on edge label or default to many-to-one
        // FastAPI outputs: }o--|| for many-to-one (child }o--|| parent)
        let relationshipSymbol = '}o--||'; // Default: many-to-one (most common for FK relationships)

        if (typeof edge.label === 'string') {
            if (edge.label.includes('1:1')) {
                relationshipSymbol = '||--||';
            } else if (edge.label.includes('N:M') || edge.label.includes('M:N')) {
                relationshipSymbol = '}o--o{';
            } else if (edge.label.includes('1:N')) {
                relationshipSymbol = '||--o{';
            }
        }

        mermaid += `${edge.source} ${relationshipSymbol} ${edge.target} : "${sourceField} to ${targetField}"\n`;
    });

    return mermaid;
};
