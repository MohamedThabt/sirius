import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const exportCanvasAsImage = async (element: HTMLElement, filename: string = 'diagram') => {
    try {
        const dataUrl = await toPng(element, {
            backgroundColor: '#ffffff',
            width: element.offsetWidth,
            height: element.offsetHeight,
            style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
            },
        });

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Error exporting image:', error);
        throw new Error('Failed to export image');
    }
};

export const exportCanvasAsPDF = async (element: HTMLElement, filename: string = 'diagram') => {
    try {
        const canvas = await toPng(element, {
            backgroundColor: '#ffffff',
            width: element.offsetWidth,
            height: element.offsetHeight,
        });

        const pdf = new jsPDF({
            orientation: element.offsetWidth > element.offsetHeight ? 'landscape' : 'portrait',
            unit: 'px',
            format: [element.offsetWidth, element.offsetHeight],
        });

        pdf.addImage(canvas, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw new Error('Failed to export PDF');
    }
};

export const exportAsSQL = (dbml: string, dialect: 'mysql' | 'postgresql' = 'postgresql') => {
    const tables: any[] = [];
    const tableRegex = /Table\s+(\w+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = tableRegex.exec(dbml)) !== null) {
        const tableName = match[1];
        const fieldsBlock = match[2];

        const fields = fieldsBlock
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('//'))
            .map((line) => {
                const fieldMatch = line.match(/(\w+)\s+(\w+)(?:\s*\[([^\]]+)\])?/);
                if (!fieldMatch) return null;

                const [, name, type, attributes] = fieldMatch;
                const attrs = attributes?.toLowerCase() || '';

                return {
                    name,
                    type: type.toLowerCase(),
                    isPrimaryKey: attrs.includes('pk'),
                    isNotNull: attrs.includes('not null') || attrs.includes('pk'),
                    isUnique: attrs.includes('unique'),
                };
            })
            .filter(Boolean);

        tables.push({ name: tableName, fields });
    }

    // Generate SQL
    const sqlStatements = tables
        .map((table) => {
            const fieldDefinitions = table.fields
                .map((field: any) => {
                    let definition = `  ${field.name} `;

                    // Map types
                    switch (field.type) {
                        case 'integer':
                        case 'int':
                            definition += dialect === 'mysql' ? 'INT' : 'INTEGER';
                            break;
                        case 'varchar':
                            definition += 'VARCHAR(255)';
                            break;
                        case 'text':
                            definition += 'TEXT';
                            break;
                        case 'boolean':
                            definition += 'BOOLEAN';
                            break;
                        case 'datetime':
                        case 'timestamp':
                            definition += 'TIMESTAMP';
                            break;
                        default:
                            definition += field.type.toUpperCase();
                    }

                    if (field.isNotNull) definition += ' NOT NULL';
                    if (field.isPrimaryKey) definition += ' PRIMARY KEY';
                    if (field.isUnique && !field.isPrimaryKey) definition += ' UNIQUE';

                    return definition;
                })
                .join(',\n');

            return `CREATE TABLE ${table.name} (\n${fieldDefinitions}\n);`;
        })
        .join('\n\n');

    // Download SQL file
    const blob = new Blob([sqlStatements], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema.sql`;
    link.click();
    URL.revokeObjectURL(url);
};
