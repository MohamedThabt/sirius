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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, ExternalLink, Github, Loader2, RefreshCw, Trash2 } from 'lucide-react';
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

        if (props.flash?.success && props.flash?.message) {
            const filesCount = props.flash?.files_count;
            if (props.flash.message === 'Repository deleted successfully') {
                toast.success('Repository deleted successfully', {
                    description: 'The GitHub repository has been deleted and disconnected from this project.',
                });
                setShowDeleteConfirm(false);
                onOpenChange(false);
            } else if (props.flash.message === 'Specifications synced successfully') {
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Github className="h-5 w-5" />
                            Repository Management
                        </DialogTitle>
                        <DialogDescription>Manage your connected GitHub repository</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Repository Info Card */}
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">{repository.name}</h3>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    repository.visibility === 'private'
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                }`}
                                            >
                                                {repository.visibility === 'private' ? 'Private' : 'Public'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{repository.full_name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Owner:</span>{' '}
                                            <span className="font-medium">{repository.owner_login}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Branch:</span>{' '}
                                            <span className="font-medium">{repository.default_branch}</span>
                                        </div>
                                    </div>

                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(repository.html_url, '_blank')}>
                                        View on GitHub
                                        <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex-1">
                                    <h4 className="flex items-center gap-2 font-medium">
                                        <RefreshCw className="h-4 w-4 text-blue-500" />
                                        Sync Specifications
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Update the specs folder with the latest project documentation (PRD, Database Design, Features)
                                    </p>
                                </div>
                                <Button onClick={handleSync} disabled={isSyncing} className="ml-4 gap-2">
                                    {isSyncing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4" />
                                            Sync Now
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                                <div className="flex-1">
                                    <h4 className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                        Delete Repository
                                    </h4>
                                    <p className="mt-1 text-sm text-red-600/80 dark:text-red-300/80">
                                        Permanently delete this repository from GitHub. This action cannot be undone.
                                    </p>
                                </div>
                                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting} className="ml-4 gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Repository?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p>
                                Are you sure you want to delete <strong className="font-semibold">{repository.full_name}</strong>?
                            </p>
                            <p className="font-medium text-red-600 dark:text-red-400">
                                This will permanently delete the repository from GitHub and remove all its contents. This action cannot be undone.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Repository'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
