import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    ExternalLink,
    GitBranch,
    GitFork,
    Github,
    Globe,
    Loader2,
    Lock,
    RefreshCw,
    Settings2,
    Trash2,
    Unlink,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Repository {
    id: number;
    provider: string;
    repo_id: string;
    name: string;
    full_name: string;
    owner_login: string;
    owner_type: string;
    default_branch: string;
    html_url: string;
    ssh_url: string;
    visibility: string;
}

interface RepoManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    repository: Repository | null;
    projectId: number;
}

export function RepoManagementModal({ open, onOpenChange, repository, projectId }: RepoManagementModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { props } = usePage<any>();

    useEffect(() => {
        if (props.errors?.error) {
            toast.error('Error', {
                description: props.errors.error,
            });
        }

        if (props.flash?.success) {
            const filesCount = props.flash?.files_count;
            const message = props.flash.success;
            
            if (message === 'Repository unlinked successfully.') {
                toast.success('Repository unlinked successfully', {
                    description: 'The GitHub repository has been disconnected from this project.',
                });
                setShowDeleteConfirm(false);
                onOpenChange(false);
            } else if (message.includes('synced successfully')) {
                toast.success('Specs synced successfully', {
                    description: filesCount
                        ? `Successfully updated ${filesCount} specification file(s) in the repository.`
                        : 'Specifications have been updated in the repository.',
                });
            }
        }
    }, [props.errors, props.flash]);

    if (!repository) return null;

    const handleDelete = () => {
        setIsDeleting(true);

        router.delete(`/projects/${projectId}/github/repos`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleSync = () => {
        setIsSyncing(true);

        router.post(
            `/projects/${projectId}/github/repos/sync`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSyncing(false);
                },
            },
        );
    };

    return (
        <>
            <Dialog open={open && !showDeleteConfirm} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden bg-[#0d1117] px-6 py-8 text-white">
                        {/* Animated gradient orbs */}
                        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl" />
                        <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent blur-3xl" />
                        
                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        
                        {/* GitHub contribution-style dots pattern */}
                        <div className="absolute right-6 top-6 grid grid-cols-7 gap-1 opacity-30">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'h-2 w-2 rounded-sm',
                                        Math.random() > 0.6
                                            ? 'bg-emerald-400'
                                            : Math.random() > 0.3
                                              ? 'bg-emerald-600'
                                              : 'bg-slate-700',
                                    )}
                                />
                            ))}
                        </div>

                        <DialogHeader className="relative">
                            <div className="flex items-center gap-4">
                                {/* Animated GitHub logo */}
                                <div className="group relative">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-50 blur transition-all group-hover:opacity-75" />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#161b22] ring-1 ring-white/10">
                                        <Github className="h-8 w-8 transition-transform group-hover:scale-110" />
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                                            GitHub Connected
                                        </DialogTitle>
                                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                            </span>
                                            Active
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Manage your repository integration and sync specifications
                                    </p>
                                </div>
                            </div>

                            {/* Repository quick info bar */}
                            <div className="mt-6 flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                                    <GitFork className="h-5 w-5 text-slate-300" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">{repository.full_name}</p>
                                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <GitBranch className="h-3 w-3" />
                                            {repository.default_branch}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {repository.owner_login}
                                        </span>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'border-0 px-2.5 py-1 text-xs font-medium',
                                        repository.visibility === 'private'
                                            ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
                                            : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30',
                                    )}
                                >
                                    {repository.visibility === 'private' ? (
                                        <Lock className="mr-1.5 h-3 w-3" />
                                    ) : (
                                        <Globe className="mr-1.5 h-3 w-3" />
                                    )}
                                    {repository.visibility === 'private' ? 'Private' : 'Public'}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                                    onClick={() => window.open(repository.html_url, '_blank')}
                                >
                                    Open
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-6">
                        {/* Actions Section */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Settings2 className="h-4 w-4" />
                                Quick Actions
                            </h4>

                            {/* Sync Action Card */}
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="group relative w-full overflow-hidden rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-left transition-all hover:border-blue-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:from-blue-950/30 dark:to-indigo-950/30 dark:hover:border-blue-800"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20 transition-transform group-hover:scale-105 dark:text-blue-400">
                                        {isSyncing ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="font-medium text-blue-900 dark:text-blue-100">
                                            {isSyncing ? 'Syncing Specifications...' : 'Sync Specifications'}
                                        </h5>
                                        <p className="mt-0.5 text-sm text-blue-700/70 dark:text-blue-300/70">
                                            Push latest PRD, database design & features to your repo
                                        </p>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 shrink-0 text-blue-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                                </div>
                            </button>

                            {/* Unlink Action Card */}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isDeleting}
                                className="group relative w-full overflow-hidden rounded-xl border border-red-200/50 bg-gradient-to-r from-red-50 to-rose-50 p-4 text-left transition-all hover:border-red-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/30 dark:from-red-950/20 dark:to-rose-950/20 dark:hover:border-red-800"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 ring-1 ring-red-500/20 transition-transform group-hover:scale-105 dark:text-red-400">
                                        <Unlink className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="font-medium text-red-900 dark:text-red-100">Disconnect Repository</h5>
                                        <p className="mt-0.5 text-sm text-red-700/70 dark:text-red-300/70">
                                            Unlink this repository from the project
                                        </p>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 shrink-0 text-red-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                                </div>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl">Disconnect Repository?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            <p className="mb-3">
                                You are about to disconnect <span className="font-semibold text-foreground">{repository.full_name}</span> from this
                                project.
                            </p>
                            <div className="rounded-lg bg-amber-50 p-3 text-left text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                                <p className="font-medium">Note:</p>
                                <p className="mt-1 text-amber-700 dark:text-amber-300">
                                    This will only unlink the repository. Your code and files on GitHub will remain intact.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2 sm:justify-center sm:space-x-3">
                        <AlertDialogCancel disabled={isDeleting} className="sm:w-32">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 sm:w-32"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Unlinking...
                                </>
                            ) : (
                                'Disconnect'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
