// C4 Model Element Types
export type C4ElementType =
    | 'person' // External user/actor (blue)
    | 'software-system' // Software system (blue if external, gray if internal)
    | 'container' // Application, database, etc. (light blue)
    | 'component' // Component within a container (green)
    | 'boundary'; // Boundary/group container (dashed border)

export interface C4Element {
    id: string;
    type: C4ElementType;
    name: string;
    description: string;
    technology?: string; // e.g., "React", "Spring Boot", "PostgreSQL"
    isExternal?: boolean; // Determines if element is external (blue) or internal
    position?: { x: number; y: number };
    width?: number; // For boundary elements
    height?: number; // For boundary elements
    properties?: Record<string, unknown>;
}

export interface C4Relationship {
    id: string;
    from: string;
    to: string;
    label: string; // Description of the relationship
    technology?: string; // e.g., "HTTPS", "SQL", "Message Queue"
    properties?: Record<string, unknown>;
}

export interface C4Group {
    id: string;
    name: string;
    description: string;
    elements: string[]; // IDs of elements in this group
    type?: 'system-boundary' | 'container-boundary' | 'enterprise-boundary';
    color?: string;
}

export interface C4Diagram {
    title: string;
    description: string;
    type: 'system-context' | 'container' | 'component' | 'system-landscape';
    version?: string;
    metadata?: {
        author?: string;
        created?: string;
        updated?: string;
        tags?: string[];
    };
    elements: C4Element[];
    relationships: C4Relationship[];
    groups?: C4Group[];
    layout?: {
        type: 'hierarchical' | 'force' | 'circular' | 'grid';
        direction?: 'TB' | 'BT' | 'LR' | 'RL';
    };
}

export interface C4ValidationResult {
    isValid: boolean;
    error?: string;
    data?: C4Diagram;
    warnings?: string[];
}

