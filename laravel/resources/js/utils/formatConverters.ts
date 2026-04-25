export type DiagramFormat = 'dbml' | 'mermaid';

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
    fromTable: string;
    toTable: string;
    fromField: string;
    toField: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

// Convert DBML to Mermaid ERD format
export const dbmlToMermaid = (dbmlContent: string): string => {
    const tables: ParsedTable[] = [];
    const relations: ParsedRelation[] = [];

    // Parse DBML tables
    const tableRegex = /Table\s+(\w+)\s*\{([^}]+)\}/g;
    let tableMatch;

    while ((tableMatch = tableRegex.exec(dbmlContent)) !== null) {
        const tableName = tableMatch[1];
        const fieldsBlock = tableMatch[2];

        const fields = fieldsBlock
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('//'))
            .map((line) => {
                const fieldMatch = line.match(/(\w+)\s+(\w+)(?:\s*\[([^\]]+)\])?/);
                if (!fieldMatch) return null;

                const [, name, type, attributes] = fieldMatch;
                const attrs = attributes?.toLowerCase() || '';

                // Check for FK references in attributes
                const refMatch = attributes?.match(/ref:\s*>\s*(\w+)\.(\w+)/) || attributes?.match(/ref:\s*(\w+)\.(\w+)/);
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

    // Parse DBML relationships
    const refRegex = /Ref:\s*(\w+)\.(\w+)\s*([><-]+)\s*(\w+)\.(\w+)/g;
    let refMatch;

    while ((refMatch = refRegex.exec(dbmlContent)) !== null) {
        const [, fromTable, fromField, relationSymbol, toTable, toField] = refMatch;

        let type: ParsedRelation['type'] = 'one-to-many';
        if (relationSymbol.includes('<>')) type = 'many-to-many';
        else if (relationSymbol.includes('-')) type = 'one-to-one';

        relations.push({
            fromTable,
            toTable,
            fromField,
            toField,
            type,
        });
    }

    // Generate Mermaid ERD
    let mermaidContent = 'erDiagram\n';

    // Add tables with fields
    tables.forEach((table) => {
        mermaidContent += `    ${table.name} {\n`;
        table.fields.forEach((field) => {
            let fieldLine = `        ${field.type} ${field.name}`;

            const attributes = [];
            if (field.isPrimaryKey) attributes.push('PK');
            if (field.isForeignKey) attributes.push('FK');
            if (field.isUnique && !field.isPrimaryKey) attributes.push('UK');
            if (field.isNotNull && !field.isPrimaryKey) attributes.push('NOT NULL');

            if (attributes.length > 0) {
                fieldLine += ` "${attributes.join(', ')}"`;
            }

            mermaidContent += fieldLine + '\n';
        });
        mermaidContent += '    }\n';
    });

    // Add relationships
    relations.forEach((relation) => {
        let relationshipSymbol;
        switch (relation.type) {
            case 'one-to-one':
                relationshipSymbol = '||--||';
                break;
            case 'one-to-many':
                relationshipSymbol = '||--o{';
                break;
            case 'many-to-many':
                relationshipSymbol = '}o--o{';
                break;
        }

        mermaidContent += `    ${relation.fromTable} ${relationshipSymbol} ${relation.toTable} : "${relation.fromField} to ${relation.toField}"\n`;
    });

    return mermaidContent;
};

