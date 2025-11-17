import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportCanvasAsImage = async (canvasElement: HTMLElement, filename: string): Promise<void> => {
    try {
        const canvas = await html2canvas(canvasElement, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
        });

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL();
        link.click();
    } catch (error) {
        throw new Error('Failed to export canvas as image');
    }
};

export const exportCanvasAsPDF = async (canvasElement: HTMLElement, filename: string): Promise<void> => {
    try {
        const canvas = await html2canvas(canvasElement, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');

        const imgWidth = 297; // A4 width in mm
        const pageHeight = 210; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${filename}.pdf`);
    } catch (error) {
        throw new Error('Failed to export canvas as PDF');
    }
};

export const exportAsJSON = (c4Diagram: any, filename: string): void => {
    try {
        const blob = new Blob([JSON.stringify(c4Diagram, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        throw new Error('Failed to export JSON');
    }
};

export const exportAsPlantUML = (c4Diagram: any): string => {
    try {
        let plantUML = '@startuml\n';
        plantUML += '!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml\n\n';

        // Add title
        plantUML += `title ${c4Diagram.title}\n\n`;

        // Add elements
        c4Diagram.elements.forEach((element: any) => {
            const type = element.type.replace('-', '_');
            const external = element.isExternal ? '_Ext' : '';
            const technology = element.technology ? `, $technology="${element.technology}"` : '';

            plantUML += `${type}${external}(${element.id}, "${element.name}", "${element.description}"${technology})\n`;
        });

        plantUML += '\n';

        // Add relationships
        c4Diagram.relationships.forEach((rel: any) => {
            const technology = rel.technology ? `, $technology="${rel.technology}"` : '';
            plantUML += `Rel(${rel.from}, ${rel.to}, "${rel.label}"${technology})\n`;
        });

        plantUML += '\n@enduml';

        return plantUML;
    } catch (error) {
        throw new Error('Failed to generate PlantUML');
    }
};

export const exportAsMermaid = (c4Diagram: any): string => {
    try {
        let mermaid = 'graph TB\n';

        // Add elements
        c4Diagram.elements.forEach((element: any) => {
            const shape = getMermaidShape(element.type);
            const external = element.isExternal ? 'External' : '';
            const technology = element.technology ? `\n  Technology: ${element.technology}` : '';

            mermaid += `  ${element.id}${shape}["${element.name}${external}\n  ${element.description}${technology}"]\n`;
        });

        mermaid += '\n';

        // Add relationships
        c4Diagram.relationships.forEach((rel: any) => {
            const technology = rel.technology ? `|${rel.technology}|` : '';
            mermaid += `  ${rel.from} -->|${rel.label}${technology}| ${rel.to}\n`;
        });

        return mermaid;
    } catch (error) {
        throw new Error('Failed to generate Mermaid');
    }
};

const getMermaidShape = (type: string): string => {
    switch (type) {
        case 'person':
            return '(((';
        case 'software-system':
            return '[';
        case 'container':
            return '{{';
        case 'component':
            return '[[';
        default:
            return '[';
    }
};
