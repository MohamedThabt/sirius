import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import { buildProjectNavGroups } from '@/components/Projects/projectNav';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckboxGrid } from '@/components/ui/checkbox-grid';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import { type User, type Project, type Sections } from '@/types';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, router, usePage } from '@inertiajs/react';
import {
    BrainIcon,
    CodeIcon,
    DatabaseIcon,
    LightbulbIcon,
    MonitorSmartphoneIcon,
    PlugIcon,
    SaveIcon,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

// TechnicalIntake specific to this page
interface TechnicalIntake {
    id: number;
    project_id: number;
    platform_targets: string | null;
    frontend_tech: string | null;
    backend_tech: string | null;
    database_tech: string | null;
    ai_usage: string | null;
    external_services: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    project: Project;
    technicalIntake: TechnicalIntake | null;
    sections?: Sections;
}

// Options for checkbox grids (same as in Prepare.tsx)
const platformOptions = [
    { value: 'web', label: 'Web (Responsive)' },
    { value: 'mobile_ios', label: 'Mobile - iOS' },
    { value: 'mobile_android', label: 'Mobile - Android' },
    { value: 'desktop_windows', label: 'Desktop - Windows' },
    { value: 'desktop_macos', label: 'Desktop - macOS' },
    { value: 'pwa', label: 'Progressive Web App (PWA)' },
];

const frontendFrameworkOptions = [
    { value: 'react_nextjs', label: 'React (Next.js)' },
    { value: 'vue_nuxt', label: 'Vue (Nuxt)' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'SvelteKit' },
    { value: 'blade_inertia', label: 'Laravel Blade + Inertia' },
];

const backendOptions = [
    { value: 'laravel', label: 'PHP (Laravel 11)' },
    { value: 'nodejs', label: 'Node.js (Nest/Express)' },
    { value: 'python_fastapi', label: 'Python (FastAPI)' },
    { value: 'python_django', label: 'Python (Django)' },
    { value: 'java_spring', label: 'Java (Spring Boot)' },
    { value: 'dotnet', label: '.NET' },
    { value: 'go', label: 'Go' },
];

const databaseOptions = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL / MariaDB' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'redis', label: 'Redis' },
    { value: 'elasticsearch', label: 'Elasticsearch' },
    { value: 'dynamodb', label: 'AWS DynamoDB' },
    { value: 'firestore', label: 'Google Firestore' },
    { value: 'supabase', label: 'Supabase (PostgreSQL)' },
];

const aiUseCaseOptions = [
    { value: 'chat', label: 'Chat/Assistant' },
    { value: 'summarize', label: 'Summarization' },
    { value: 'extract', label: 'Data Extraction' },
    { value: 'classify', label: 'Classification' },
    { value: 'recommend', label: 'Recommendations' },
    { value: 'vision', label: 'Image/Vision' },
    { value: 'speech', label: 'Speech/Audio' },
];

const externalServiceOptions = [
    { value: 'payments_stripe', label: 'Payments - Stripe' },
    { value: 'payments_braintree', label: 'Payments - Braintree' },
    { value: 'email_sendgrid', label: 'Email - SendGrid' },
    { value: 'email_mailgun', label: 'Email - Mailgun' },
    { value: 'sms_twilio', label: 'SMS - Twilio' },
    { value: 'analytics_ga4', label: 'Analytics - GA4' },
    { value: 'analytics_posthog', label: 'Analytics - PostHog' },
    { value: 'identity_okta', label: 'SSO - Okta' },
    { value: 'identity_azure', label: 'SSO - Azure AD' },
    { value: 'maps_google', label: 'Maps - Google Maps' },
    { value: 'maps_mapbox', label: 'Maps - Mapbox' },
];

// Helper to parse stored labels back to option values
const labelsToValues = (labels: string | null, options: { value: string; label: string }[]): string[] => {
    if (!labels) return [];
    const labelArray = labels.split(', ').map(l => l.trim());
    return options.filter(o => labelArray.includes(o.label)).map(o => o.value);
};

