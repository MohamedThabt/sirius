import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Plus, RefreshCw, Layers } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type User } from '@/types';

interface Project {
    id: number;
    name: string;
    brief: string;
    prd: string;
    status: string;
    created_at: string;
    updated_at: string;
}

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

interface Module {
    name: string;
    description: string;
    metrics?: string;
}

interface Props {
    project: Project;
    generatedModules?: Module[];
    fromCache?: boolean;
    repository?: Repository | null;
}

export default function ModulesSuggestion({ project, generatedModules = [], fromCache = false, repository = null }: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;

    const [selectedModules, setSelectedModules] = useState<Module[]>([]);
    const [customModuleName, setCustomModuleName] = useState('');
    const [customModuleDescription, setCustomModuleDescription] = useState('');
    const [customModuleMetrics, setCustomModuleMetrics] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
    const [regenerateNotes, setRegenerateNotes] = useState('');

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Module Suggestions', href: `/modules/create/${project.id}` },
    ];

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'home',
            }),
        [project],
    );

    const toggleModule = (module: Module) => {
        setSelectedModules((prev) => {
            const isSelected = prev.some((m) => m.name === module.name);
            if (isSelected) {
                return prev.filter((m) => m.name !== module.name);
            } else {
                return [...prev, module];
            }
        });
    };

    const addCustomModule = () => {
        if (!customModuleName.trim() || !customModuleDescription.trim()) {
            toast.error('Please provide both name and description for the custom module');
            return;
        }

        const customModule: Module = {
            name: customModuleName.trim(),
            description: customModuleDescription.trim(),
            metrics: customModuleMetrics.trim() || undefined,
        };

        setSelectedModules((prev) => [...prev, customModule]);
        setCustomModuleName('');
        setCustomModuleDescription('');
        setCustomModuleMetrics('');
        toast.success('Custom module added successfully!');
    };

    const removeModule = (moduleName: string) => {
        setSelectedModules((prev) => prev.filter((m) => m.name !== moduleName));
    };

    const openRegenerateModal = () => {
        setRegenerateNotes('');
        setIsRegenerateModalOpen(true);
    };

    const handleRegenerate = () => {
        if (!regenerateNotes.trim() || regenerateNotes.trim().length < 10) {
            toast.error('Please provide more detailed feedback (at least 10 characters)');
            return;
        }

        setIsRegenerating(true);
        setIsRegenerateModalOpen(false);

        router.post(
            `/modules/regenerate/${project.id}`,
            {
                user_notes: regenerateNotes.trim(),
                previous_modules: generatedModules.map((m) => ({
                    name: m.name,
                    description: m.description,
                })),
            } as never,
            {
                onSuccess: () => {
                    setIsRegenerating(false);
                    setSelectedModules([]);
                    setRegenerateNotes('');
                    toast.success('Modules regenerated successfully!');
                },
                onError: () => {
                    setIsRegenerating(false);
                    toast.error('Failed to regenerate modules. Please try again.');
                },
            }
        );
    };

    const handleSubmit = () => {
        if (selectedModules.length === 0) {
            toast.error('Please select at least one module');
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/modules/create/${project.id}`,
            {
                modules: selectedModules,
            } as never,
            {
                onSuccess: () => {
                    toast.success(`Successfully created ${selectedModules.length} modules!`);
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('Submission errors:', errors);
                    toast.error('Failed to submit modules. Please try again.');
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <>
            <Head title={`Module Suggestions - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        repository={repository}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user}
                    />

                    <main className="flex min-w-0 flex-1 flex-col">
                        {/* Header bar with breadcrumbs */}
                        <div className="shrink-0 border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-3">
                                <SidebarToggle isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <header className="mb-8">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Layers className="h-8 w-8 text-primary" />
                                        <h1 className="text-3xl font-bold">Module Suggestions</h1>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={openRegenerateModal}
                                        disabled={isRegenerating || generatedModules.length === 0}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                                    </Button>
                                </div>
                                <p className="text-lg text-muted-foreground">
                                    AI-generated DDD modules for <span className="font-semibold text-foreground">{project.name}</span>
                                    {fromCache && (
                                        <span className="ml-2 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                            From cache
                                        </span>
                                    )}
                                </p>
                            </header>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                {/* Modules Selection */}
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>AI-Generated Modules</CardTitle>
                                            <CardDescription>
                                                Select the modules that best fit your project architecture using Domain-Driven Design
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {generatedModules.length === 0 && (
                                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                                                    <p className="text-sm text-yellow-800">
                                                        No AI-generated modules available. Please try again or contact support.
                                                    </p>
                                                </div>
                                            )}
                                        {generatedModules.map((module, index) => {
                                            const isSelected = selectedModules.some((m) => m.name === module.name);

                                            return (
                                                <div
                                                    key={index}
                                                    className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/5 shadow-md'
                                                            : 'border-border hover:border-primary/50 hover:shadow-sm'
                                                    }`}
                                                    onClick={() => toggleModule(module)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox checked={isSelected} onChange={() => toggleModule(module)} className="mt-1" />
                                                        <div className="flex-1">
                                                            <h3 className="mb-1 font-semibold text-foreground">{module.name}</h3>
                                                            <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                                                            {module.metrics && (
                                                                <div className="mt-2 rounded bg-muted/50 p-2">
                                                                    <p className="text-xs font-medium text-muted-foreground">Business KPIs:</p>
                                                                    <p className="text-xs text-muted-foreground">{module.metrics}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isSelected && <Check className="mt-1 h-5 w-5 text-primary" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        </CardContent>
                                    </Card>

                                    {/* Custom Module */}
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Plus className="h-5 w-5" />
                                                Add Custom Module
                                            </CardTitle>
                                            <CardDescription>Don't see what you need? Add your own custom module</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Module Name</label>
                                                <input
                                                    type="text"
                                                    value={customModuleName}
                                                    onChange={(e) => setCustomModuleName(e.target.value)}
                                                    placeholder="e.g., Payment Processing"
                                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Strategic Definition</label>
                                                <textarea
                                                    value={customModuleDescription}
                                                    onChange={(e) => setCustomModuleDescription(e.target.value)}
                                                    placeholder="Describe the module's purpose and strategic value..."
                                                    rows={3}
                                                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Business KPIs (Optional)</label>
                                            <textarea
                                                value={customModuleMetrics}
                                                onChange={(e) => setCustomModuleMetrics(e.target.value)}
                                                placeholder="Define measurable success metrics..."
                                                rows={2}
                                                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                                            />
                                        </div>
                                        <Button
                                            onClick={addCustomModule}
                                            disabled={!customModuleName.trim() || !customModuleDescription.trim()}
                                            className="w-full"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Custom Module
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Selected Modules Summary */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-8">
                                    <CardHeader>
                                        <CardTitle>Selected Modules</CardTitle>
                                        <CardDescription>
                                            {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} selected
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedModules.length === 0 ? (
                                            <p className="py-8 text-center text-muted-foreground">No modules selected yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedModules.map((module, index) => (
                                                    <div key={index} className="rounded-lg border border-border bg-muted/50 p-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="mb-1 text-sm font-medium text-foreground">{module.name}</h4>
                                                                <p className="line-clamp-2 text-xs text-muted-foreground">{module.description}</p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeModule(module.name)}
                                                                className="ml-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-6 border-t border-border pt-4">
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={selectedModules.length === 0 || isSubmitting}
                                                className="w-full"
                                                size="lg"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                                        <TextShimmer className="text-white">Creating Modules...</TextShimmer>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Create Modules ({selectedModules.length})
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {isSubmitting && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-8 shadow-lg">
                                <div className="relative">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-6 w-6 animate-pulse rounded-full bg-primary/20"></div>
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <TextShimmer className="text-lg font-semibold">Creating Modules</TextShimmer>
                                    <p className="text-sm text-muted-foreground">
                                        Processing {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''}...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Regenerating Overlay */}
                    {isRegenerating && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-8 shadow-lg">
                                <div className="relative">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <TextShimmer className="text-lg font-semibold">Regenerating Modules</TextShimmer>
                                    <p className="text-sm text-muted-foreground">
                                        AI is analyzing your feedback...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            </div>

            {/* Regenerate Modal */}
            <Dialog open={isRegenerateModalOpen} onOpenChange={setIsRegenerateModalOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            Regenerate Modules
                        </DialogTitle>
                        <DialogDescription>
                            Provide feedback to help the AI generate better module suggestions. Be specific about what you want to add, remove, merge, or change.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Feedback</label>
                            <textarea
                                value={regenerateNotes}
                                onChange={(e) => setRegenerateNotes(e.target.value)}
                                placeholder="Examples:
- Add a 'Reporting & Analytics' module
- Merge 'User Management' and 'Authentication' into one module
- Split 'Order Management' into 'Orders' and 'Shipping'
- Remove the 'Notifications' module, it's not needed
- Rename 'Content' to 'CMS'"
                                rows={6}
                                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 10 characters. Be specific about your requirements.
                            </p>
                        </div>
                        <div className="rounded-lg border border-muted bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Current modules ({generatedModules.length}):</p>
                            <div className="flex flex-wrap gap-1">
                                {generatedModules.map((module, index) => (
                                    <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        {module.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRegenerateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegenerate}
                            disabled={!regenerateNotes.trim() || regenerateNotes.trim().length < 10}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
