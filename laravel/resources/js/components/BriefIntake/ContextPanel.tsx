import type { BriefContext } from '@/components/BriefIntake/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
    BrainCircuitIcon,
    CircuitBoardIcon,
    CompassIcon,
    FingerprintIcon,
    GaugeIcon,
    LayersIcon,
    LockKeyholeIcon,
    MilestoneIcon,
    OrbitIcon,
    ScanSearchIcon,
    ShieldCheckIcon,
    SparklesIcon,
    TargetIcon,
    WaypointsIcon,
} from 'lucide-react';

interface ContextPanelProps {
    context: BriefContext | null;
    trigger?: React.ReactNode;
}

const requirementIcons = [TargetIcon, WaypointsIcon, GaugeIcon, LayersIcon, CircuitBoardIcon];
const constraintIcons = [ShieldCheckIcon, FingerprintIcon, LockKeyholeIcon];

export function ContextPanel({ context, trigger }: ContextPanelProps) {
    const completeness = context
        ? Math.min(100, Math.round(((context.requirements.length + context.constraints.length + context.sources.length) / 12) * 100))
        : 0;

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'relative gap-2 overflow-hidden border-border/60 text-xs transition-all',
                            context && 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50',
                        )}
                        disabled={!context}
                    >
                        <BrainCircuitIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Context</span>
                        {context && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                                {context.requirements.length + context.constraints.length}
                            </span>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
                {/* Header */}
                <div className="relative overflow-hidden border-b border-border/50 px-5 pb-4 pt-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-violet-500/[0.03]" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                                <OrbitIcon className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight text-foreground">Project Context</h2>
                                <p className="text-[11px] text-muted-foreground">AI-extracted project intelligence</p>
                            </div>
                        </div>

                        {context && (
                            <div className="mt-4">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                        Completeness
                                    </span>
                                    <span className="text-[11px] font-semibold text-primary">{completeness}%</span>
                                </div>
                                <Progress value={completeness} className="h-1.5 bg-muted/50" indicatorClassName="bg-gradient-to-r from-primary to-violet-500" />
                            </div>
                        )}
                    </div>
                </div>

                {context ? (
                    <ScrollArea className="flex-1">
                        <div className="space-y-1 p-4">
                            {/* Summary */}
                            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                                <div className="mb-2.5 flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10">
                                        <CompassIcon className="h-3.5 w-3.5 text-sky-500" />
                                    </div>
                                    <h3 className="text-xs font-semibold text-foreground">Vision</h3>
                                </div>
                                <p className="text-[13px] leading-relaxed text-muted-foreground">{context.summary}</p>
                            </div>

                            {/* Requirements */}
                            {context.requirements.length > 0 && (
                                <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                                                <MilestoneIcon className="h-3.5 w-3.5 text-emerald-500" />
                                            </div>
                                            <h3 className="text-xs font-semibold text-foreground">Requirements</h3>
                                        </div>
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                                            {context.requirements.length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {context.requirements.map((req, i) => {
                                            const Icon = requirementIcons[i % requirementIcons.length];
                                            return (
                                                <div
                                                    key={i}
                                                    className="group/req flex items-start gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border/40 hover:bg-muted/30"
                                                >
                                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500/10 transition-colors group-hover/req:bg-emerald-500/20">
                                                        <Icon className="h-3 w-3 text-emerald-500" />
                                                    </div>
                                                    <span className="text-[12.5px] leading-relaxed text-foreground/80">{req}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Constraints */}
                            {context.constraints.length > 0 && (
                                <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                                                <ShieldCheckIcon className="h-3.5 w-3.5 text-amber-500" />
                                            </div>
                                            <h3 className="text-xs font-semibold text-foreground">Constraints</h3>
                                        </div>
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                                            {context.constraints.length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {context.constraints.map((c, i) => {
                                            const Icon = constraintIcons[i % constraintIcons.length];
                                            return (
                                                <div
                                                    key={i}
                                                    className="group/con flex items-start gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border/40 hover:bg-muted/30"
                                                >
                                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/10 transition-colors group-hover/con:bg-amber-500/20">
                                                        <Icon className="h-3 w-3 text-amber-500" />
                                                    </div>
                                                    <span className="text-[12.5px] leading-relaxed text-foreground/80">{c}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Sources */}
                            {context.sources.length > 0 && (
                                <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10">
                                            <ScanSearchIcon className="h-3.5 w-3.5 text-violet-500" />
                                        </div>
                                        <h3 className="text-xs font-semibold text-foreground">Sources</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {context.sources.map((src, i) => (
                                            <div
                                                key={i}
                                                className="rounded-lg border border-border/40 bg-gradient-to-r from-muted/30 to-transparent p-3"
                                            >
                                                <div className="mb-1.5 flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'h-[18px] px-1.5 text-[9px] font-bold uppercase tracking-wider',
                                                            src.type === 'user'
                                                                ? 'border-primary/30 text-primary'
                                                                : src.type === 'repo'
                                                                  ? 'border-violet-500/30 text-violet-500'
                                                                  : 'border-sky-500/30 text-sky-500',
                                                        )}
                                                    >
                                                        {src.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-[11.5px] leading-relaxed text-muted-foreground">{src.excerpt}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <div className="relative mb-5">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-xl" />
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card">
                                <BrainCircuitIcon className="h-7 w-7 text-muted-foreground/40" />
                            </div>
                        </div>
                        <h3 className="mb-1.5 text-sm font-medium text-foreground/80">No context yet</h3>
                        <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground/60">
                            Send your first message and the AI will start building your project context.
                        </p>
                    </div>
                )}

                {/* Footer */}
                {context && (
                    <>
                        <Separator />
                        <div className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-1.5">
                                <SparklesIcon className="h-3 w-3 text-primary/50" />
                                <span className="text-[10px] text-muted-foreground/50">
                                    v{context.version} &middot; {new Date(context.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <Badge variant="outline" className="h-[18px] gap-1 border-primary/20 px-1.5 text-[9px] text-primary/60">
                                <SparklesIcon className="h-2.5 w-2.5" />
                                AI Generated
                            </Badge>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
