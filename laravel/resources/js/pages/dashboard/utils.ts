export const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        completed: 'bg-emerald-500/5 text-emerald-600/70 dark:text-emerald-400/70 border-emerald-500/10',
        in_progress: 'bg-blue-500/5 text-blue-600/70 dark:text-blue-400/70 border-blue-500/10',
        draft: 'bg-zinc-500/5 text-zinc-600/70 dark:text-zinc-400/70 border-zinc-500/10',
        pending: 'bg-amber-500/5 text-amber-600/70 dark:text-amber-400/70 border-amber-500/10',
        approved: 'bg-emerald-500/5 text-emerald-600/70 dark:text-emerald-400/70 border-emerald-500/10',
        denied: 'bg-red-500/5 text-red-600/70 dark:text-red-400/70 border-red-500/10',
    };
    return colors[status.toLowerCase()] || colors.draft;
};
