import { Badge } from '@/components/ui/badge';
import { BaseNode, BaseNodeContent, BaseNodeHeader, BaseNodeHeaderTitle } from '@/components/ui/base-node';
import { cn } from '@/lib/utils';
import { C4Element } from '@/utils/c4Validator';
import { Handle, NodeProps, Position } from '@xyflow/react';
import {
    Box,
    Cloud,
    Cog,
    Component as ComponentIcon,
    Container,
    Database,
    Globe,
    Layers,
    Server,
    Smartphone,
    User,
    Users,
} from 'lucide-react';
import { memo } from 'react';

// C4 element type configurations with appropriate icons and badge colors
const elementConfig: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    label: string;
}> = {
    person: {
        icon: User,
        badgeClass: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400',
        label: 'Person',
    },
    'person-external': {
        icon: Users,
        badgeClass: 'border-slate-500/50 bg-slate-500/10 text-slate-600 dark:text-slate-400',
        label: 'External Person',
    },
    'software-system': {
        icon: Box,
        badgeClass: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        label: 'System',
    },
    'software-system-external': {
        icon: Cloud,
        badgeClass: 'border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-400',
        label: 'External System',
    },
    container: {
        icon: Container,
        badgeClass: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        label: 'Container',
    },
    component: {
        icon: ComponentIcon,
        badgeClass: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        label: 'Component',
    },
    database: {
        icon: Database,
        badgeClass: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label: 'Database',
    },
    'web-application': {
        icon: Globe,
        badgeClass: 'border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-400',
        label: 'Web App',
    },
    'mobile-application': {
        icon: Smartphone,
        badgeClass: 'border-pink-500/50 bg-pink-500/10 text-pink-600 dark:text-pink-400',
        label: 'Mobile App',
    },
    'api-gateway': {
        icon: Layers,
        badgeClass: 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400',
        label: 'API Gateway',
    },
    microservice: {
        icon: Cog,
        badgeClass: 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400',
        label: 'Microservice',
    },
    boundary: {
        icon: Box,
        badgeClass: 'border-gray-500/50 bg-gray-500/10 text-gray-600 dark:text-gray-400',
        label: 'Boundary',
    },
};

// Technology to icon mapping for overriding based on technology stack
const technologyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    // Databases
    database: Database,
    postgres: Database,
    postgresql: Database,
    mysql: Database,
    mongodb: Database,
    mongo: Database,
    redis: Database,
    elasticsearch: Database,
    cassandra: Database,
    mariadb: Database,
    sqlite: Database,
    
    // APIs & Gateways
    api: Layers,
    rest: Layers,
    graphql: Layers,
    grpc: Layers,
    gateway: Layers,
    
    // Web Technologies
    web: Globe,
    browser: Globe,
    react: Globe,
    vue: Globe,
    angular: Globe,
    svelte: Globe,
    next: Globe,
    nextjs: Globe,
    nuxt: Globe,
    gatsby: Globe,
    
    // Mobile Technologies
    mobile: Smartphone,
    ios: Smartphone,
    android: Smartphone,
    flutter: Smartphone,
    'react-native': Smartphone,
    'react native': Smartphone,
    reactnative: Smartphone,
    
    // Backend/Server Technologies
    server: Server,
    nginx: Server,
    apache: Server,
    spring: Server,
    springboot: Server,
    'spring boot': Server,
    django: Server,
    flask: Server,
    fastapi: Server,
    express: Server,
    expressjs: Server,
    nestjs: Server,
    laravel: Server,
    
    // Cloud & Infrastructure
    cloud: Cloud,
    aws: Cloud,
    azure: Cloud,
    gcp: Cloud,
    docker: Cloud,
    kubernetes: Cloud,
    k8s: Cloud,
    
    // Microservices & Components
    microservice: Cog,
    service: Cog,
};

