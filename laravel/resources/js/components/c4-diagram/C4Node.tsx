import { cn } from '@/lib/utils';
import { C4Element } from '@/utils/c4Validator';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { Box, Combine, Component as ComponentIcon, Database, GitBranch, Server, ShieldCheck, User } from 'lucide-react';
import { memo } from 'react';

// Enhanced styles with more distinct colors and modern look
const elementStyles = {
    person: {
        icon: User,
        borderColor: 'border-blue-500/80',
        bgColor: 'bg-blue-50 dark:bg-blue-900/40',
        headerColor: 'bg-blue-600 dark:bg-blue-700',
        contentColor: 'bg-blue-50 dark:bg-blue-900/40',
        titleColor: 'text-white',
        textColor: 'text-blue-800 dark:text-blue-100',
        shadowColor: 'shadow-lg',
    },
    'software-system': {
        icon: Box,
        borderColor: 'border-gray-500/80',
        bgColor: 'bg-gray-50 dark:bg-gray-900/40',
        headerColor: 'bg-gray-600 dark:bg-gray-700',
        contentColor: 'bg-gray-50 dark:bg-gray-900/40',
        titleColor: 'text-white',
        textColor: 'text-gray-800 dark:text-gray-100',
        shadowColor: 'shadow-lg',
    },
    'software-system-external': {
        icon: Box,
        borderColor: 'border-indigo-500/80',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/40',
        headerColor: 'bg-indigo-600 dark:bg-indigo-700',
        contentColor: 'bg-indigo-50 dark:bg-indigo-900/40',
        titleColor: 'text-white',
        textColor: 'text-indigo-800 dark:text-indigo-100',
        shadowColor: 'shadow-lg',
    },
    container: {
        icon: Server,
        borderColor: 'border-cyan-500/80',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/40',
        headerColor: 'bg-cyan-600 dark:bg-cyan-700',
        contentColor: 'bg-cyan-50 dark:bg-cyan-900/40',
        titleColor: 'text-white',
        textColor: 'text-cyan-800 dark:text-cyan-100',
        shadowColor: 'shadow-lg',
    },
    component: {
        icon: ComponentIcon,
        borderColor: 'border-green-500/80',
        bgColor: 'bg-green-50 dark:bg-green-900/40',
        headerColor: 'bg-green-600 dark:bg-green-700',
        contentColor: 'bg-green-50 dark:bg-green-900/40',
        titleColor: 'text-white',
        textColor: 'text-green-800 dark:text-green-100',
        shadowColor: 'shadow-lg',
    },
    boundary: {
        icon: Combine,
        borderColor: 'border-dashed border-gray-400 dark:border-gray-600',
        bgColor: 'bg-gray-50/50 dark:bg-gray-900/50',
        headerColor: 'bg-transparent',
        contentColor: 'bg-transparent',
        titleColor: 'text-gray-500 dark:text-gray-400',
        textColor: 'text-gray-500 dark:text-gray-400',
        shadowColor: 'shadow-none',
    },
};

// Technology to icon mapping
const technologyIcons: { [key: string]: any } = {
    database: Database,
    postgres: Database,
    security: ShieldCheck,
    spring: GitBranch,
    controller: GitBranch,
};

const C4Node = memo(({ data }: NodeProps<any>) => {
    const elementData = data as unknown as C4Element;
    const styleKey = elementData.type === 'software-system' && elementData.isExternal ? 'software-system-external' : elementData.type;
    const styles = elementStyles[styleKey as keyof typeof elementStyles] || elementStyles['software-system'];

    // Determine the icon for the element
    let Icon = styles.icon;
    if (elementData.technology) {
        const techKey = Object.keys(technologyIcons).find((key) => elementData.technology!.toLowerCase().includes(key));
        if (techKey) {
            Icon = technologyIcons[techKey];
        }
    }

    const typeLabel = `[${elementData.type.replace('-', ' ')}]`.replace(/\b\w/g, (char) => char.toUpperCase());

    if (elementData.type === 'boundary') {
        return (
            <div
                className={cn('rounded-lg border-2 p-4', styles.borderColor, styles.bgColor)}
                style={{ width: elementData.width, height: elementData.height }}
            >
                <div className={cn('text-sm font-bold', styles.titleColor)}>
                    {elementData.name}
                    <p className="font-mono text-xs opacity-80">{typeLabel}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'max-w-[280px] min-w-[220px] rounded-lg border-2 transition-all duration-300 hover:shadow-xl',
                styles.borderColor,
                styles.shadowColor,
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className={cn(
                    '!h-3 !w-3 !border-2 !bg-white',
                    styleKey === 'person'
                        ? '!border-blue-500'
                        : styleKey === 'software-system'
                          ? '!border-gray-500'
                          : styleKey === 'software-system-external'
                            ? '!border-indigo-500'
                            : styleKey === 'container'
                              ? '!border-cyan-500'
                              : styleKey === 'component'
                                ? '!border-green-500'
                                : '!border-gray-300',
                )}
            />

            {/* Header Section - Bright Color */}
            <div className={cn('rounded-t-lg p-3 text-center', styles.headerColor)}>
                <h3 className={cn('mb-1 text-base font-bold', styles.titleColor)}>{elementData.name}</h3>
                <p className={cn('font-mono text-xs', styles.titleColor, 'opacity-80')}>{typeLabel}</p>
            </div>

            {/* Content Section - Dark Color with Visual Elements */}
            <div className={cn('relative rounded-b-lg p-4', styles.contentColor)}>
                {/* Dotted Grid Pattern Background */}
                <div
                    className="absolute inset-0 rounded-b-lg opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                        backgroundSize: '8px 8px',
                    }}
                ></div>

                {/* Vertical Center Line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 transform bg-gray-400 opacity-50"></div>

                {/* Content */}
                <div className="relative z-10 text-center">
                    <Icon className={cn('mx-auto mb-3 h-8 w-8', styles.textColor, 'opacity-70')} />
                    <p className={cn('mb-3 text-xs leading-snug', styles.textColor)}>{elementData.description}</p>
                    {elementData.technology && (
                        <div className="flex justify-center">
                            <span
                                className={cn(
                                    'inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide',
                                    styles.headerColor,
                                    styles.titleColor,
                                    'opacity-90',
                                )}
                            >
                                {elementData.technology}
                            </span>
                        </div>
                    )}
                </div>

                {/* Bottom Connection Point */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform">
                    <div
                        className={cn(
                            'h-2 w-2 rounded-full border-2 border-white',
                            styleKey === 'person'
                                ? 'bg-blue-500'
                                : styleKey === 'software-system'
                                  ? 'bg-gray-500'
                                  : styleKey === 'software-system-external'
                                    ? 'bg-indigo-500'
                                    : styleKey === 'container'
                                      ? 'bg-cyan-500'
                                      : styleKey === 'component'
                                        ? 'bg-green-500'
                                        : 'bg-purple-500',
                        )}
                    ></div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className={cn(
                    '!h-3 !w-3 !border-2 !bg-white',
                    styleKey === 'person'
                        ? '!border-blue-500'
                        : styleKey === 'software-system'
                          ? '!border-gray-500'
                          : styleKey === 'software-system-external'
                            ? '!border-indigo-500'
                            : styleKey === 'container'
                              ? '!border-cyan-500'
                              : styleKey === 'component'
                                ? '!border-green-500'
                                : '!border-gray-300',
                )}
            />
        </div>
    );
});

C4Node.displayName = 'C4Node';

export default C4Node;
