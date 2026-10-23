import { cn } from '@/lib/utils';
import { ArrowUpRight, Github } from 'lucide-react';

export const SIRIUS_REPO_URL = 'https://github.com/MohamedThabt/sirius';

/** Sidebar row linking to the project's source code on GitHub. */
export function GithubRepoLink({ className }: { className?: string }) {
    return (
        <a
            href={SIRIUS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground',
                className,
            )}
        >
            <Github className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Source code</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </a>
    );
}