const getConfigForElement = (element: C4Element) => {
    // Determine the config key
    let configKey = element.type;
    
    // Handle external systems
    if (element.type === 'software-system' && element.isExternal) {
        configKey = 'software-system-external';
    }
    
    // Handle external persons
    if (element.type === 'person' && element.isExternal) {
        configKey = 'person-external';
    }
    
    // Check technology for special types (with normalized matching)
    if (element.technology) {
        const tech = element.technology.toLowerCase().trim();
        
        // Database detection
        if (tech.includes('database') || tech.includes('postgres') || tech.includes('mysql') || 
            tech.includes('mongo') || tech.includes('redis') || tech.includes('mariadb') ||
            tech.includes('cassandra') || tech.includes('elasticsearch') || tech.includes('sqlite')) {
            configKey = 'database';
        } 
        // API Gateway detection
        else if (tech.includes('api') || tech.includes('gateway')) {
            configKey = 'api-gateway';
        } 
        // Web Application detection
        else if (tech.includes('web') || tech.includes('browser') || tech.includes('spa') || 
                 tech.includes('react') || tech.includes('vue') || tech.includes('angular') ||
                 tech.includes('svelte') || tech.includes('next') || tech.includes('nuxt') ||
                 tech.includes('gatsby') || tech.includes('frontend')) {
            configKey = 'web-application';
        } 
        // Mobile Application detection
        else if (tech.includes('mobile') || tech.includes('ios') || tech.includes('android') || 
                 tech.includes('flutter') || tech.includes('react native') || tech.includes('react-native')) {
            configKey = 'mobile-application';
        } 
        // Microservice detection
        else if (tech.includes('microservice') || tech.includes('service') ||
                 tech.includes('spring') || tech.includes('django') || tech.includes('flask') ||
                 tech.includes('fastapi') || tech.includes('express') || tech.includes('nestjs') ||
                 tech.includes('laravel') || tech.includes('backend')) {
            configKey = 'microservice';
        }
    }
    
    return elementConfig[configKey] || elementConfig['software-system'];
};

const getIconForTechnology = (technology: string | undefined, defaultIcon: React.ComponentType<{ className?: string }>) => {
    if (!technology) return defaultIcon;
    
    const tech = technology.toLowerCase();
    for (const [key, icon] of Object.entries(technologyIcons)) {
        if (tech.includes(key)) {
            return icon;
        }
    }
    return defaultIcon;
};

const C4Node = memo(({ data, selected }: NodeProps<any>) => {
    const element = data as unknown as C4Element;
    const config = getConfigForElement(element);
    const Icon = getIconForTechnology(element.technology, config.icon);

    // Handle boundary nodes differently
    if (element.type === 'boundary') {
        return (
            <div
                className={cn(
                    'relative rounded-xl border-[3px] border-dashed overflow-hidden',
                    'border-indigo-400/60 dark:border-indigo-500/50',
                    'bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-transparent',
                    'dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-transparent',
                    'shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] dark:shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]',
                    selected && 'ring-2 ring-primary ring-offset-2',
                )}
                style={{ width: element.width, height: element.height }}
            >
                {/* Header bar with gradient */}
                <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-indigo-500/10 dark:from-indigo-500/30 dark:via-purple-500/20 dark:to-indigo-500/15 border-b border-dashed border-indigo-400/40 dark:border-indigo-500/30">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 dark:bg-indigo-500/30">
                        <Box className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide">
                        {element.name}
                    </span>
                </div>
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-[3px] border-l-[3px] border-indigo-500/60 dark:border-indigo-400/50 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-[3px] border-r-[3px] border-indigo-500/60 dark:border-indigo-400/50 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[3px] border-l-[3px] border-indigo-500/60 dark:border-indigo-400/50 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[3px] border-r-[3px] border-indigo-500/60 dark:border-indigo-400/50 rounded-br-xl" />
            </div>
        );
    }

    return (
        <BaseNode
            className={cn(
                'group relative w-[240px] transition-all',
                'border-border bg-background',
                'cursor-pointer hover:shadow-lg',
                selected && 'ring-2 ring-primary ring-offset-2',
            )}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !bg-primary !border-2 !border-background"
            />

            {/* Header with Icon and Type */}
            <BaseNodeHeader className="justify-between bg-background">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                            'bg-muted text-muted-foreground',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                    <BaseNodeHeaderTitle className="text-xs">{element.name}</BaseNodeHeaderTitle>
                </div>
                {element.isExternal && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
                        <Cloud className="h-3 w-3" />
                    </div>
                )}
            </BaseNodeHeader>

            {/* Content */}
            <BaseNodeContent className="space-y-3">
                <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {element.description || 'No description available'}
                </p>

                {/* Type and Technology Badges */}
                <div className="flex flex-wrap justify-center gap-1.5">
                    <Badge
                        variant="outline"
                        className={cn('text-[10px] font-semibold', config.badgeClass)}
                    >
                        {config.label}
                    </Badge>
                    {element.technology && (
                        <Badge
                            variant="outline"
                            className="text-[10px] font-semibold"
                        >
                            {element.technology}
                        </Badge>
                    )}
                </div>
            </BaseNodeContent>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !bg-primary !border-2 !border-background"
            />
        </BaseNode>
    );
});

C4Node.displayName = 'C4Node';

export default C4Node;