// Helper to convert values to labels
const valuesToLabels = (values: string[], options: { value: string; label: string }[]): string => {
    return values.map(v => options.find(o => o.value === v)?.label).filter(Boolean).join(', ');
};

export default function Technology({ project, technicalIntake, sections }: Props) {
    useFlashToasts();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isEditing, setIsEditing] = useState(!technicalIntake);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedFrontend, setSelectedFrontend] = useState<string[]>([]);
    const [selectedBackend, setSelectedBackend] = useState<string[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState<string[]>([]);
    const [selectedAiUseCases, setSelectedAiUseCases] = useState<string[]>([]);
    const [selectedExternalServices, setSelectedExternalServices] = useState<string[]>([]);

    const [platformAdditional, setPlatformAdditional] = useState('');
    const [frontendAdditional, setFrontendAdditional] = useState('');
    const [backendAdditional, setBackendAdditional] = useState('');
    const [databaseAdditional, setDatabaseAdditional] = useState('');
    const [aiAdditional, setAiAdditional] = useState('');
    const [servicesAdditional, setServicesAdditional] = useState('');

    // Initialize form with existing data
    useEffect(() => {
        if (technicalIntake) {
            setSelectedPlatforms(labelsToValues(technicalIntake.platform_targets, platformOptions));
            setSelectedFrontend(labelsToValues(technicalIntake.frontend_tech, frontendFrameworkOptions));
            setSelectedBackend(labelsToValues(technicalIntake.backend_tech, backendOptions));
            setSelectedDatabase(labelsToValues(technicalIntake.database_tech, databaseOptions));
            setSelectedAiUseCases(labelsToValues(technicalIntake.ai_usage, aiUseCaseOptions));
            setSelectedExternalServices(labelsToValues(technicalIntake.external_services, externalServiceOptions));
        }
    }, [technicalIntake]);

    const breadcrumbs = [
        { title: project.name, href: `/projects/${project.id}` },
        { title: 'Technology Stack', href: `/projects/${project.id}/technology` },
    ];

    const completionPercentage = useMemo(() => {
        return project.progress ?? 0;
    }, [project.progress]);

    const navGroups = useMemo(
        () =>
            buildProjectNavGroups({
                project,
                currentPage: 'technology',
            }),
        [project],
    );

    const handleSubmit = () => {
        setIsSaving(true);
        
        const formData = {
            platform_targets: valuesToLabels(selectedPlatforms, platformOptions) || platformAdditional || null,
            frontend_tech: valuesToLabels(selectedFrontend, frontendFrameworkOptions) || frontendAdditional || null,
            backend_tech: valuesToLabels(selectedBackend, backendOptions) || backendAdditional || null,
            database_tech: valuesToLabels(selectedDatabase, databaseOptions) || databaseAdditional || null,
            ai_usage: valuesToLabels(selectedAiUseCases, aiUseCaseOptions) || aiAdditional || null,
            external_services: valuesToLabels(selectedExternalServices, externalServiceOptions) || servicesAdditional || null,
        };

        router.post(`/projects/${project.id}/technology`, formData, {
            onFinish: () => {
                setIsSaving(false);
                setIsEditing(false);
            },
        });
    };

    const TechCard = ({
        title,
        description,
        icon: Icon,
        iconColorClass,
        content,
    }: {
        title: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
        iconColorClass?: string;
        content: string | null;
    }) => (
        <div className="rounded border">
            <div className="border-b p-4">
                <div className="flex items-start gap-3">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColorClass || 'text-muted-foreground'}`} />
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-4">
                {content ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{content}</p>
                ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                )}
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="space-y-8">
            {/* Platform Targets */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <MonitorSmartphoneIcon className="h-5 w-5 text-violet-500" />
                        <div>
                            <CardTitle className="text-base">Platform Targets</CardTitle>
                            <CardDescription>Select target platforms for your application</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CheckboxGrid
                        options={platformOptions}
                        selected={selectedPlatforms}
                        onToggle={(value, checked) => {
                            setSelectedPlatforms(prev => 
                                checked ? [...prev, value] : prev.filter(v => v !== value)
                            );
                        }}
                    />
                    <div className="mt-4">
                        <Label htmlFor="platform_additional" className="text-sm">Additional Details (Optional)</Label>
                        <Textarea
                            id="platform_additional"
                            value={platformAdditional}
                            onChange={(e) => setPlatformAdditional(e.target.value)}
                            placeholder="Offline support, minimum OS versions, specific browser requirements..."
                            className="mt-2"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Frontend Stack */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <CodeIcon className="h-5 w-5 text-blue-500" />
                        <div>
                            <CardTitle className="text-base">Frontend Stack</CardTitle>
                            <CardDescription>Choose your frontend framework and tools</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CheckboxGrid
                        options={frontendFrameworkOptions}
                        selected={selectedFrontend}
                        onToggle={(value, checked) => {
                            setSelectedFrontend(prev => 
                                checked ? [...prev, value] : prev.filter(v => v !== value)
                            );
                        }}
                    />
                    <div className="mt-4">
                        <Label htmlFor="frontend_additional" className="text-sm">UI Libraries & State Management (Optional)</Label>
                        <Textarea
                            id="frontend_additional"
                            value={frontendAdditional}
                            onChange={(e) => setFrontendAdditional(e.target.value)}
                            placeholder="Tailwind, shadcn/ui, TanStack Query, Redux..."
                            className="mt-2"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Backend & API */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <CodeIcon className="h-5 w-5 text-cyan-500" />
                        <div>
                            <CardTitle className="text-base">Backend & API</CardTitle>
                            <CardDescription>Select your backend runtime and API style</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CheckboxGrid
                        options={backendOptions}
                        selected={selectedBackend}
                        onToggle={(value, checked) => {
                            setSelectedBackend(prev => 
                                checked ? [...prev, value] : prev.filter(v => v !== value)
                            );
                        }}
                    />
                    <div className="mt-4">
                        <Label htmlFor="backend_additional" className="text-sm">API Style, Auth & Queue Details (Optional)</Label>
                        <Textarea
                            id="backend_additional"
                            value={backendAdditional}
                            onChange={(e) => setBackendAdditional(e.target.value)}
                            placeholder="REST + JSON, GraphQL, OAuth2, JWT, Redis queues..."
                            className="mt-2"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Database */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <DatabaseIcon className="h-5 w-5 text-orange-500" />
                        <div>
                            <CardTitle className="text-base">Database Technology</CardTitle>
                            <CardDescription>Choose your database systems</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CheckboxGrid
                        options={databaseOptions}
                        selected={selectedDatabase}
                        onToggle={(value, checked) => {
                            setSelectedDatabase(prev => 
                                checked ? [...prev, value] : prev.filter(v => v !== value)
                            );
                        }}
                    />
                    <div className="mt-4">
                        <Label htmlFor="database_additional" className="text-sm">Sharding, Replication, Caching Details (Optional)</Label>
                        <Textarea
                            id="database_additional"
                            value={databaseAdditional}
                            onChange={(e) => setDatabaseAdditional(e.target.value)}
                            placeholder="Sharding strategy, replication, cache layer..."
                            className="mt-2"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* AI Usage */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <LightbulbIcon className="h-5 w-5 text-amber-500" />
                        <div>
                            <CardTitle className="text-base">AI Usage</CardTitle>
                            <CardDescription>Select AI/ML features needed</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CheckboxGrid
                        options={aiUseCaseOptions}
                        selected={selectedAiUseCases}
                        onToggle={(value, checked) => {
                            setSelectedAiUseCases(prev => 
                                checked ? [...prev, value] : prev.filter(v => v !== value)
                            );
                        }}
                    />
                    <div className="mt-4">
                        <Label htmlFor="ai_additional" className="text-sm">AI Provider & Safety Details (Optional)</Label>
                        <Textarea
                            id="ai_additional"
                            value={aiAdditional}
                            onChange={(e) => setAiAdditional(e.target.value)}
                            placeholder="OpenAI, Azure, RAG, content moderation..."
                            className="mt-2"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* External Services */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <PlugIcon className="h-5 w-5 text-green-500" />
                        <div>
                            <CardTitle className="text-base">External Services</CardTitle>
                            <CardDescription>Third-party integrations and services</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CheckboxGrid
                        options={externalServiceOptions}
                        selected={selectedExternalServices}
                        onToggle={(value, checked) => {
                            setSelectedExternalServices(prev => 
                                checked ? [...prev, value] : prev.filter(v => v !== value)
                            );
                        }}
                    />
                    <div className="mt-4">
                        <Label htmlFor="services_additional" className="text-sm">Other Services (Optional)</Label>
                        <Textarea
                            id="services_additional"
                            value={servicesAdditional}
                            onChange={(e) => setServicesAdditional(e.target.value)}
                            placeholder="Push notifications, monitoring, CRM..."
                            className="mt-2"
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                {technicalIntake && (
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                    </Button>
                )}
                <Button onClick={handleSubmit} disabled={isSaving}>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Technical Details'}
                </Button>
            </div>
        </div>
    );

    const renderViewMode = () => (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Technical Details
                </Button>
            </div>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Technology Stack</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                    <TechCard
                        title="Platform Targets"
                        description="Target platforms and deployment environments"
                        icon={MonitorSmartphoneIcon}
                        iconColorClass="text-violet-500"
                        content={technicalIntake!.platform_targets}
                    />

                    <TechCard
                        title="Frontend Technology"
                        description="Frontend frameworks, libraries, and tools"
                        icon={CodeIcon}
                        iconColorClass="text-blue-500"
                        content={technicalIntake!.frontend_tech}
                    />

                    <TechCard
                        title="Backend Technology"
                        description="Backend runtime, frameworks, and databases"
                        icon={CodeIcon}
                        iconColorClass="text-cyan-500"
                        content={technicalIntake!.backend_tech}
                    />

                    <TechCard
                        title="Database Technology"
                        description="Database systems and design patterns"
                        icon={DatabaseIcon}
                        iconColorClass="text-orange-500"
                        content={technicalIntake!.database_tech}
                    />

                    <TechCard
                        title="AI Usage"
                        description="AI/ML models and use cases"
                        icon={LightbulbIcon}
                        iconColorClass="text-amber-500"
                        content={technicalIntake!.ai_usage}
                    />
                </div>

                <TechCard
                    title="External Services"
                    description="Third-party integrations and services"
                    icon={PlugIcon}
                    iconColorClass="text-green-500"
                    content={technicalIntake!.external_services}
                />
            </div>

            {technicalIntake!.updated_at && (
                <div className="rounded border p-4">
                    <p className="text-xs text-muted-foreground">
                        Last updated:{' '}
                        {new Date(technicalIntake!.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Head title={`Technology Stack - ${project.name}`} />

            <div className="min-h-screen bg-background">
                <div className="flex">
                    <ProjectSidebarPanel
                        project={project}
                        navGroups={navGroups}
                        completionPercentage={completionPercentage}
                        isCollapsed={isSidebarCollapsed}
                        user={auth.user}
                    />

                    <main className="min-w-0 flex-1">
                        <div className="py-8 pr-4 pb-32 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-6">
                            <div className="mb-6 flex items-center gap-3">
                                <SidebarToggle
                                    isCollapsed={isSidebarCollapsed}
                                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                />
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            <PageHeader
                                title="Technology Stack"
                                description={`Technical specifications and technology stack for ${project.name}`}
                            />

                            <section className="space-y-10">
                                {isEditing ? renderForm() : (technicalIntake ? renderViewMode() : renderForm())}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
