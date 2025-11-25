import { CheckCircleIcon, CircleIcon, ClockIcon, FileIcon, LayersIcon, LightbulbIcon, ZapIcon, CodeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
    id: number;
    name: string;
    c4: string | null;
    brief: string;
}

interface Sections {
    overview: string | null;
    prd: string | null;
    data_modeling: string | null;
}

interface Props {
    project: Project;
    sections: Sections;
    featuresCount: number;
    className?: string;
}

export function ProjectStepper({ project, sections, featuresCount, className }: Props) {
    const steps = [
        {
            id: 'overview',
            label: 'Overview',
            icon: FileIcon,
            isCompleted: !!sections.overview,
            isCurrent: !sections.overview,
        },
        {
            id: 'brainstorming',
            label: 'Brainstorming',
            icon: LightbulbIcon,
            isCompleted: featuresCount > 0, // Assuming brainstorming leads to features
            isCurrent: !!sections.overview && featuresCount === 0,
        },
        {
            id: 'features',
            label: 'Features',
            icon: ZapIcon,
            isCompleted: featuresCount > 0,
            isCurrent: !!sections.overview && featuresCount === 0, // Overlap with brainstorming? Or maybe features comes after?
            // Let's refine: Brainstorming -> Features. 
            // If features exist, brainstorming is "done" or at least passed.
        },
        {
            id: 'prd',
            label: 'PRD',
            icon: FileIcon,
            isCompleted: !!sections.prd,
            isCurrent: featuresCount > 0 && !sections.prd,
        },
        {
            id: 'architecture',
            label: 'Architecture',
            icon: LayersIcon,
            isCompleted: !!project.c4,
            isCurrent: !!sections.prd && !project.c4,
        },
        {
            id: 'implementation',
            label: 'Implementation',
            icon: CodeIcon,
            isCompleted: false, // TODO: Define completion for implementation
            isCurrent: !!project.c4,
        },
    ];

    // Refine steps logic to ensure only one "current"
    let foundCurrent = false;
    const processedSteps = steps.map(step => {
        let status: 'completed' | 'current' | 'pending' = 'pending';
        if (step.isCompleted) {
            status = 'completed';
        } else if (!foundCurrent && step.isCurrent) {
            status = 'current';
            foundCurrent = true;
        } else {
            status = 'pending';
        }
        
        // Special case: if all previous are completed and this one isn't, it's current (fallback)
        // But the isCurrent logic above should handle it.
        
        return { ...step, status };
    });

    // If everything is completed, the last one might be current or completed. 
    // For now, let's stick to the logic above.

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500"
                    style={{ 
                        width: `${(processedSteps.filter(s => s.status === 'completed').length / (processedSteps.length - 1)) * 100}%` 
                    }} 
                />

                {processedSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                        <div 
                            className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300",
                                step.status === 'completed' && "bg-primary border-primary text-primary-foreground",
                                step.status === 'current' && "border-primary text-primary ring-4 ring-primary/20",
                                step.status === 'pending' && "border-muted text-muted-foreground bg-background"
                            )}
                        >
                            {step.status === 'completed' ? (
                                <CheckCircleIcon className="w-4 h-4" />
                            ) : (
                                <step.icon className="w-4 h-4" />
                            )}
                        </div>
                        <span 
                            className={cn(
                                "text-xs font-medium transition-colors duration-300",
                                step.status === 'completed' && "text-primary",
                                step.status === 'current' && "text-foreground font-bold",
                                step.status === 'pending' && "text-muted-foreground"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
