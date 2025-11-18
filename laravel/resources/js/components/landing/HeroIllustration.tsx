import AppLogoIcon from '@/components/app-logo-icon';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    Github as GithubIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    TrendingUpIcon,
    ZapIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const HeroIllustration = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeSection, setActiveSection] = useState<'home' | 'features'>('home');

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSection((prev) => (prev === 'home' ? 'features' : 'home'));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Mock data for demo
    const completionPercentage = 67;
    const projectName = 'E-commerce Platform';

    const navGroups = [
        {
            label: 'Plan',
            items: [
                { key: 'home', label: 'Project Home', icon: HomeIcon, active: activeSection === 'home' },
                { key: 'overview', label: 'System Overview', icon: FileIcon, muted: false },
                { key: 'prd', label: 'PRD', icon: FileIcon, emphasize: false },
                { key: 'features', label: 'Features', icon: ZapIcon, active: activeSection === 'features' },
            ],
        },
        {
            label: 'Design',
            items: [{ key: 'brainstorming', label: 'Brainstorming', icon: LightbulbIcon, emphasize: true }],
        },
        {
            label: 'Technical',
            items: [
                { key: 'erd', label: 'Database Designer', icon: DatabaseIcon, muted: false },
                { key: 'c4', label: 'System Architecture', icon: LayersIcon, emphasize: false },
                { key: 'technology', label: 'Technology Stack', icon: CodeIcon },
            ],
        },
    ];

    const features = [
        {
            title: 'User Authentication & Authorization',
            description: 'Implement secure user registration, login, password reset, and role-based access control for customer...',
            status: 'completed',
            priority: 'critical',
            order: '#1',
        },
        {
            title: 'Payment Processing Integration',
            description: 'Integrate the Stripe payment gateway to securely process one-time credit card payments and manage...',
            status: 'draft',
            priority: 'high',
            order: '#1',
        },
        {
            title: 'Product Catalog Management',
            description: 'Create a comprehensive product management system with categories, variants, inventory tracking, and...',
            status: 'in_progress',
            priority: 'high',
            order: '#2',
        },
        {
            title: 'Shopping Cart & Checkout',
            description: 'Implement shopping cart functionality with persistent storage, guest checkout, and multiple payment...',
            status: 'in_progress',
            priority: 'high',
            order: '#3',
        },
        {
            title: 'Order Management System',
            description: 'Build a comprehensive order tracking and management system for customers, vendors, an...',
            status: 'draft',
            priority: 'medium',
            order: '#4',
        },
        {
            title: 'Admin Dashboard & Analytics',
            description: 'Create an administrative dashboard with business intelligence, reporting, and system management...',
            status: 'draft',
            priority: 'medium',
            order: '#5',
        },
    ];

    return (
        <section className="relative mt-16 w-full px-4 pb-24 md:mt-24">
            <div className="mx-auto max-w-7xl">
                <div
                    className="perspective-1000 relative w-full overflow-hidden rounded-xl border border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))] shadow-2xl"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0) rotateX(0deg)' : 'translateY(40px) rotateX(5deg)',
                        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    {/* App Screenshot/Mockup */}
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-[hsl(220_13%_8%)] to-[hsl(220_13%_6%)] md:aspect-[16/9]">
                        {/* Top Bar */}
                        <div className="absolute top-0 right-0 left-0 flex h-12 items-center justify-between border-b border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))]/50 px-4 backdrop-blur-sm md:h-14">
                            {/* Traffic Lights */}
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#FF5F57]"></div>
                                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]"></div>
                                <div className="h-3 w-3 rounded-full bg-[#28C840]"></div>
                            </div>

                            {/* Center Title */}
                            <div className="text-xs font-medium text-[hsl(var(--text-primary))] md:text-sm">{projectName}</div>

                            {/* Right Icons */}
                            <div className="flex items-center gap-3">
                                <button className="text-[hsl(var(--text-quaternary))] transition-colors hover:text-[hsl(var(--text-primary))]">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="absolute inset-0 top-12 flex md:top-14">
                            {/* Sidebar - Same as Project Show */}
                            <div className="hidden w-48 border-r border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))]/30 backdrop-blur-sm md:block lg:w-56">
                                <div className="flex h-full flex-col justify-between p-3">
                                    <div className="scrollbar-hide overflow-y-auto">
                                        {/* Logo/Brand */}
                                        <div className="mb-4 border-b border-[hsl(var(--subtle-border))] pb-3">
                                            <div className="flex items-center">
                                                <AppLogoIcon className="h-5 w-auto" />
                                            </div>
                                        </div>

                                        {/* Project Info */}
                                        <div className="mb-4">
                                            <div className="mb-2">
                                                <div className="truncate text-xs font-medium text-[hsl(var(--text-primary))]">{projectName}</div>
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <div className="flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-300">
                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                                            />
                                                        </svg>
                                                        In Progress
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-3">
                                                <div className="mb-1 flex items-center justify-between text-[10px] text-[hsl(var(--text-tertiary))]">
                                                    <span>Progress</span>
                                                    <span>{completionPercentage}%</span>
                                                </div>
                                                <div className="h-1 w-full overflow-hidden rounded bg-[hsl(var(--bg-primary))]">
                                                    <div
                                                        className="h-full bg-white/30 transition-all duration-1000"
                                                        style={{ width: `${completionPercentage}%` }}
                                                    />
                                                </div>
                                                <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                                                    <svg className="h-3 w-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <span className="text-[hsl(var(--text-tertiary))]">
                                                        Health: <span className="font-medium text-emerald-300">Good</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation Groups */}
                                        <nav className="space-y-4">
                                            {navGroups.map((group) => (
                                                <div key={group.label} className="space-y-1">
                                                    <div className="px-2 text-[10px] font-medium tracking-wide text-[hsl(var(--text-quaternary))] uppercase">
                                                        {group.label}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        {group.items.map((item) => {
                                                            const Icon = item.icon;
                                                            const isActive = 'active' in item && item.active;
                                                            const isEmphasize = 'emphasize' in item && item.emphasize;
                                                            const isMuted = 'muted' in item;

                                                            return (
                                                                <button
                                                                    key={item.key}
                                                                    onClick={() => {
                                                                        if (item.key === 'home') setActiveSection('home');
                                                                        if (item.key === 'features') setActiveSection('features');
                                                                    }}
                                                                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                                                                        isActive
                                                                            ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))]'
                                                                            : isEmphasize
                                                                              ? 'text-[hsl(var(--primary))] hover:bg-[hsl(var(--bg-tertiary))]/50'
                                                                              : !isMuted
                                                                                ? 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]/50'
                                                                                : 'text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))]/50'
                                                                    }`}
                                                                >
                                                                    <Icon className="h-4 w-4" />
                                                                    <span className="truncate">{item.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Integrations Section */}
                                            <div className="space-y-1">
                                                <div className="px-2 text-[10px] font-medium tracking-wide text-[hsl(var(--text-quaternary))] uppercase">
                                                    Integrations
                                                </div>
                                                <button className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-[hsl(var(--text-tertiary))] transition-colors hover:bg-[hsl(var(--bg-tertiary))]/50 hover:text-[hsl(var(--text-primary))]">
                                                    <div className="flex items-center gap-2">
                                                        <GithubIcon className="h-4 w-4" />
                                                        <span>GitHub</span>
                                                    </div>
                                                    <CheckCircleIcon className="h-3 w-3 text-emerald-300" />
                                                </button>
                                            </div>
                                        </nav>
                                    </div>

                                    {/* User Section */}
                                    <div className="mt-2 shrink-0 border-t border-[hsl(var(--subtle-border))] pt-2">
                                        <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-[hsl(var(--bg-tertiary))]/50">
                                            <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[11px] font-medium text-[hsl(var(--text-primary))]">John Doe</div>
                                                <div className="truncate text-[10px] text-[hsl(var(--text-tertiary))]">john@example.com</div>
                                            </div>
                                            <svg
                                                className="h-3 w-3 shrink-0 text-[hsl(var(--text-quaternary))]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Panel - Dynamic Content */}
                            <div className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
                                {/* Home View */}
                                {activeSection === 'home' && (
                                    <div className="animate-fade-in space-y-4">
                                        {/* Project Metrics Dashboard */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded border border-[hsl(var(--subtle-border))] p-3">
                                                <div className="mb-1 text-[10px] font-medium text-[hsl(var(--text-tertiary))]">Overall Progress</div>
                                                <div className="mb-2 text-xl font-semibold text-[hsl(var(--text-primary))]">
                                                    {completionPercentage}%
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--bg-primary))]">
                                                    <div
                                                        className="h-full bg-white/30 transition-all duration-1000"
                                                        style={{ width: `${completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="rounded border border-[hsl(var(--subtle-border))] p-3">
                                                <div className="mb-1 text-[10px] font-medium text-[hsl(var(--text-tertiary))]">Total Features</div>
                                                <div className="mb-2 text-xl font-semibold text-[hsl(var(--text-primary))]">{features.length}</div>
                                                <div className="text-[10px] text-[hsl(var(--text-tertiary))]">2 completed, 2 in progress</div>
                                            </div>

                                            <div className="rounded border border-[hsl(var(--subtle-border))] p-3">
                                                <div className="mb-1 text-[10px] font-medium text-[hsl(var(--text-tertiary))]">Project Status</div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                                                        <TrendingUpIcon className="h-2.5 w-2.5" />
                                                        In Progress
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px]">
                                                    <CheckCircleIcon className="h-3 w-3 text-emerald-300" />
                                                    <span className="text-emerald-300">Good</span>
                                                </div>
                                            </div>

                                            <div className="rounded border border-[hsl(var(--subtle-border))] p-3">
                                                <div className="mb-1 text-[10px] font-medium text-[hsl(var(--text-tertiary))]">
                                                    GitHub Integration
                                                </div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                                                        <CheckCircleIcon className="h-3 w-3" />
                                                        Connected
                                                    </span>
                                                </div>
                                                <button className="text-[10px] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                                                    Manage
                                                </button>
                                            </div>
                                        </div>

                                        {/* Next Steps Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-1.5">
                                                <ArrowRightIcon className="h-4 w-4 text-[hsl(var(--text-primary))]" />
                                                <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Next Steps</h2>
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {[
                                                    {
                                                        title: 'Generate PRD',
                                                        description: 'Create a Product Requirements Document',
                                                        icon: FileIcon,
                                                        priority: 'high',
                                                    },
                                                    {
                                                        title: 'Design Database',
                                                        description: 'Create your database schema and ER diagrams',
                                                        icon: DatabaseIcon,
                                                        priority: 'medium',
                                                    },
                                                ].map((step, index) => (
                                                    <div
                                                        key={index}
                                                        className="group cursor-pointer rounded border border-[hsl(var(--subtle-border))] p-2.5 transition-colors hover:bg-[hsl(var(--bg-tertiary))]/40"
                                                        style={{
                                                            opacity: isVisible ? 1 : 0,
                                                            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                                                            transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
                                                        }}
                                                    >
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <div
                                                                className={`flex h-7 w-7 items-center justify-center rounded ${
                                                                    step.priority === 'high'
                                                                        ? 'bg-orange-100 dark:bg-orange-500/10'
                                                                        : 'bg-[hsl(var(--bg-tertiary))]'
                                                                }`}
                                                            >
                                                                <step.icon
                                                                    className={`h-3.5 w-3.5 ${
                                                                        step.priority === 'high'
                                                                            ? 'text-orange-600 dark:text-orange-400'
                                                                            : 'text-[hsl(var(--text-primary))]'
                                                                    }`}
                                                                />
                                                            </div>
                                                            {step.priority === 'high' && (
                                                                <span className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[9px] font-medium text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
                                                                    Priority
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="mb-1 text-xs font-semibold text-[hsl(var(--text-primary))]">{step.title}</h3>
                                                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{step.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Completion Breakdown */}
                                        <div className="space-y-3">
                                            <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Project Completion</h2>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { name: 'System Overview', completed: true, icon: FileIcon },
                                                    { name: 'PRD', completed: true, icon: FileIcon },
                                                    { name: 'Features', completed: true, icon: ZapIcon, count: 4 },
                                                    { name: 'Database Design', completed: false, icon: DatabaseIcon },
                                                    { name: 'System Architecture', completed: false, icon: LayersIcon },
                                                    { name: 'Non-Functional Reqs', completed: false, icon: FileIcon },
                                                ].map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="cursor-pointer rounded border border-[hsl(var(--subtle-border))] p-2.5 transition-colors hover:bg-[hsl(var(--bg-tertiary))]/40"
                                                        style={{
                                                            opacity: isVisible ? 1 : 0,
                                                            transform: isVisible ? 'scale(1)' : 'scale(0.95)',
                                                            transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`,
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`flex h-6 w-6 items-center justify-center rounded ${
                                                                        item.completed
                                                                            ? 'bg-emerald-100 dark:bg-emerald-500/10'
                                                                            : 'bg-[hsl(var(--bg-tertiary))]'
                                                                    }`}
                                                                >
                                                                    {item.completed ? (
                                                                        <CheckCircleIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                                    ) : (
                                                                        <item.icon className="h-3 w-3 text-[hsl(var(--text-tertiary))]" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-[11px] font-medium text-[hsl(var(--text-primary))]">
                                                                        {item.name}
                                                                    </div>
                                                                    {item.count !== undefined && (
                                                                        <div className="text-[9px] text-[hsl(var(--text-tertiary))]">
                                                                            {item.count} items
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ArrowRightIcon className="h-3 w-3 text-[hsl(var(--text-quaternary))]" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Features View */}
                                {activeSection === 'features' && (
                                    <div className="animate-fade-in space-y-3">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] md:text-base">Features</h2>
                                            <button className="inline-flex h-7 items-center justify-center rounded-md bg-[hsl(var(--primary))] px-3 text-[13px] font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-[hsl(var(--primary))]/90 hover:shadow-md">
                                                Create Feature
                                            </button>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {features.map((feature, idx) => (
                                                <div
                                                    key={idx}
                                                    className="cursor-pointer rounded border border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-tertiary))] p-3 transition-all hover:border-[hsl(var(--text-quaternary))]"
                                                    style={{
                                                        opacity: isVisible ? 1 : 0,
                                                        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                                                        transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.1}s`,
                                                    }}
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <h3 className="flex-1 pr-2 text-xs leading-tight font-semibold text-[hsl(var(--text-primary))]">
                                                            {feature.title}
                                                        </h3>
                                                        <span
                                                            className={`rounded border px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap ${
                                                                feature.priority === 'critical'
                                                                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'
                                                                    : feature.priority === 'high'
                                                                      ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400'
                                                                      : feature.priority === 'medium'
                                                                        ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
                                                                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-400'
                                                            }`}
                                                        >
                                                            {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
                                                        </span>
                                                    </div>
                                                    <p className="mb-3 line-clamp-2 text-[10px] leading-relaxed text-[hsl(var(--text-tertiary))]">
                                                        {feature.description}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--foreground))] shadow-sm transition-colors">
                                                            {feature.status === 'in_progress' ? 'In progress' : feature.status}
                                                        </span>
                                                        <span className="inline-flex items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--foreground))] shadow-sm transition-colors">
                                                            Order {feature.order}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Glow Effect */}
                    <div className="absolute -bottom-32 left-1/2 h-32 w-[80%] -translate-x-1/2 bg-gradient-to-t from-[hsl(var(--primary))]/10 to-transparent blur-3xl"></div>
                </div>
            </div>
        </section>
    );
};

export default HeroIllustration;
