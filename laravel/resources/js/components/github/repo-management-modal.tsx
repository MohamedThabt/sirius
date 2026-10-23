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
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowUpRight, GitBranch, GitFork, Github, Globe, Loader2, Lock, RefreshCw, Settings2, Unlink, User } from 'lucide-react';
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
                <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 bg-card border-border">
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden bg-background px-6 py-8 text-foreground border-b border-border">
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-4">
                                <div className="group relative">
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-secondary ring-1 ring-border">
                                        <Github className="h-8 w-8 transition-transform group-hover:scale-110 text-foreground" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">GitHub Connected</DialogTitle>
                                        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                                            Active
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">Manage your repository integration and sync specifications</p>
                                </div>
                            </div>

                            {/* Repository quick info bar */}
                            <div className="mt-6 flex items-center gap-3 rounded-xl bg-secondary p-3 ring-1 ring-border">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                                    <GitFork className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">{repository.full_name}</p>
                                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
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
                                            ? 'bg-secondary text-secondary-foreground ring-1 ring-border'
                                            : 'bg-primary/10 text-primary ring-1 ring-primary/20',
                                    )}
                                >
                                    {repository.visibility === 'private' ? <Lock className="mr-1.5 h-3 w-3" /> : <Globe className="mr-1.5 h-3 w-3" />}
                                    {repository.visibility === 'private' ? 'Private' : 'Public'}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    onClick={() => window.open(repository.html_url, '_blank')}
                                >
                                    Open
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-6 bg-card">
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
                                className="group relative w-full overflow-hidden rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground ring-1 ring-border transition-transform group-hover:scale-105">
                                        {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="font-medium text-foreground">
                                            {isSyncing ? 'Syncing Specifications...' : 'Sync Specifications'}
                                        </h5>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            Push latest PRD, database design & features to your repo
                                        </p>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                                </div>
                            </button>

                            {/* Unlink Action Card */}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isDeleting}
                                className="group relative w-full overflow-hidden rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left transition-all hover:border-destructive hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20 transition-transform group-hover:scale-105">
                                        <Unlink className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="font-medium text-destructive">Disconnect Repository</h5>
                                        <p className="mt-0.5 text-sm text-destructive/80">Unlink this repository from the project</p>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 shrink-0 text-destructive/80 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                                </div>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="max-w-md bg-card border-border">
                    <AlertDialogHeader>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-7 w-7 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl text-foreground">Disconnect Repository?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-muted-foreground">
                            <p className="mb-3">
                                You are about to disconnect <span className="font-semibold text-foreground">{repository.full_name}</span> from this
                                project.
                            </p>
                            <div className="rounded-lg bg-secondary p-3 text-left text-sm text-secondary-foreground border border-border">
                                <p className="font-medium">Note:</p>
                                <p className="mt-1 text-muted-foreground">
                                    This will only unlink the repository. Your code and files on GitHub will remain intact.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2 sm:justify-center sm:space-x-3">
                        <AlertDialogCancel disabled={isDeleting} className="sm:w-32 border-border text-foreground hover:bg-muted hover:text-foreground">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground sm:w-32"
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
