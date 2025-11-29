import ProjectFlowCanvas from '@/components/Projects/ProjectFlowCanvas';
import ProjectSidebarPanel from '@/components/Projects/ProjectSidebarPanel';
import {
    CodeIcon,
    DatabaseIcon,
    FileIcon,
    HomeIcon,
    Layers as LayersIcon,
    LightbulbIcon,
    TrendingUpIcon,
    ZapIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const HeroIllustration = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
    }, []);

    // Mock data for demonstration
    const mockProject = {
        id: 1,
        name: 'E-commerce Platform',
        status: 'in_progress',
        c4: null,
        brief: 'A modern e-commerce platform',
    };

    const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: undefined,
        email_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const mockFeatures = [
        {
            id: 1,
            name: 'User Authentication',
            summary: 'Login and registration system',
            priority: 'high' as const,
            status: 'completed' as const,
            order_of_implementation: 1,
        },
        {
            id: 2,
            name: 'Product Catalog',
            summary: 'Browse and search products',
            priority: 'high' as const,
            status: 'in_progress' as const,
            order_of_implementation: 2,
        },
        {
            id: 3,
            name: 'Shopping Cart',
            summary: 'Add items to cart',
            priority: 'medium' as const,
            status: 'draft' as const,
            order_of_implementation: 3,
        },
    ];

    const mockSteps = [
        {
            id: 'overview',
            title: 'System Overview',
            description: 'High-level project overview',
            icon: FileIcon,
            isCompleted: true,
            isCurrent: false,
            isLocked: false,
            isHardLocked: false,
            actionType: 'view' as const,
            actionPath: null,
            onClick: () => {},
        },
        {
            id: 'technical_details',
            title: 'Technical Details',
            description: 'Architecture and stack',
            icon: CodeIcon,
            isCompleted: true,
            isCurrent: false,
            isLocked: false,
            isHardLocked: false,
            actionType: 'view' as const,
            actionPath: null,
            onClick: () => {},
        },
        {
            id: 'prd',
            title: 'PRD',
            description: 'Product requirements',
            icon: FileIcon,
            isCompleted: true,
            isCurrent: false,
            isLocked: false,
            isHardLocked: false,
            actionType: 'view' as const,
            actionPath: null,
            onClick: () => {},
        },
        {
            id: 'features',
            title: 'Features',
            description: 'Feature specifications',
            icon: ZapIcon,
            isCompleted: false,
            isCurrent: true,
            isLocked: false,
            isHardLocked: false,
            actionType: 'view' as const,
            actionPath: null,
            onClick: () => {},
        },
        {
            id: 'erd',
            title: 'Database Schema',
            description: 'ERD and database design',
            icon: DatabaseIcon,
            isCompleted: false,
            isCurrent: false,
            isLocked: false,
            isHardLocked: false,
            actionType: 'view' as const,
            actionPath: null,
            onClick: () => {},
        },
        {
            id: 'architecture',
            title: 'Architecture',
            description: 'System architecture (C4)',
            icon: LayersIcon,
            isCompleted: false,
            isCurrent: false,
            isLocked: false,
            isHardLocked: false,
            actionType: 'view' as const,
            actionPath: null,
            onClick: () => {},
        },
    ];

    const mockNavGroups = [
        {
            label: 'Plan',
            items: [
                {
                    key: 'home',
                    icon: HomeIcon,
                    label: 'Project Home',
                    active: true,
                    onClick: () => {},
                },
                {
                    key: 'overview',
                    icon: FileIcon,
                    label: 'System Overview',
                    onClick: () => {},
                },
                {
                    key: 'prd',
                    icon: FileIcon,
                    label: 'PRD',
                    onClick: () => {},
                },
                {
                    key: 'features',
                    icon: ZapIcon,
                    label: 'Features',
                    onClick: () => {},
                },
            ],
        },
        {
            label: 'Design',
            items: [
                {
                    key: 'brainstorming',
                    icon: LightbulbIcon,
                    label: 'Brainstorming',
                    onClick: () => {},
                },
            ],
        },
        {
            label: 'Technical',
            items: [
                {
                    key: 'erd',
                    icon: DatabaseIcon,
                    label: 'Database Designer',
                    onClick: () => {},
                },
                {
                    key: 'c4',
                    icon: LayersIcon,
                    label: 'System Architecture',
                    onClick: () => {},
                },
                {
                    key: 'technology',
                    icon: CodeIcon,
                    label: 'Technology Stack',
                    onClick: () => {},
                },
            ],
        },
    ];

    const mockHealth = {
        label: 'good',
        Icon: TrendingUpIcon,
        color: 'text-blue-600 dark:text-blue-300',
    };

    return (
        <section className="relative mt-16 w-full px-4 pb-24 md:mt-24">
            <div className="mx-auto max-w-7xl">
                <div
                    className="perspective-1000 relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0) rotateX(0deg)' : 'translateY(40px) rotateX(5deg)',
                        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    {/* App Screenshot/Mockup - Projects/Show.tsx UI */}
                    <div className="relative aspect-[16/10] bg-background md:aspect-[16/9]">
                        {/* Top Bar */}
                        <div className="absolute top-0 right-0 left-0 flex h-12 items-center justify-between border-b bg-card/50 px-4 backdrop-blur-sm md:h-14">
                            {/* Traffic Lights */}
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#FF5F57]"></div>
                                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]"></div>
                                <div className="h-3 w-3 rounded-full bg-[#28C840]"></div>
                            </div>

                            {/* Center Title */}
                            <div className="text-xs font-medium text-foreground md:text-sm">{mockProject.name}</div>

                            {/* Right Icons */}
                            <div className="flex items-center gap-3">
                                <button className="text-muted-foreground transition-colors hover:text-foreground">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="absolute inset-0 top-12 flex md:top-14">
                            {/* Sidebar - Real ProjectSidebarPanel */}
                            <div className="hidden md:block">
                                <ProjectSidebarPanel
                                    project={mockProject}
                                    navGroups={mockNavGroups}
                                    repository={null}
                                    completionPercentage={67}
                                    health={mockHealth}
                                    isCollapsed={false}
                                    user={mockUser}
                                />
                            </div>

                            {/* Main Panel - Real ProjectFlowCanvas */}
                            <div className="flex-1 overflow-hidden">
                                <ProjectFlowCanvas
                                    steps={mockSteps}
                                    completionPercentage={67}
                                    completedStepsCount={3}
                                    totalStepsCount={6}
                                    health={mockHealth}
                                    features={mockFeatures}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Glow Effect */}
                    <div className="absolute -bottom-32 left-1/2 h-32 w-[80%] -translate-x-1/2 bg-gradient-to-t from-primary/10 to-transparent blur-3xl"></div>
                </div>
            </div>
        </section>
    );
};

export default HeroIllustration;
