import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, ChevronLeft, Plus, Sparkles, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type User, type SharedData } from '@/types';

interface Project {
    id: number;
    name: string;
    brief: string;
    overview: string;
    non_functional_requirements: string;
    technical_details: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface Feature {
    name: string;
    description: string;
}

interface Props {
    project: Project;
    generatedFeatures?: Feature[];
}

export default function FeaturesSuggestion({ project, generatedFeatures = [] }: Props) {
    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    const sidebarAuth: { user: User } = { user: (auth.user as unknown) as User };
    const projects = (shared.projects as { id: number; name: string; status?: string }[] | undefined) || [];

    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
    const [customFeatureName, setCustomFeatureName] = useState('');
    const [customFeatureDescription, setCustomFeatureDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleFeature = (feature: Feature) => {
        setSelectedFeatures((prev) => {
            const isSelected = prev.some((f) => f.name === feature.name);
            if (isSelected) {
                return prev.filter((f) => f.name !== feature.name);
            } else {
                return [...prev, feature];
            }
        });
    };

    const addCustomFeature = () => {
        if (!customFeatureName.trim() || !customFeatureDescription.trim()) {
            toast.error('Please provide both name and description for the custom feature');
            return;
        }

        const customFeature: Feature = {
            name: customFeatureName.trim(),
            description: customFeatureDescription.trim(),
        };

        setSelectedFeatures((prev) => [...prev, customFeature]);
        setCustomFeatureName('');
        setCustomFeatureDescription('');
        toast.success('Custom feature added successfully!');
    };

    const removeCustomFeature = (featureName: string) => {
        setSelectedFeatures((prev) => prev.filter((f) => f.name !== featureName));
    };

    const handleSubmit = () => {
        console.log('=== SUBMIT BUTTON CLICKED ===');
        console.log('Selected features count:', selectedFeatures.length);
        console.log('Selected features:', selectedFeatures);
        
        if (selectedFeatures.length === 0) {
            toast.error('Please select at least one feature');
            return;
        }

        const routeUrl = `/features/create/${project.id}`;
        console.log('Route URL:', routeUrl);
        console.log('Project ID:', project.id);
        
        setIsSubmitting(true);
        console.log('Starting submission...');

        router.post(
            routeUrl,
            {
                features: selectedFeatures,
            } as never,
            {
                onSuccess: () => {
                    console.log('✅ Success!');
                    toast.success(`Successfully created ${selectedFeatures.length} features!`);
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('❌ Submission errors:', errors);
                    toast.error('Failed to submit features. Please try again.');
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    console.log('🏁 Request finished');
                    setIsSubmitting(false);
                },
            }
        );
    };

    const goBack = () => {
        router.visit(`/projects/${project.id}`);
    };

    return (
        <>
            <Head title={`Feature Suggestions - ${project.name}`} />

            <div className="flex">
                <ProjectsIndexSidebar
                    auth={sidebarAuth}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    onCreateProject={() => router.get('/projects')}
                    projectCount={projects.length}
                    projects={projects}
                    currentProjectId={project.id}
                />

                <main className="min-w-0 flex-1">
                    <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                        {/* Header */}
                        <div className="mb-6 flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="hidden h-8 w-8 p-0 lg:flex"
                                title={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
                            >
                                {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" onClick={goBack} className="text-muted-foreground hover:text-foreground">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Project
                            </Button>
                        </div>

                        <header className="mb-8">
                            <div className="mb-2 flex items-center gap-3">
                                <Sparkles className="h-8 w-8 text-primary" />
                                <h1 className="text-3xl font-bold">Feature Suggestions</h1>
                            </div>
                            <p className="text-lg text-muted-foreground">
                                AI-generated feature suggestions for <span className="font-semibold text-foreground">{project.name}</span>
                            </p>
                        </header>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Features Selection */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>AI-Generated Features</CardTitle>
                                    <CardDescription>Select the features that best fit your project requirements</CardDescription>
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
                                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
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
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Feature Name</label>
                                        <input
                                            type="text"
                                            value={customFeatureName}
                                            onChange={(e) => setCustomFeatureName(e.target.value)}
                                            placeholder="e.g., Advanced Reporting"
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Description</label>
                                        <textarea
                                            value={customFeatureDescription}
                                            onChange={(e) => setCustomFeatureDescription(e.target.value)}
                                            placeholder="Describe what this feature does and how it benefits users..."
                                            rows={3}
                                            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
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
                                                            onClick={() => removeCustomFeature(feature.name)}
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
                                                    Submit Features ({selectedFeatures.length})
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
                </main>
            </div>
        </>
    );
}