export const validateC4Diagram = (jsonString: string): C4ValidationResult => {
    try {
        const data = JSON.parse(jsonString);

        // Basic structure validation
        if (!data.title || typeof data.title !== 'string') {
            return { isValid: false, error: 'Missing or invalid title field' };
        }

        if (!data.description || typeof data.description !== 'string') {
            return { isValid: false, error: 'Missing or invalid description field' };
        }

        // Diagram type validation
        const validDiagramTypes = ['system-context', 'container', 'component', 'system-landscape'];
        if (!data.type || !validDiagramTypes.includes(data.type)) {
            return { isValid: false, error: `Invalid diagram type. Must be one of: ${validDiagramTypes.join(', ')}` };
        }

        // Elements validation
        if (!Array.isArray(data.elements)) {
            return { isValid: false, error: 'Elements must be an array' };
        }

        if (data.elements.length === 0) {
            return { isValid: false, error: 'At least one element is required' };
        }

        const elementIds = new Set<string>();
        const warnings: string[] = [];
        const validElementTypes = ['person', 'software-system', 'container', 'component'];

        for (const element of data.elements) {
            if (!element.id || typeof element.id !== 'string') {
                return { isValid: false, error: 'All elements must have a valid id' };
            }

            if (elementIds.has(element.id)) {
                return { isValid: false, error: `Duplicate element id: ${element.id}` };
            }
            elementIds.add(element.id);

            if (!element.name || typeof element.name !== 'string') {
                return { isValid: false, error: `Element ${element.id} must have a valid name` };
            }

            if (!element.description || typeof element.description !== 'string') {
                return { isValid: false, error: `Element ${element.id} must have a valid description` };
            }

            if (!validElementTypes.includes(element.type)) {
                return { isValid: false, error: `Element ${element.id} has invalid type. Must be one of: ${validElementTypes.join(', ')}` };
            }

            // Type-specific validation
            if (data.type === 'component' && element.type === 'person') {
                warnings.push(`Person element ${element.id} is unusual in a component diagram`);
            }

            if (data.type === 'system-context' && element.type === 'component') {
                warnings.push(`Component element ${element.id} is unusual in a system-context diagram`);
            }
        }

        // Relationships validation
        if (!Array.isArray(data.relationships)) {
            return { isValid: false, error: 'Relationships must be an array' };
        }

        for (const relationship of data.relationships) {
            if (!relationship.id || typeof relationship.id !== 'string') {
                return { isValid: false, error: 'All relationships must have a valid id' };
            }

            if (!relationship.from || !elementIds.has(relationship.from)) {
                return { isValid: false, error: `Relationship ${relationship.id} references unknown 'from' element: ${relationship.from}` };
            }

            if (!relationship.to || !elementIds.has(relationship.to)) {
                return { isValid: false, error: `Relationship ${relationship.id} references unknown 'to' element: ${relationship.to}` };
            }

            if (!relationship.label || typeof relationship.label !== 'string') {
                return { isValid: false, error: `Relationship ${relationship.id} must have a valid label` };
            }
        }

        return {
            isValid: true,
            data: data as C4Diagram,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
};

export const generateC4Template = (type: 'system-context' | 'container' | 'component'): string => {
    const templates = {
        'system-context': {
            title: 'System Context Diagram',
            description: 'High-level view of the system and its external dependencies',
            type: 'system-context',
            elements: [
                { id: 'user', type: 'person', name: 'User', description: 'System user', position: { x: 100, y: 200 } },
                {
                    id: 'system',
                    type: 'software-system',
                    name: 'Main System',
                    description: 'Core system functionality',
                    position: { x: 400, y: 200 },
                },
                {
                    id: 'external',
                    type: 'software-system',
                    name: 'External System',
                    description: 'Third-party system',
                    isExternal: true,
                    position: { x: 700, y: 200 },
                },
            ],
            relationships: [
                { id: 'rel-1', from: 'user', to: 'system', label: 'Uses' },
                { id: 'rel-2', from: 'system', to: 'external', label: 'Integrates with', technology: 'HTTPS' },
            ],
        },
        container: {
            title: 'Container Diagram',
            description: 'Architecture of the system showing high-level shape and technology choices',
            type: 'container',
            elements: [
                { id: 'user', type: 'person', name: 'User', description: 'System user', position: { x: 100, y: 200 } },
                {
                    id: 'web-app',
                    type: 'container',
                    name: 'Web Application',
                    description: 'React frontend application',
                    technology: 'React/TypeScript',
                    position: { x: 400, y: 100 },
                },
                {
                    id: 'api',
                    type: 'container',
                    name: 'API Service',
                    description: 'REST API service',
                    technology: 'Spring Boot',
                    position: { x: 400, y: 300 },
                },
                {
                    id: 'database',
                    type: 'container',
                    name: 'Database',
                    description: 'PostgreSQL database',
                    technology: 'PostgreSQL',
                    position: { x: 700, y: 200 },
                },
            ],
            relationships: [
                { id: 'conn-1', from: 'user', to: 'web-app', label: 'Uses', technology: 'HTTPS' },
                { id: 'conn-2', from: 'web-app', to: 'api', label: 'Calls', technology: 'JSON/HTTPS' },
                { id: 'conn-3', from: 'api', to: 'database', label: 'Queries', technology: 'SQL' },
            ],
        },
        component: {
            title: 'Component Diagram',
            description: 'Internal structure of a container showing the components that make up the container',
            type: 'component',
            elements: [
                {
                    id: 'controller',
                    type: 'component',
                    name: 'Controller',
                    description: 'HTTP request handler',
                    technology: 'Spring MVC',
                    position: { x: 100, y: 200 },
                },
                {
                    id: 'service',
                    type: 'component',
                    name: 'Business Service',
                    description: 'Core business logic',
                    technology: 'Spring Service',
                    position: { x: 400, y: 200 },
                },
                {
                    id: 'repository',
                    type: 'component',
                    name: 'Repository',
                    description: 'Data access layer',
                    technology: 'Spring Data',
                    position: { x: 700, y: 200 },
                },
                {
                    id: 'database',
                    type: 'container',
                    name: 'Database',
                    description: 'Data storage',
                    technology: 'PostgreSQL',
                    position: { x: 1000, y: 200 },
                },
            ],
            relationships: [
                { id: 'conn-1', from: 'controller', to: 'service', label: 'Calls' },
                { id: 'conn-2', from: 'service', to: 'repository', label: 'Uses' },
                { id: 'conn-3', from: 'repository', to: 'database', label: 'Queries', technology: 'SQL' },
            ],
        },
    };

    const template = templates[type];
    return JSON.stringify(
        {
            title: template.title,
            description: template.description,
            type: template.type,
            version: '1.0.0',
            metadata: {
                author: 'System Architect',
                created: new Date().toISOString().split('T')[0],
                tags: [type],
            },
            elements: template.elements,
            relationships: template.relationships,
            groups: [],
            layout: {
                type: 'hierarchical',
                direction: 'TB',
            },
        },
        null,
        2,
    );
};