// Convert Mermaid ERD to DBML format
export const mermaidToDbml = (mermaidContent: string): string => {
    const tables: ParsedTable[] = [];
    const relations: ParsedRelation[] = [];

    // Remove erDiagram keyword and clean content
    const cleanedContent = mermaidContent.replace(/^\s*erDiagram\s*/i, '');

    // Parse Mermaid tables - match table_name { ... }
    const tableRegex = /(\w+)\s*\{([^}]+)\}/g;
    let tableMatch;

    while ((tableMatch = tableRegex.exec(cleanedContent)) !== null) {
        const tableName = tableMatch[1];

        // Skip if tableName is a keyword
        if (tableName.toLowerCase() === 'erdiagram') continue;

        const fieldsBlock = tableMatch[2];

        const fields = fieldsBlock
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('//') && !line.startsWith('--'))
            .map((line) => {
                // Remove inline comments
                const lineWithoutComment = line.split('--')[0].trim();
                if (!lineWithoutComment) return null;

                // Parse Mermaid field: type name "constraints"
                // Handles: bigint user_id "FK, NOT NULL, ref:users.id"
                const fieldMatch = lineWithoutComment.match(/^(\w+)\s+(\w+)(?:\s+"([^"]*)")?$/);
                if (!fieldMatch) return null;

                const [, type, name, constraints] = fieldMatch;
                const constraintsStr = (constraints || '').toUpperCase();

                // Check for FK reference in constraints (ref:table.field)
                const refMatch = (constraints || '').match(/ref:(\w+)\.(\w+)/i);

                // Parse constraints
                const isPrimaryKey = constraintsStr.includes('PK');
                const isForeignKey = constraintsStr.includes('FK') || !!refMatch;
                const isUnique = constraintsStr.includes('UNIQUE');
                const isNotNull = constraintsStr.includes('NOT NULL') || isPrimaryKey;

                const field: ParsedTable['fields'][0] = {
                    name,
                    type,
                    isPrimaryKey,
                    isForeignKey,
                    isUnique,
                    isNotNull,
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

        if (fields.length > 0) {
            tables.push({ name: tableName, fields });
        }
    }

    // Parse Mermaid relationships - support all cardinalities
    // Patterns: ||--||, ||--o|, ||--o{, }o--||, }o--o{, }|--|{, etc.
    const relationRegex = /(\w+)\s+([|}][|o]--[|o][{|}])\s+(\w+)\s*:\s*"([^"]+)"/g;
    let relationMatch;

    while ((relationMatch = relationRegex.exec(mermaidContent)) !== null) {
        const [, fromTable, relationSymbol, toTable, description] = relationMatch;

        // Determine relationship type based on symbol
        // ||--|| : one-to-one (mandatory both)
        // ||--o| : one-to-one (optional right)
        // ||--o{ : one-to-many
        // }o--|| : many-to-one
        // }o--o{ : many-to-many
        // }|--|{ : many-to-many (mandatory)
        let type: ParsedRelation['type'] = 'one-to-many';

        if (relationSymbol.includes('||--||') || relationSymbol.includes('||--o|')) {
            type = 'one-to-one';
        } else if (relationSymbol.includes('}o--o{') || relationSymbol.includes('}|--|{')) {
            type = 'many-to-many';
        } else if (relationSymbol.includes('}o--||') || relationSymbol.includes('}|--||')) {
            // many-to-one is actually one-to-many from the other perspective
            type = 'one-to-many';
        } else if (relationSymbol.includes('||--o{') || relationSymbol.includes('||--|{')) {
            type = 'one-to-many';
        }

        // Extract field names from description (e.g., "user_id to id")
        const fieldMatch = description.match(/(\w+)\s+to\s+(\w+)/);
        const fromField = fieldMatch?.[1] || 'id';
        const toField = fieldMatch?.[2] || 'id';

        relations.push({
            fromTable,
            toTable,
            fromField,
            toField,
            type,
        });
    }

    // Generate DBML
    let dbmlContent = '// Database Schema\n// Generated from Mermaid ERD\n\n';

    // Add tables
    tables.forEach((table) => {
        dbmlContent += `Table ${table.name} {\n`;
        table.fields.forEach((field) => {
            let fieldLine = `  ${field.name} ${field.type}`;

            const attributes = [];
            if (field.isPrimaryKey) attributes.push('pk');
            if (field.isUnique && !field.isPrimaryKey) attributes.push('unique');
            if (field.isNotNull && !field.isPrimaryKey) attributes.push('not null');

            if (attributes.length > 0) {
                fieldLine += ` [${attributes.join(', ')}]`;
            }

            // Add FK reference inline if present
            if (field.isForeignKey && field.foreignKeyReference) {
                fieldLine += ` "ref:${field.foreignKeyReference.referencedTable}.${field.foreignKeyReference.referencedField}"`;
            }

            dbmlContent += fieldLine + '\n';
        });
        dbmlContent += '}\n\n';
    });

    // Add relationships
    if (relations.length > 0) {
        dbmlContent += '// Relationships\n';
        relations.forEach((relation) => {
            let relationSymbol;
            switch (relation.type) {
                case 'one-to-one':
                    relationSymbol = '-';
                    break;
                case 'one-to-many':
                    relationSymbol = '>';
                    break;
                case 'many-to-many':
                    relationSymbol = '<>';
                    break;
            }

            dbmlContent += `Ref: ${relation.fromTable}.${relation.fromField} ${relationSymbol} ${relation.toTable}.${relation.toField}\n`;
        });
    }

    return dbmlContent;
};

// Auto-detect format based on content
export const detectFormat = (content: string): DiagramFormat => {
    const trimmed = content.trim();
    const lowerTrimmed = trimmed.toLowerCase();

    // Check for Mermaid ERD keywords - must start with erDiagram
    if (lowerTrimmed.startsWith('erdiagram')) {
        return 'mermaid';
    }

    // Also check for Mermaid relationship patterns (}o--||, ||--o{, etc.)
    if (/[|}][|o]--[|o][{|}]/.test(trimmed)) {
        return 'mermaid';
    }

    // Check for DBML keywords (Table keyword with capital T)
    if (/\bTable\s+\w+\s*\{/i.test(trimmed)) {
        return 'dbml';
    }

    // Check for DBML Ref: syntax
    if (/\bRef:\s*\w+\.\w+/.test(trimmed)) {
        return 'dbml';
    }

    // Default to mermaid if it looks like ERD structure
    if (/\w+\s*\{[\s\S]*\}/.test(trimmed)) {
        return 'mermaid';
    }

    // Default to DBML
    return 'dbml';
};

// Convert between formats
export const convertFormat = (content: string, fromFormat: DiagramFormat, toFormat: DiagramFormat): string => {
    if (fromFormat === toFormat) return content;

    if (fromFormat === 'dbml' && toFormat === 'mermaid') {
        return dbmlToMermaid(content);
    } else if (fromFormat === 'mermaid' && toFormat === 'dbml') {
        return mermaidToDbml(content);
    }

    return content;
};
