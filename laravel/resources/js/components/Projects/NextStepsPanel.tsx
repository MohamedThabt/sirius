import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, Loader2 } from 'lucide-react';

interface Step {
    title: string;
    description: string;
    action: () => void;
    icon: React.ComponentType<{ className?: string }>;
    priority: 'critical' | 'high' | 'medium' | 'low';
    isLoading: boolean;
}

interface Props {
    steps: Step[];
    className?: string;
}

export function NextStepsPanel({ steps, className }: Props) {
    if (steps.length === 0) return null;

    return (
        <Card className={cn("border-l-4 border-l-primary shadow-sm", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    Next Steps
                    <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                        {steps.length} pending
                    </span>
                </CardTitle>
                <CardDescription>
                    Follow this roadmap to move your project forward.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                {steps.map((step, index) => (
                    <div 
                        key={index} 
                        className={cn(
                            "group flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md",
                            index === 0 ? "bg-background border-primary/20" : "bg-muted/30 border-transparent"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "p-2 rounded-md shrink-0 mt-0.5",
                                step.priority === 'critical' ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                                step.priority === 'high' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" :
                                "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            )}>
                                <step.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                                    {step.title}
                                    {index === 0 && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                            Current
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={step.action} 
                            disabled={step.isLoading}
                            className={cn(
                                "shrink-0 ml-4",
                                index === 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "variant-outline"
                            )}
                            variant={index === 0 ? "default" : "outline"}
                        >
                            {step.isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    Start
                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                </span>
                            )}
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
