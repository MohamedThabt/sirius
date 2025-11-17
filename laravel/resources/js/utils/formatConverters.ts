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

    // Parse Mermaid tables
    const tableRegex = /(\w+)\s*\{([^}]+)\}/g;
    let tableMatch;

    while ((tableMatch = tableRegex.exec(mermaidContent)) !== null) {
        const tableName = tableMatch[1];
        const fieldsBlock = tableMatch[2];

        const fields = fieldsBlock
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('//'))
            .map((line) => {
                // Parse Mermaid field: type name "attributes"
                // Can have multiple quoted sections: type name "PK, FK" "ref:table.field"
                const fieldMatch = line.match(/(\w+)\s+(\w+)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?/);
                if (!fieldMatch) return null;

                const [, type, name, attributes1] = fieldMatch;
                const attrs = (attributes1 || '').toLowerCase();

                // Check for FK reference in line
                const refMatch = line.match(/ref:(\w+)\.(\w+)/);
                const isForeignKey = attrs.includes('fk') || !!refMatch;

                const field: ParsedTable['fields'][0] = {
                    name,
                    type,
                    isPrimaryKey: attrs.includes('pk'),
                    isForeignKey,
                    isUnique: attrs.includes('uk') || attrs.includes('unique'),
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

    // Parse Mermaid relationships
    const relationRegex = /(\w+)\s+(\|\|--\|\||\|\|--o\{|\}o--o\{)\s+(\w+)\s*:\s*"([^"]+)"/g;
    let relationMatch;

    while ((relationMatch = relationRegex.exec(mermaidContent)) !== null) {
        const [, fromTable, relationSymbol, toTable, description] = relationMatch;

        let type: ParsedRelation['type'] = 'one-to-many';
        if (relationSymbol === '||--||') type = 'one-to-one';
        else if (relationSymbol === '}o--o{') type = 'many-to-many';

        // Extract field names from description
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
    const trimmed = content.trim().toLowerCase();

    // Check for Mermaid ERD keywords
    if (trimmed.startsWith('erdiagram') || trimmed.includes('erdiagram')) {
        return 'mermaid';
    }

    // Check for DBML keywords
    if (trimmed.includes('table ') || trimmed.includes('ref:')) {
        return 'dbml';
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
