import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import { Building2, CheckCircle2, Github, Globe, Loader2, Lock, Search, User as UserIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface RepoConnectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    projectName?: string;
}

interface GithubUser {
    login: string;
    avatar: string;
}

interface Repository {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    description: string | null;
    html_url: string;
}

interface Organization {
    org: {
        login: string;
        avatar_url: string;
        description: string | null;
    };
    repos: Repository[];
}

interface ReposData {
    user: GithubUser;
    userRepos: Repository[];
    organizations: Record<string, Organization>;
}

/**
 * Convert project name to a valid GitHub repository name
 * - Lowercase
 * - Replace spaces and special chars with hyphens
 * - Remove invalid characters
 */
function sanitizeRepoName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function RepoConnectDialog({ open, onOpenChange, projectId, projectName }: RepoConnectDialogProps) {
    const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
    const [loading, setLoading] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
    const [reposData, setReposData] = useState<ReposData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [creating, setCreating] = useState(false);
    const [pushing, setPushing] = useState(false);
    const [showPushConfirm, setShowPushConfirm] = useState(false);
    // Create repo form state
    const [repoName, setRepoName] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('private');
    const [ownerType, setOwnerType] = useState<'user' | 'org'>('user');
    const [ownerLogin, setOwnerLogin] = useState('');
    const [description, setDescription] = useState('');

    const checkAuth = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/projects/${projectId}/github/connect`);

            // If redirected to OAuth, follow the redirect
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            const data = await response.json();
            if (data.authenticated) {
                setAuthenticated(true);
                setGithubUser({
                    login: data.username,
                    avatar: data.avatar,
                });
                loadRepos();
            } else {
                setAuthenticated(false);
                // Store redirect URL for when user clicks connect button
                if (data.redirect_url) {
                    sessionStorage.setItem('github_redirect_url', data.redirect_url);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (open) {
            checkAuth();
        }
    }, [open, checkAuth]);

    // Set default repo name from project name when switching to create tab
    useEffect(() => {
        if (activeTab === 'create' && projectName && !repoName) {
            setRepoName(sanitizeRepoName(projectName));
        }
    }, [activeTab, projectName, repoName]);

    const connectGithub = () => {
        // Use stored redirect URL or fallback to the OAuth redirect endpoint
        const redirectUrl = sessionStorage.getItem('github_redirect_url') || '/integrations/github/redirect';
        window.location.href = redirectUrl;
    };

    const loadRepos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/projects/${projectId}/github/repos`);
            const data = await response.json();
            setReposData(data);
            if (data.user) {
                setOwnerLogin(data.user.login);
            }
        } catch (error) {
            console.error('Failed to load repositories', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRepo = async () => {
        if (!repoName.trim()) return;

        setCreating(true);
        const loadingToast = toast.loading('Creating repository...', {
            description: 'Setting up your GitHub repository',
        });

        try {
            const response = await fetch(`/projects/${projectId}/github/repos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: repoName,
                    visibility,
                    owner_type: ownerType,
                    owner_login: ownerLogin,
                    description,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.dismiss(loadingToast);
                toast.success('✅ Repository created successfully!', {
                    description: 'Now pushing your project files...',
                });
                // Auto-push after creation
                handlePushInitial();
            } else {
                toast.dismiss(loadingToast);
                toast.error(data.error || 'Failed to create repository');
            }
        } catch {
            toast.dismiss(loadingToast);
            toast.error('Failed to create repository', {
                description: 'Please check your internet connection and try again.',
            });
        } finally {
            setCreating(false);
        }
    };

    const handleLinkRepo = async (fullName: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/projects/${projectId}/github/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    full_name: fullName,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // If repo is empty, offer to push
                if (data.is_empty) {
                    toast.success('🔗 Repository linked successfully!', {
                        description: 'Repository is empty and ready for your files.',
                    });
                    setShowPushConfirm(true);
                } else {
                    toast.success('🔗 Repository linked successfully!', {
                        description: 'Your project is now connected to GitHub.',
                    });
                    onOpenChange(false);
                    router.reload();
                }
            } else {
                toast.error(data.error || 'Failed to link repository', {
                    description: 'Please verify the repository exists and you have access.',
                });
            }
        } catch {
            toast.error('Failed to link repository', {
                description: 'Please check your internet connection and try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePushInitial = async () => {
        setPushing(true);
        try {
            const response = await fetch(`/projects/${projectId}/github/push-initial`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('🚀 Push initiated! Your files are being uploaded to the repository.', {
                    description: 'This may take a few minutes depending on your project size.',
                    duration: 5000,
                });
                onOpenChange(false);
                router.reload();
            } else {
                toast.error(data.error || 'Failed to push files', {
                    description: 'There was an issue uploading your files to GitHub.',
                });
            }
        } catch {
            toast.error('Failed to push files', {
                description: 'Please check your internet connection and repository permissions.',
            });
        } finally {
            setPushing(false);
        }
    };

    const filteredRepos = () => {
        if (!reposData) return [];

        const allRepos = [
            ...reposData.userRepos.map((r) => ({ ...r, owner: reposData.user.login, ownerType: 'user' })),
            ...Object.values(reposData.organizations).flatMap((org) => org.repos.map((r) => ({ ...r, owner: org.org.login, ownerType: 'org' }))),
        ];

        if (!searchQuery) return allRepos;

        return allRepos.filter(
            (r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <Github className="h-6 w-6" />
                            <div>
                                <DialogTitle>Save to GitHub</DialogTitle>
                                <DialogDescription>Connect your project to a GitHub repository</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {!authenticated ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <Github className="h-16 w-16 text-muted-foreground" />
                            <div className="text-center">
                                <h3 className="mb-2 text-lg font-semibold">Connect GitHub</h3>
                                <p className="mb-4 text-sm text-muted-foreground">Connect your GitHub account to create or link repositories</p>
                            </div>
                            <Button onClick={connectGithub} size="lg" className="gap-2">
                                <Github className="h-5 w-5" />
                                Connect GitHub Account
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Connected Account Info */}
                            {githubUser && (
                                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                                    <img src={githubUser.avatar} alt={githubUser.login} className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <p className="font-medium">{githubUser.login}</p>
                                        <p className="text-sm text-muted-foreground">Connected</p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                            )}

                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'select' | 'create')}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="select">Select Repo</TabsTrigger>
                                    <TabsTrigger value="create">Create New</TabsTrigger>
                                </TabsList>

                                <TabsContent value="select" className="space-y-4">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search repositories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Repositories List */}
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="max-h-96 space-y-2 overflow-y-auto">
                                            {filteredRepos().map((repo) => (
                                                <button
                                                    key={repo.full_name}
                                                    onClick={() => handleLinkRepo(repo.full_name)}
                                                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <span className="truncate font-medium">{repo.name}</span>
                                                                {repo.private ? (
                                                                    <Lock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                                                ) : (
                                                                    <Globe className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <p className="truncate text-xs text-muted-foreground">{repo.full_name}</p>
                                                            {repo.description && (
                                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{repo.description}</p>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline" className="flex-shrink-0">
                                                            {(repo as any).ownerType === 'org' ? (
                                                                <Building2 className="mr-1 h-3 w-3" />
                                                            ) : (
                                                                <UserIcon className="mr-1 h-3 w-3" />
                                                            )}
                                                            {(repo as any).owner}
                                                        </Badge>
                                                    </div>
                                                </button>
                                            ))}

                                            {filteredRepos().length === 0 && (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    <p>No repositories found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="create" className="space-y-4">
                                    <div className="space-y-4">
                                        {/* Owner Selector */}
                                        <div className="space-y-2">
                                            <Label>Owner</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Select value={ownerType} onValueChange={(v) => setOwnerType(v as 'user' | 'org')}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">
                                                                <div className="flex items-center gap-2">
                                                                    <UserIcon className="h-4 w-4" />
                                                                    User
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="org">
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4" />
                                                                    Organization
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    {ownerType === 'user' ? (
                                                        <Select value={ownerLogin} onValueChange={setOwnerLogin}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {reposData && (
                                                                    <SelectItem value={reposData.user.login}>{reposData.user.login}</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Select value={ownerLogin} onValueChange={setOwnerLogin}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select organization" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {reposData &&
                                                                    Object.keys(reposData.organizations).map((orgLogin) => (
                                                                        <SelectItem key={orgLogin} value={orgLogin}>
                                                                            {orgLogin}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Repository Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="repo-name">Repository Name</Label>
                                            <Input
                                                id="repo-name"
                                                placeholder="my-awesome-project"
                                                value={repoName}
                                                onChange={(e) => setRepoName(e.target.value)}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (optional)</Label>
                                            <Input
                                                id="description"
                                                placeholder="A brief description of your project"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>

                                        {/* Visibility */}
                                        <div className="space-y-2">
                                            <Label>Visibility</Label>
                                            <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'private')}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="private">
                                                        <div className="flex items-center gap-2">
                                                            <Lock className="h-4 w-4" />
                                                            Private
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="public">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="h-4 w-4" />
                                                            Public
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Create Button */}
                                        <Button onClick={handleCreateRepo} disabled={!repoName.trim() || creating || pushing} className="w-full">
                                            {creating || pushing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {creating ? 'Creating...' : 'Pushing files...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Github className="mr-2 h-4 w-4" />
                                                    Create Repository
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Push Confirmation Dialog */}
            <Dialog open={showPushConfirm} onOpenChange={setShowPushConfirm}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Push Project Files?</DialogTitle>
                        <DialogDescription>This repository is empty. Would you like to push your project files now?</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowPushConfirm(false);
                                onOpenChange(false);
                                router.reload();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowPushConfirm(false);
                                handlePushInitial();
                            }}
                        >
                            Push Files
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
