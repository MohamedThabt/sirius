import { Button } from '@/components/ui/button';
import ProjectsIndexSidebar from '@/components/Projects/ProjectsIndexSidebar';
import SidebarToggle from '@/components/Projects/SidebarToggle';
import type { User, SharedData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckboxGrid } from '@/components/ui/checkbox-grid';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import { ReviewModal } from '@/components/Projects/Prepare/ReviewModal';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    BrainIcon,
    CheckCircleIcon,
    CheckIcon,
    CodeIcon,
    DatabaseIcon,
    FileTextIcon,
    LightbulbIcon,
    MonitorSmartphoneIcon,
    PlugIcon,
    Sparkles,
    TargetIcon,
    UsersIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ProjectFormData {
    why_making: string;
    who_for: string;
    what_valuable: string;
    features_functionality: string;
    data_model_details: string;

    platform_targets: string;
    frontend_tech: string;
    backend_tech: string;
    database_tech: string;
    ai_usage: string;
    external_services: string;

    [key: string]: string;
}

interface Props {
    projectId: number;
    projectName: string;
}

// Removed unused AppPageProps; we rely on SharedData typing.

type Step = {
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    field: keyof ProjectFormData;
    optional?: boolean;
};

const platformOptions = [
    { value: 'web', label: 'Web (Responsive)' },
    { value: 'mobile_ios', label: 'Mobile - iOS' },
    { value: 'mobile_android', label: 'Mobile - Android' },
    { value: 'desktop_windows', label: 'Desktop - Windows' },
    { value: 'desktop_macos', label: 'Desktop - macOS' },
    { value: 'pwa', label: 'Progressive Web App (PWA)' },
];

const mobileApproachOptions = [
    { value: 'native', label: 'Native (Swift/Kotlin)' },
    { value: 'react_native', label: 'React Native' },
    { value: 'flutter', label: 'Flutter' },
    { value: 'pwa', label: 'PWA' },
];

const frontendFrameworkOptions = [
    { value: 'react_nextjs', label: 'React (Next.js)' },
    { value: 'vue_nuxt', label: 'Vue (Nuxt)' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'SvelteKit' },
    { value: 'blade_inertia', label: 'Laravel Blade + Inertia' },
];

