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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { type Project, type Repository, type User } from '@/types';
import { type FeatureSuggestion, type ModuleItem } from '@/types/modules';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    project: Project;
    module: ModuleItem;
    generatedFeatures?: FeatureSuggestion[];
    fromCache?: boolean;
    repository?: Repository | null;
}

export default function FeaturesSuggestion({ project, module, generatedFeatures = [], fromCache = false, repository = null }: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;

    const [selectedFeatures, setSelectedFeatures] = useState<FeatureSuggestion[]>([]);
    const [customFeatureName, setCustomFeatureName] = useState('');
    const [customFeatureDescription, setCustomFeatureDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
    const [regenerateNotes, setRegenerateNotes] = useState('');

    const breadcrumbs = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
        { title: module.name, href: `/projects/${project.id}/modules/${module.id}` },
        { title: 'Feature Suggestions', href: `/projects/${project.id}/modules/${module.id}/features/generate` },
    ];

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'home',
            }),
        [project],
    );

    const toggleFeature = useCallback((feature: FeatureSuggestion) => {
        setSelectedFeatures((prev) => {
            const isSelected = prev.some((f) => f.name === feature.name);
            if (isSelected) {
                return prev.filter((f) => f.name !== feature.name);
            } else {
                return [...prev, feature];
            }
        });
    }, []);

    const addCustomFeature = useCallback(() => {
        if (!customFeatureName.trim() || !customFeatureDescription.trim()) {
            toast.error('Please provide both name and description for the custom feature');
            return;
        }

        const customFeature: FeatureSuggestion = {
            name: customFeatureName.trim(),
            description: customFeatureDescription.trim(),
        };

        setSelectedFeatures((prev) => [...prev, customFeature]);
        setCustomFeatureName('');
        setCustomFeatureDescription('');
        toast.success('Custom feature added successfully!');
    }, [customFeatureName, customFeatureDescription]);

    const removeFeature = useCallback((featureName: string) => {
        setSelectedFeatures((prev) => prev.filter((f) => f.name !== featureName));
    }, []);

    const openRegenerateModal = useCallback(() => {
        setRegenerateNotes('');
        setIsRegenerateModalOpen(true);
    }, []);

    const handleRegenerate = () => {
        if (!regenerateNotes.trim() || regenerateNotes.trim().length < 10) {
            toast.error('Please provide more detailed feedback (at least 10 characters)');
            return;
        }

        setIsRegenerating(true);
        setIsRegenerateModalOpen(false);

        router.post(
            `/projects/${project.id}/modules/${module.id}/features/regenerate`,
            {
                user_notes: regenerateNotes.trim(),
                previous_features: generatedFeatures.map((f) => ({
                    name: f.name,
                    description: f.description,
                })),
            } as never,
            {
                onSuccess: () => {
                    setIsRegenerating(false);
                    setSelectedFeatures([]);
                    setRegenerateNotes('');
                },
                onError: () => {
                    setIsRegenerating(false);
                },
            }
        );
    };

    const handleSubmit = () => {
        if (selectedFeatures.length === 0) {
            toast.error('Please select at least one feature');
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/projects/${project.id}/modules/${module.id}/features/create`,
            {
                features: selectedFeatures,
            } as never,
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('Submission errors:', errors);
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
            <Head title={`Feature Suggestions - ${module.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        completionPercentage={project.progress}
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
                                        <Sparkles className="h-8 w-8 text-primary" />
                                        <h1 className="text-3xl font-bold">Feature Suggestions</h1>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={openRegenerateModal}
                                        disabled={isRegenerating || generatedFeatures.length === 0}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                                    </Button>
                                </div>
                                <p className="text-lg text-muted-foreground">
                                    AI-generated features for module <span className="font-semibold text-foreground">{module.name}</span>
                                    {fromCache && (
                                        <span className="ml-2 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                            From cache
                                        </span>
                                    )}
                                </p>
                            </header>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                {/* Features Selection */}
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>AI-Generated Features</CardTitle>
                                            <CardDescription>
                                                Select the features that best fit your module requirements
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {generatedFeatures.length === 0 && (
                                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                                                    <p className="text-sm text-yellow-800">
                                                        No AI-generated features available. Please try again or contact support.
                                                    </p>
                                                </div>
                                            )}
                                            {generatedFeatures.map((feature, index) => {
                                                const isSelected = selectedFeatures.some((f) => f.name === feature.name);

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/5 shadow-md'
                                                                : 'border-border hover:border-primary/50 hover:shadow-sm'
                                                        }`}
                                                        onClick={() => toggleFeature(feature)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <Checkbox checked={isSelected} onChange={() => toggleFeature(feature)} className="mt-1" />
                                                            <div className="flex-1">
                                                                <h3 className="mb-1 font-semibold text-foreground">{feature.name}</h3>
                                                                <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                                                                {feature.summary && (
                                                                    <div className="mt-2 rounded bg-muted/50 p-2">
                                                                        <p className="text-xs font-medium text-muted-foreground">Summary:</p>
                                                                        <p className="text-xs text-muted-foreground">{feature.summary}</p>
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

                                    {/* Custom Feature */}
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Plus className="h-5 w-5" />
                                                Add Custom Feature
                                            </CardTitle>
                                            <CardDescription>Don't see what you need? Add your own custom feature</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="feature-name">Feature Name</Label>
                                                <Input
                                                    id="feature-name"
                                                    type="text"
                                                    value={customFeatureName}
                                                    onChange={(e) => setCustomFeatureName(e.target.value)}
                                                    placeholder="e.g., Advanced Reporting"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="feature-description">Description</Label>
                                                <Textarea
                                                    id="feature-description"
                                                    value={customFeatureDescription}
                                                    onChange={(e) => setCustomFeatureDescription(e.target.value)}
                                                    placeholder="Describe what this feature does and how it benefits users..."
                                                    rows={3}
                                                />
                                            </div>
                                            <Button
                                                onClick={addCustomFeature}
                                                disabled={!customFeatureName.trim() || !customFeatureDescription.trim()}
                                                className="w-full"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Custom Feature
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Selected Features Summary */}
                                <div className="lg:col-span-1">
                                    <Card className="sticky top-8">
                                        <CardHeader>
                                            <CardTitle>Selected Features</CardTitle>
                                            <CardDescription>
                                                {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedFeatures.length === 0 ? (
                                                <p className="py-8 text-center text-muted-foreground">No features selected yet</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {selectedFeatures.map((feature, index) => (
                                                        <div key={index} className="rounded-lg border border-border bg-muted/50 p-3">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="mb-1 text-sm font-medium text-foreground">{feature.name}</h4>
                                                                    <p className="line-clamp-2 text-xs text-muted-foreground">{feature.description}</p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeFeature(feature.name)}
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
                                                    disabled={selectedFeatures.length === 0 || isSubmitting}
                                                    className="w-full"
                                                    size="lg"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                                            <TextShimmer className="text-white">Creating Features...</TextShimmer>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Create Features ({selectedFeatures.length})
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
                                        <TextShimmer className="text-lg font-semibold">Creating Features</TextShimmer>
                                        <p className="text-sm text-muted-foreground">
                                            Processing {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''}...
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
                                        <TextShimmer className="text-lg font-semibold">Regenerating Features</TextShimmer>
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
                            Regenerate Features
                        </DialogTitle>
                        <DialogDescription>
                            Provide feedback to help the AI generate better feature suggestions. Be specific about what you want to add, remove, or change.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="regenerate-feedback">Your Feedback</Label>
                            <Textarea
                                id="regenerate-feedback"
                                value={regenerateNotes}
                                onChange={(e) => setRegenerateNotes(e.target.value)}
                                placeholder="Examples:
- Add a 'User Notifications' feature
- Make 'Search' more comprehensive with filters
- Split 'Dashboard' into 'Analytics' and 'Reports'
- Remove the 'Settings' feature, it's not needed
- Add more CRUD operations for this module"
                                rows={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 10 characters. Be specific about your requirements.
                            </p>
                        </div>
                        <div className="rounded-lg border border-muted bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Current features ({generatedFeatures.length}):</p>
                            <div className="flex flex-wrap gap-1">
                                {generatedFeatures.map((feature, index) => (
                                    <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        {feature.name}
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