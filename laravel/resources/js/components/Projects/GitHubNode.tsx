import { cn } from '@/lib/utils';
import type { Repository } from '@/types';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { ArrowUpRight, CheckCircle2, GitBranch, Github, Globe, Lock, Plus } from 'lucide-react';
import { memo } from 'react';

interface GitHubNodeData {
    repository: Repository | null;
    isConnected: boolean;
    onConnect: () => void;
    onManage: () => void;
    inputHandleIds?: string[];
}

type GitHubNodeProps = NodeProps<GitHubNodeData>;

const GitHubNode = memo(({ data, selected }: GitHubNodeProps) => {
    const { repository, isConnected, onConnect, onManage, inputHandleIds = ['github-input-top', 'github-input-center', 'github-input-bottom'] } = data;

    return (
        <div
            className={cn(
                'group relative w-[220px] overflow-hidden rounded-[22px] border transition-all duration-200 ease-out',
                'cursor-pointer bg-card',
                isConnected ? 'border-border/50' : 'border-dashed border-border/30',
                'hover:-translate-y-0.5 hover:border-border/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]',
                selected && 'ring-1 ring-primary/30 ring-offset-2 ring-offset-transparent',
            )}
            onClick={isConnected ? onManage : onConnect}
        >
            {/* Left accent bar */}
            <div className={cn('absolute top-0 left-0 h-full w-[3px] rounded-l-[22px] transition-colors duration-300', isConnected ? 'bg-emerald-500/30' : 'bg-transparent')} />

            {/* Input handles for edge routing */}
            <Handle
                id={inputHandleIds[0]}
                type="target"
                position={Position.Left}
                style={{ top: '25%' }}
                className="!h-2 !w-2 !rounded-full !border-0 !bg-border/40 transition-all duration-200 group-hover:!scale-125 group-hover:!bg-primary/60"
            />
            <Handle
                id={inputHandleIds[1]}
                type="target"
                position={Position.Left}
                style={{ top: '50%' }}
                className="!h-2 !w-2 !rounded-full !border-0 !bg-border/40 transition-all duration-200 group-hover:!scale-125 group-hover:!bg-primary/60"
            />
            <Handle
                id={inputHandleIds[2]}
                type="target"
                position={Position.Left}
                style={{ top: '75%' }}
                className="!h-2 !w-2 !rounded-full !border-0 !bg-border/40 transition-all duration-200 group-hover:!scale-125 group-hover:!bg-primary/60"
            />

            <div className="space-y-2.5 py-4 pr-4 pl-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-all duration-200',
                            isConnected ? 'bg-foreground/5' : 'bg-muted/20',
                        )}
                    >
                        <Github className={cn('h-3.5 w-3.5 transition-colors', isConnected ? 'text-foreground/70' : 'text-muted-foreground/30')} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[13px] font-medium tracking-tight text-card-foreground/90">
                            {isConnected && repository ? repository.name : 'GitHub'}
                        </h3>
                    </div>
                </div>

                {isConnected && repository ? (
                    <>
                        {/* Connected status */}
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
                            <span className="text-[10px] font-medium tracking-wide text-emerald-600/60 uppercase dark:text-emerald-400/60">Connected</span>
                        </div>

                        {/* Repo metadata pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-border/20 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60">
                                <GitBranch className="h-2.5 w-2.5" />
                                {repository.default_branch}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-border/20 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60">
                                {repository.visibility === 'private' ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                                {repository.visibility}
                            </span>
                        </div>

                        {/* Repo link */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70">
                            <ArrowUpRight className="h-2.5 w-2.5" />
                            <span className="truncate">{repository.full_name}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-[11px] leading-[1.5] text-muted-foreground/40">Connect a repository to link your docs</p>
                        {/* CTA hint */}
                        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-primary/50 uppercase transition-colors group-hover:text-primary/70">
                            <Plus className="h-2.5 w-2.5" />
                            <span>Connect</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

GitHubNode.displayName = 'GitHubNode';

export default GitHubNode;