const backendOptions = [
    { value: 'laravel', label: 'PHP (Laravel)' },
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
    { value: 'cassandra', label: 'Apache Cassandra' },
    { value: 'neo4j', label: 'Neo4j (Graph)' },
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

const userScaleOptions = [
    { value: 0, label: '1-10', description: 'MVP / Personal' },
    { value: 1, label: '10-100', description: 'Small Team' },
    { value: 2, label: '100-1K', description: 'Startup' },
    { value: 3, label: '1K-10K', description: 'Growing' },
    { value: 4, label: '10K-100K', description: 'Scale-up' },
    { value: 5, label: '100K-1M', description: 'Enterprise' },
    { value: 6, label: '1M+', description: 'Mass Scale' },
];

export default function ProjectPrepare({ projectId, projectName }: Props) {
    useFlashToasts();

    const shared = usePage<SharedData>().props;
    const { auth } = shared;
    // WHY: Fixed unsafe double-cast through 'unknown'. Trust the typing or fix source.
    const sidebarAuth = { user: auth.user as User };
    const projects = (shared.projects as { id: number; name: string; status?: string }[] | undefined) || [];

    const [activeTab, setActiveTab] = useState<'business' | 'technical'>('business');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentBusinessStep, setCurrentBusinessStep] = useState(1);
    const [currentTechnicalStep, setCurrentTechnicalStep] = useState(1);
    const [showReview, setShowReview] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const saveTimeoutRef = useRef<number | null>(null);
    const savedTimeoutRef = useRef<number | null>(null);

    const [formData, setFormData] = useState<ProjectFormData>({
        why_making: '',
        who_for: '',
        what_valuable: '',
        features_functionality: '',
        data_model_details: '',

        platform_targets: '',
        frontend_tech: '',
        backend_tech: '',
        database_tech: '',
        ai_usage: '',
        external_services: '',
    });

    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedMobileApproach, setSelectedMobileApproach] = useState<string[]>([]);
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

    const [expectedUserScale, setExpectedUserScale] = useState<number>(2);

    const businessSteps: Step[] = [
        {
            id: 1,
            title: 'Project Purpose',
            description: 'Why are you making this project?',
            icon: LightbulbIcon,
            field: 'why_making',
            optional: false,
        },
        {
            id: 2,
            title: 'Target Audience',
            description: 'Who is this project for?',
            icon: UsersIcon,
            field: 'who_for',
            optional: false,
        },
        {
            id: 3,
            title: 'Value Proposition',
            description: 'What makes it valuable?',
            icon: TargetIcon,
            field: 'what_valuable',
            optional: false,
        },
        {
            id: 4,
            title: 'Features Overview',
            description: 'Brief about features & functionality',
            icon: FileTextIcon,
            field: 'features_functionality',
            optional: false,
        },
        {
            id: 5,
            title: 'Data Model (Optional)',
            description: 'Describe your core entities',
            icon: DatabaseIcon,
            field: 'data_model_details',
            optional: true,
        },
    ];

    const technicalSteps: Step[] = [
        {
            id: 1,
            title: 'Platform Targets',
            description: 'Select target platforms',
            icon: MonitorSmartphoneIcon,
            field: 'platform_targets',
            optional: true,
        },
        {
            id: 2,
            title: 'Frontend Stack',
            description: 'Choose frontend framework',
            icon: CodeIcon,
            field: 'frontend_tech',
            optional: true,
        },
        {
            id: 3,
            title: 'Backend & API',
            description: 'Select backend runtime',
            icon: CodeIcon,
            field: 'backend_tech',
            optional: true,
        },
        {
            id: 4,
            title: 'Database',
            description: 'Database technology and design',
            icon: DatabaseIcon,
            field: 'database_tech',
            optional: true,
        },
        {
            id: 5,
            title: 'AI Usage',
            description: 'AI features needed',
            icon: BrainIcon,
            field: 'ai_usage',
            optional: true,
        },
        {
            id: 6,
            title: 'External Services',
            description: 'Third-party integrations',
            icon: PlugIcon,
            field: 'external_services',
            optional: true,
        },
    ];

    const placeholders: Record<keyof ProjectFormData, string> = {
        why_making:
            'Example:\nWe need to centralize team tasks and reduce status meetings. Today, work is scattered across chat and spreadsheets, causing missed deadlines.',
        who_for:
            'Example:\nPrimary users: project managers and contributors in SMBs (5–50 people).\nSecondary users: executives viewing reports.\nAccessibility: WCAG 2.1 AA.',
        what_valuable:
            'Example:\n- Clear ownership and deadlines\n- Real-time progress and notifications\n- Less context switching (email/slack integrations)',
        features_functionality:
            'Example:\n- Kanban boards, task assignments, due dates\n- Comments, mentions, file uploads\n- Notifications (email/push), activity log\n- Basic reporting (burn-down, cycle time)',
        data_model_details:
            'Optional. Example:\n- Project(id, name, status)\n- Task(id, project_id, title, status, assignee_id, due_date)\n- User(id, name, email, role)\n\nRelationships:\n- Project 1—* Task\n- User 1—* Task (assignee)',

        platform_targets: '',
        frontend_tech: '',
        backend_tech: '',
        database_tech: '',
        ai_usage: '',
        external_services: '',
    };

    const handleInputChange = (field: keyof ProjectFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (
        field: keyof ProjectFormData,
        value: string,
        checked: boolean,
        currentSelections: string[],
        setSelections: (val: string[]) => void,
    ) => {
        const newSelections = checked ? [...currentSelections, value] : currentSelections.filter((v) => v !== value);
        setSelections(newSelections);

        const labels = newSelections
            .map((v) => {
                if (field === 'platform_targets') return platformOptions.find((o) => o.value === v)?.label;
                if (field === 'frontend_tech') return frontendFrameworkOptions.find((o) => o.value === v)?.label;
                if (field === 'backend_tech') return backendOptions.find((o) => o.value === v)?.label;
                if (field === 'database_tech') return databaseOptions.find((o) => o.value === v)?.label;
                if (field === 'ai_usage') return aiUseCaseOptions.find((o) => o.value === v)?.label;
                if (field === 'external_services') return externalServiceOptions.find((o) => o.value === v)?.label;
                return v;
            })
            .filter(Boolean)
            .join(', ');

        handleInputChange(field, labels);
    };

    const currentSteps = activeTab === 'business' ? businessSteps : technicalSteps;
    const currentStepIndex = (activeTab === 'business' ? currentBusinessStep : currentTechnicalStep) - 1;
    const currentStepData = currentSteps[currentStepIndex];
    const isFirstStep = activeTab === 'business' && currentBusinessStep === 1;
    const isLastStepOverall = activeTab === 'technical' && currentTechnicalStep === technicalSteps.length;

    // A step is considered complete if required & has text OR optional and has any content/selection
    const stepCompleted = (step: Step): boolean => {
        if (!step.field) return false;
        const val = formData[step.field];
        if (step.optional) return (val?.trim()?.length ?? 0) > 0; // optional counts complete only if filled
        return (val?.trim()?.length ?? 0) > 0;
    };
    const canProceed = currentStepData?.optional === true
        ? true
        : stepCompleted(currentStepData);

    const requiredBusinessFields: (keyof ProjectFormData)[] = ['why_making', 'who_for', 'what_valuable', 'features_functionality'];
    const canSubmit = requiredBusinessFields.every((f) => formData[f].trim().length > 0);

    const accuracyBoost = useMemo(() => {
        const technicalFields: (keyof ProjectFormData)[] = ['platform_targets', 'frontend_tech', 'backend_tech', 'ai_usage', 'external_services'];
        const answered = technicalFields.filter((f) => formData[f].trim().length > 0).length;
        const perField = 6;
        const max = 30;
        return Math.min(answered * perField, max);
    }, [formData]);

    // TTL duration: 7 days in milliseconds
    const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

    // Helper to restore state from cached data
    const restoreFromCache = useCallback((cachedData: Record<string, unknown>) => {
        const {
            formData: f,
            activeTab: a,
            currentBusinessStep: bs,
            currentTechnicalStep: ts,
            selectedPlatforms: sp,
            selectedMobileApproach: sma,
            selectedFrontend: sf,
            selectedBackend: sb,
            selectedDatabase: sd,
            selectedAiUseCases: sac,
            selectedExternalServices: ses,
            platformAdditional: pa,
            frontendAdditional: fa,
            backendAdditional: ba,
            databaseAdditional: da,
            aiAdditional: aa,
            servicesAdditional: sa,
            expectedUserScale: eus,
        } = cachedData as {
            formData?: Partial<ProjectFormData>;
            activeTab?: 'business' | 'technical';
            currentBusinessStep?: number;
            currentTechnicalStep?: number;
            selectedPlatforms?: string[];
            selectedMobileApproach?: string[];
            selectedFrontend?: string[];
            selectedBackend?: string[];
            selectedDatabase?: string[];
            selectedAiUseCases?: string[];
            selectedExternalServices?: string[];
            platformAdditional?: string;
            frontendAdditional?: string;
            backendAdditional?: string;
            databaseAdditional?: string;
            aiAdditional?: string;
            servicesAdditional?: string;
            expectedUserScale?: number;
        };
        // WHY: Fixed type error by ensuring we only spread defined values
        if (f) setFormData((prev) => ({ ...prev, ...f } as ProjectFormData));
        if (a) setActiveTab(a);
        if (bs) setCurrentBusinessStep(bs);
        if (ts) setCurrentTechnicalStep(ts);
        if (sp) setSelectedPlatforms(sp);
        if (sma) setSelectedMobileApproach(sma);
        if (sf) setSelectedFrontend(sf);
        if (sb) setSelectedBackend(sb);
        if (sd) setSelectedDatabase(sd);
        if (sac) setSelectedAiUseCases(sac);
        if (ses) setSelectedExternalServices(ses);
        if (pa) setPlatformAdditional(pa);
        if (fa) setFrontendAdditional(fa);
        if (ba) setBackendAdditional(ba);
        if (da) setDatabaseAdditional(da);
        if (aa) setAiAdditional(aa);
        if (sa) setServicesAdditional(sa);
        if (eus !== undefined) setExpectedUserScale(eus);
    }, []);

    // Restore from localStorage on mount (with TTL check)
    useEffect(() => {
        const key = `prepare:${projectId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const { timestamp } = parsed;
                
                // Check if cache has expired (7 days TTL)
                if (timestamp && Date.now() - timestamp > CACHE_TTL_MS) {
                    console.info('Cache expired for project', projectId, '- clearing stale data');
                    localStorage.removeItem(key);
                    return;
                }
                
                restoreFromCache(parsed);
            } catch (e) {
                console.warn('Failed to restore form data from localStorage:', e);
            }
        }
    }, [projectId, restoreFromCache, CACHE_TTL_MS]);

    // Debounced autosave indicator (with timestamp for TTL)
    useEffect(() => {
        const key = `prepare:${projectId}`;
        const payload = {
            formData,
            activeTab,
            currentBusinessStep,
            currentTechnicalStep,
            selectedPlatforms,
            selectedMobileApproach,
            selectedFrontend,
            selectedBackend,
            selectedDatabase,
            selectedAiUseCases,
            selectedExternalServices,
            platformAdditional,
            frontendAdditional,
            backendAdditional,
            databaseAdditional,
            aiAdditional,
            servicesAdditional,
            expectedUserScale,
            timestamp: Date.now(), // Add timestamp for TTL expiration
        };
        setSaveStatus('saving');
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
        if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(() => {
            localStorage.setItem(key, JSON.stringify(payload));
            setSaveStatus('saved');
            savedTimeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
        }, 400); // debounce save
        return () => {
            if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
            if (savedTimeoutRef.current) window.clearTimeout(savedTimeoutRef.current);
        };
    }, [projectId, formData, activeTab, currentBusinessStep, currentTechnicalStep, selectedPlatforms, selectedMobileApproach, selectedFrontend, selectedBackend, selectedDatabase, selectedAiUseCases, selectedExternalServices, platformAdditional, frontendAdditional, backendAdditional, databaseAdditional, aiAdditional, servicesAdditional, expectedUserScale]);

    // Cross-tab synchronization via storage event
    useEffect(() => {
        const key = `prepare:${projectId}`;
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    restoreFromCache(parsed);
                    console.info('Synced form data from another tab');
                } catch (err) {
                    console.warn('Failed to sync from storage event:', err);
                }
            } else if (e.key === key && e.newValue === null) {
                // Cache was cleared in another tab (e.g., after submit)
                console.info('Cache cleared in another tab');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [projectId, restoreFromCache]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            const hasData =
                Object.values(formData).some((v) => typeof v === 'string' && v.trim().length > 0) ||
                selectedPlatforms.length > 0 ||
                selectedMobileApproach.length > 0 ||
                selectedFrontend.length > 0 ||
                selectedBackend.length > 0 ||
                selectedDatabase.length > 0 ||
                selectedAiUseCases.length > 0 ||
                selectedExternalServices.length > 0;
            if (hasData) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [
        formData,
        selectedPlatforms,
        selectedMobileApproach,
        selectedFrontend,
        selectedBackend,
        selectedDatabase,
        selectedAiUseCases,
        selectedExternalServices,
    ]);

    const nextStep = useCallback(() => {
        if (activeTab === 'business') {
            if (currentBusinessStep < businessSteps.length) {
                setCurrentBusinessStep(currentBusinessStep + 1);
            } else {
                // Last step in Business, switch to Technical tab
                setActiveTab('technical');
                setCurrentTechnicalStep(1);
            }
        } else {
            if (currentTechnicalStep < technicalSteps.length) setCurrentTechnicalStep(currentTechnicalStep + 1);
            else setShowReview(true);
        }
    }, [activeTab, currentBusinessStep, currentTechnicalStep, businessSteps.length, technicalSteps.length]);

    const prevStep = useCallback(() => {
        if (activeTab === 'business') {
            if (currentBusinessStep > 1) setCurrentBusinessStep(currentBusinessStep - 1);
        } else {
            if (currentTechnicalStep > 1) {
                setCurrentTechnicalStep(currentTechnicalStep - 1);
            } else {
                // First step in Technical, go back to last Business step
                setActiveTab('business');
                setCurrentBusinessStep(businessSteps.length);
            }
        }
    }, [activeTab, currentBusinessStep, currentTechnicalStep, businessSteps.length]);

    

    const handleSubmit = useCallback(() => {
        const selectedScale = userScaleOptions[expectedUserScale];
        const cacheKey = `prepare:${projectId}`;
        
        router.post(
            `/projects/${projectId}/system-overview/create`,
            {
                why_making: formData.why_making,
                who_for: formData.who_for,
                what_valuable: formData.what_valuable,
                features_functionality: formData.features_functionality,
                data_model_details: formData.data_model_details || null,

                platform_targets: formData.platform_targets || null,
                frontend_tech: formData.frontend_tech || null,
                backend_tech: formData.backend_tech || null,
                database_tech: formData.database_tech || null,
                ai_usage: formData.ai_usage || null,
                external_services: formData.external_services || null,
                expected_users: selectedScale.label,
            },
            {
                onSuccess: () => {
                    // Clear localStorage cache on successful submission to prevent stale data
                    localStorage.removeItem(cacheKey);
                    console.info('Form submitted successfully - cache cleared for project', projectId);
                },
                onError: (errors) => {
                    console.error('System overview creation failed:', errors);
                    router.get(`/projects/${projectId}`);
                },
            },
        );
    }, [projectId, expectedUserScale, formData]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                if (showReview) {
                    if (canSubmit) handleSubmit();
                } else if (isLastStepOverall) {
                    setShowReview(true);
                } else if (canProceed) {
                    nextStep();
                }
            } else if (e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                prevStep();
            } else if (e.altKey && (e.key.toLowerCase() === 's')) {
                e.preventDefault();
                if (isLastStepOverall) setShowReview(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [canProceed, canSubmit, isLastStepOverall, showReview, nextStep, prevStep, handleSubmit]);

    const overallStepsCount = businessSteps.length + technicalSteps.length;
    const completedCount = [...businessSteps, ...technicalSteps].filter(stepCompleted).length;
    const overallProgress = Math.round((completedCount / overallStepsCount) * 100);

    const renderTechnicalStepContent = () => {
        const field = currentStepData.field;

        if (field === 'platform_targets') {
            return (
                <div className="space-y-6">
                <div className="space-y-4">
                        <Label className="text-base font-semibold">Select Platform Targets</Label>
                        <CheckboxGrid
                            options={platformOptions}
                            selected={selectedPlatforms}
                            onToggle={(value, checked) =>
                                handleCheckboxChange(field, value, checked, selectedPlatforms, setSelectedPlatforms)
                            }
                        />
                    </div>

                    {(selectedPlatforms.includes('mobile_ios') || selectedPlatforms.includes('mobile_android')) && (
                        <div className="space-y-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                            <Label className="text-base font-semibold">Mobile Development Approach</Label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {mobileApproachOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        className="flex items-center space-x-3 rounded-lg border bg-background p-3 transition-colors hover:bg-accent"
                                    >
                                        <Checkbox
                                            id={`mobile_${option.value}`}
                                            checked={selectedMobileApproach.includes(option.value)}
                                            onCheckedChange={(checked) => {
                                                const newSelections = (checked as boolean)
                                                    ? [...selectedMobileApproach, option.value]
                                                    : selectedMobileApproach.filter((v) => v !== option.value);
                                                setSelectedMobileApproach(newSelections);
                                            }}
                                        />
                                        <label htmlFor={`mobile_${option.value}`} className="flex-1 cursor-pointer text-sm">
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="platform_additional" className="text-sm">
                            Additional Platform Details (Optional)
                        </Label>
                        <Textarea
                            id="platform_additional"
                            value={platformAdditional}
                            onChange={(e) => setPlatformAdditional(e.target.value)}
                            placeholder="Example: Offline support needed, minimum OS versions (iOS 15+, Android 10+), specific browser requirements..."
                            className="min-h-[100px]"
                            rows={4}
                            maxLength={2000}
                            aria-describedby="platform_additional-hint platform_additional-counter"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span id="platform_additional-hint">Provide any platform-specific requirements.</span>
                            <span id="platform_additional-counter" aria-live="polite">
                                {platformAdditional.length}/2000
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (field === 'frontend_tech') {
            return (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Select Frontend Framework</Label>
                        <CheckboxGrid
                            options={frontendFrameworkOptions}
                            selected={selectedFrontend}
                            onToggle={(value, checked) =>
                                handleCheckboxChange(field, value, checked, selectedFrontend, setSelectedFrontend)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frontend_additional" className="text-sm">
                            UI Library & State Management (Optional)
                        </Label>
                        <Textarea
                            id="frontend_additional"
                            value={frontendAdditional}
                            onChange={(e) => setFrontendAdditional(e.target.value)}
                            placeholder="Example:\nUI: Tailwind, shadcn/ui, Material UI\nState: TanStack Query, Redux, Context API\ni18n: English, French, Spanish\nAccessibility: WCAG 2.1 AA"
                            className="min-h-[100px]"
                            rows={4}
                            maxLength={2000}
                            aria-describedby="frontend_additional-hint frontend_additional-counter"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span id="frontend_additional-hint">Provide any frontend-specific details.</span>
                            <span id="frontend_additional-counter" aria-live="polite">
                                {frontendAdditional.length}/2000
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (field === 'backend_tech') {
            return (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Select Backend Runtime</Label>
                        <CheckboxGrid
                            options={backendOptions}
                            selected={selectedBackend}
                            onToggle={(value, checked) =>
                                handleCheckboxChange(field, value, checked, selectedBackend, setSelectedBackend)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="backend_additional" className="text-sm">
                            Database, API & Auth Details (Optional)
                        </Label>
                        <Textarea
                            id="backend_additional"
                            value={backendAdditional}
                            onChange={(e) => setBackendAdditional(e.target.value)}
                            placeholder="Example:\nDatabase: PostgreSQL with Eloquent ORM\nAPI Style: REST + JSON, GraphQL for analytics\nAuth: OAuth2 (Auth0), JWT tokens\nJobs/Queues: Redis + Laravel Horizon\nCache: Redis"
                            className="min-h-[120px]"
                            rows={5}
                            maxLength={2000}
                            aria-describedby="backend_additional-hint backend_additional-counter"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span id="backend_additional-hint">Provide any backend-specific details.</span>
                            <span id="backend_additional-counter" aria-live="polite">
                                {backendAdditional.length}/2000
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (field === 'database_tech') {
            return (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Select Database Technology</Label>
                        <CheckboxGrid
                            options={databaseOptions}
                            selected={selectedDatabase}
                            onToggle={(value, checked) =>
                                handleCheckboxChange(field, value, checked, selectedDatabase, setSelectedDatabase)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="database_additional" className="text-sm">
                            Additional Database Details (Optional)
                        </Label>
                        <textarea
                            id="database_additional"
                            value={databaseAdditional}
                            onChange={(e) => setDatabaseAdditional(e.target.value)}
                            placeholder="Example:\nSharding strategy: Hash-based\nReplication: Multi-master\nCache: Redis with TTL\nBackup: Daily snapshots\nIndexing strategy for common queries"
                            className="min-h-[100px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                            rows={4}
                            maxLength={2000}
                            aria-describedby="database_additional-hint database_additional-counter"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span id="database_additional-hint">Provide any database-specific details.</span>
                            <span id="database_additional-counter" aria-live="polite">
                                {databaseAdditional.length}/2000
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        if (field === 'ai_usage') {
            return (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Select AI Use Cases</Label>
                        <CheckboxGrid
                            options={aiUseCaseOptions}
                            selected={selectedAiUseCases}
                            onToggle={(value, checked) =>
                                handleCheckboxChange(field, value, checked, selectedAiUseCases, setSelectedAiUseCases)
                            }
                        />
                    </div>

                    {selectedAiUseCases.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="ai_additional" className="text-sm">
                                AI Provider & Safety Details (Optional)
                            </Label>
                            <textarea
                                id="ai_additional"
                                value={aiAdditional}
                                onChange={(e) => setAiAdditional(e.target.value)}
                                placeholder="Example:\nProvider: Azure OpenAI (GPT-4o)\nRAG: Yes, using pgvector for embeddings\nSafety: Content moderation, PII redaction, guardrails\nData retention: 30 days, training opt-out enabled"
                                className="min-h-[100px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                rows={4}
                                maxLength={2000}
                                aria-describedby="ai_additional-hint ai_additional-counter"
                            />
                            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                <span id="ai_additional-hint">Provide any AI-specific details.</span>
                                <span id="ai_additional-counter" aria-live="polite">
                                    {aiAdditional.length}/2000
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (field === 'external_services') {
            return (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Select External Services</Label>
                        <CheckboxGrid
                            options={externalServiceOptions}
                            selected={selectedExternalServices}
                            onToggle={(value, checked) =>
                                handleCheckboxChange(field, value, checked, selectedExternalServices, setSelectedExternalServices)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="services_additional" className="text-sm">
                            Other Services & Details (Optional)
                        </Label>
                        <Textarea
                            id="services_additional"
                            value={servicesAdditional}
                            onChange={(e) => setServicesAdditional(e.target.value)}
                            placeholder="Example:\nNotifications: Push (FCM/APNs), SMS via Twilio\nMonitoring: Sentry for errors, DataDog for metrics\nCRM: Salesforce integration\nOther: Slack webhooks, Jira API"
                            className="min-h-[100px]"
                            rows={4}
                            maxLength={2000}
                            aria-describedby="services_additional-hint services_additional-counter"
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span id="services_additional-hint">Provide any external service-specific details.</span>
                            <span id="services_additional-counter" aria-live="polite">
                                {servicesAdditional.length}/2000
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <Head title={`Prepare Project: ${projectName}`} />

            

            <div className="flex">
                <ProjectsIndexSidebar
                    auth={sidebarAuth}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    onCreateProject={() => router.get('/projects')}
                    projectCount={projects.length}
                    projects={projects}
                    currentProjectId={projectId}
                />
                <main className="min-w-0 flex-1">
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
                <div className="border-b bg-muted/30">
                    <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <SidebarToggle
                                    isCollapsed={isSidebarCollapsed}
                                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                />
                                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-xs font-medium text-primary">AI Setup</span>
                                </div>
                                <div className="h-4 w-px bg-border"></div>
                                <h1 className="text-lg font-semibold text-foreground">Define Your Vision</h1>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-sm">
                                <TargetIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="text-sm font-medium text-foreground">{projectName}</span>
                            </div>
                        </div>
                        {/* Global progress bar */}
                        <div className="mt-3 flex items-center gap-4">
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-primary transition-all" style={{ width: `${overallProgress}%` }} />
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-primary">{overallProgress}%</span>
                                <span className="text-muted-foreground">progress</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                {saveStatus === 'saving' && <span className="animate-pulse text-amber-600">Saving…</span>}
                                {saveStatus === 'saved' && <span className="text-emerald-600">Saved</span>}
                                {saveStatus === 'idle' && <span className="text-muted-foreground">Idle</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        <div className="lg:order-1 lg:col-span-2">
                            <div className="sticky top-4 space-y-4">
                                

                                

                                {/* Project Index Sidebar */}
                                <Card className="border-2">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="rounded-lg bg-primary/10 p-1.5">
                                                    <FileTextIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm">Steps</CardTitle>
                                                    <CardDescription className="text-xs">Navigate to any step</CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-3 pb-3">
                                        <div className="space-y-3">
                                            {/* Business group */}
                                            <div className="rounded-lg border bg-card p-2">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <div className="text-xs font-semibold">Business</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {businessSteps.filter(stepCompleted).length}/{businessSteps.length} completed
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {businessSteps.map((step) => {
                                                        const Icon = step.icon;
                                                        const isCurrent = activeTab === 'business' && currentBusinessStep === step.id;
                                                        const isCompleted = stepCompleted(step);
                                                        return (
                                                            <button
                                                                key={`idx-b-${step.id}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    setActiveTab('business');
                                                                    setCurrentBusinessStep(step.id);
                                                                }}
                                                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                                    isCurrent ? 'bg-primary/10' : ''
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                                                        isCompleted
                                                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                                                            : isCurrent
                                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                                : 'border-muted-foreground/30 text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {isCompleted ? <CheckIcon className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                                                                </span>
                                                                <span className={`truncate ${isCompleted ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>{step.title}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Technical group */}
                                            <div className="rounded-lg border bg-card p-2">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <div className="text-xs font-semibold">Technical</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {technicalSteps.filter(stepCompleted).length}/{technicalSteps.length} completed
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {technicalSteps.map((step) => {
                                                        const Icon = step.icon;
                                                        const isCurrent = activeTab === 'technical' && currentTechnicalStep === step.id;
                                                        const isCompleted = stepCompleted(step);
                                                        return (
                                                            <button
                                                                key={`idx-t-${step.id}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    setActiveTab('technical');
                                                                    setCurrentTechnicalStep(step.id);
                                                                }}
                                                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                                    isCurrent ? 'bg-primary/10' : ''
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                                                        isCompleted
                                                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                                                            : isCurrent
                                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                                : 'border-muted-foreground/30 text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {isCompleted ? <CheckIcon className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                                                                </span>
                                                                <span className={`truncate ${isCompleted ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>{step.title}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="lg:order-2 lg:col-span-10">
                            <Card className="border-2 shadow-xl">
                                <CardHeader className="border-b pb-3">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-2 shadow-lg">
                                            <currentStepData.icon className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                                            <CardDescription className="mt-1 text-sm">
                                                {currentStepData.description}{' '}
                                                {currentStepData.optional && <span className="text-primary">(Optional - adds ~+6% accuracy)</span>}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-5">
                                    <div className="space-y-4">
                                        {activeTab === 'business' ||
                                        ![
                                            'platform_targets',
                                            'frontend_tech',
                                            'backend_tech',
                                            'database_tech',
                                            'ai_usage',
                                            'external_services',
                                        ].includes(currentStepData.field as string) ? (
                                            <div className="space-y-3">
                                                {currentStepData.field === 'who_for' && (
                                                    <div className="mb-6 space-y-4 rounded-lg border-2 p-4">
                                                        <div className="flex items-center gap-2">
                                                            <UsersIcon className="h-5 w-5 text-primary" />
                                                            <Label className="text-base font-semibold">Expected User Scale</Label>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="relative pt-2">
                                                                <Slider
                                                                    value={[expectedUserScale]}
                                                                    onValueChange={(value) => setExpectedUserScale(value[0])}
                                                                    min={0}
                                                                    max={6}
                                                                    step={1}
                                                                    className="w-full"
                                                                />
                                                                <div className="pointer-events-none absolute -top-1 right-0 left-0 flex justify-between px-0.5">
                                                                    {userScaleOptions.map((option, idx) => (
                                                                        <div
                                                                            key={option.value}
                                                                            className={`h-2 w-2 rounded-full border-2 transition-colors ${
                                                                                expectedUserScale === idx
                                                                                    ? 'border-primary bg-primary'
                                                                                    : 'border-muted-foreground/30 bg-background'
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="rounded-lg border px-4 py-2.5">
                                                                    <div className="text-xs text-muted-foreground">Users</div>
                                                                    <div className="text-lg font-bold text-primary">
                                                                        {userScaleOptions[expectedUserScale].label}
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-lg border px-4 py-2.5">
                                                                    <div className="text-xs text-muted-foreground">Scale Type</div>
                                                                    <div className="text-sm font-semibold text-foreground">
                                                                        {userScaleOptions[expectedUserScale].description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                                                                {userScaleOptions.map((option, idx) => (
                                                                    <span
                                                                        key={option.value}
                                                                        className={`text-center ${idx === 0 ? 'text-left' : idx === userScaleOptions.length - 1 ? 'text-right' : ''}`}
                                                                    >
                                                                        {option.label}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <Label htmlFor={currentStepData.field as string} className="text-base font-semibold">
                                                    {currentStepData.description}
                                                </Label>
                                                <textarea
                                                    id={currentStepData.field as string}
                                                    value={formData[currentStepData.field]}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                        handleInputChange(currentStepData.field, e.target.value)
                                                    }
                                                    placeholder={placeholders[currentStepData.field]}
                                                    className="min-h-[200px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                    rows={8}
                                                    maxLength={2000}
                                                    aria-describedby={`${currentStepData.field as string}-counter ${currentStepData.field as string}-hint`}
                                                />
                                                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                    <span id={`${currentStepData.field as string}-hint`}>Aim for 2–5 sentences.</span>
                                                    <span id={`${currentStepData.field as string}-counter`} aria-live="polite">
                                                        {formData[currentStepData.field].length}/2000
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">Hint: Press Ctrl+Enter to continue</div>
                                            </div>
                                        ) : (
                                            renderTechnicalStepContent()
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                                        <Button
                                            variant="outline"
                                            onClick={prevStep}
                                            disabled={isFirstStep}
                                            size="default"
                                            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        >
                                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-3">
                                            <div className="hidden rounded-full bg-primary/10 px-4 py-2 sm:block">
                                                <span className="text-xs font-semibold text-primary">
                                                    {activeTab === 'business' ? currentBusinessStep : currentTechnicalStep} / {currentSteps.length}
                                                </span>
                                            </div>

                                            {/* Primary action buttons contextually */}
                                            {!isLastStepOverall ? (
                                                <Button
                                                    onClick={nextStep}
                                                    disabled={!canProceed}
                                                    size="default"
                                                    className="shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                >
                                                    {activeTab === 'business' && currentBusinessStep === businessSteps.length ? 'Start Technical' : 'Next Step'}
                                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() => setShowReview(true)}
                                                        disabled={!canSubmit}
                                                        size="default"
                                                        className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:from-primary/90 hover:to-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                    >
                                                        Review
                                                        <CheckIcon className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {(activeTab === 'technical' || currentStepData.optional) && !isLastStepOverall && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={nextStep}
                                                    size="default"
                                                    className="text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    Skip
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {!canSubmit && isLastStepOverall && (
                                        <div className="mt-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                                            <strong>Almost there!</strong> Please complete all required Business fields to generate your project
                                            overview. Technical fields are optional and add +{accuracyBoost}% accuracy. Press Ctrl+Enter to
                                            continue.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden">
                                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
                                    <Button
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={isFirstStep}
                                        size="sm"
                                        className="h-10 px-3 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4" />
                                    </Button>

                                    <div className="text-center text-xs text-muted-foreground">
                                        Step {activeTab === 'business' ? currentBusinessStep : currentTechnicalStep} of {currentSteps.length}
                                    </div>

                                    {!isLastStepOverall ? (
                                        <Button
                                            onClick={nextStep}
                                            disabled={!canProceed}
                                            size="sm"
                                            className="h-10 px-3 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        >
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setShowReview(true)}
                                            disabled={!canSubmit}
                                            size="sm"
                                            className="h-10 bg-gradient-to-r from-primary to-primary/90 px-3 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="h-20 md:h-0" />
                        </div>

                        
                    </div>
                </div>
            </div>
                </main>
            </div>
            <ReviewModal
                isOpen={showReview}
                onClose={() => setShowReview(false)}
                onSubmit={handleSubmit}
                projectName={projectName}
                expectedScale={userScaleOptions[expectedUserScale].label}
                businessSteps={businessSteps as { id: number; title: string; field: string }[]}
                technicalSteps={technicalSteps as { id: number; title: string; field: string }[]}
                formData={formData}
                canSubmit={canSubmit}
            />
        </>
    );
}
