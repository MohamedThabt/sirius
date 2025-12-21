import { memo } from 'react';
import { 
    IconDocAI, 
    IconLayersAI, 
    IconDiagrams, 
    IconDatabaseAI, 
    IconVersion, 
    IconGitAI 
} from './LandingIcons';

const features = [
    {
        title: "From Brief to PRD in Minutes",
        description: "Describe your project idea in plain language. Sirius AI analyzes your brief and generates a complete Product Requirements Document with goals, scope, and success metrics.",
        icon: IconDocAI,
    },
    {
        title: "Smart Feature Decomposition",
        description: "AI breaks your project into logical modules and user stories with acceptance criteria, priority levels, and implementation order.",
        icon: IconLayersAI,
    },
    {
        title: "Auto-Generated Diagrams",
        description: "Every user story gets its own ERD, sequence diagram, and wireframe. Sirius creates accurate visual documentation without manual diagramming.",
        icon: IconDiagrams,
    },
    {
        title: "Unified Database Schema",
        description: "Feature ERDs are intelligently merged into a single project-wide database diagram with proper normalization and foreign key mappings.",
        icon: IconDatabaseAI,
    },
    {
        title: "Version-Controlled Specs",
        description: "Every documentation change is tracked. Iterate on specs with your team, compare versions, and maintain a complete history.",
        icon: IconVersion,
    },
    {
        title: "GitHub → AI Code Generators",
        description: "Export your complete specification to GitHub. Copilot, Cursor, and other AI tools get full context to generate accurate code.",
        icon: IconGitAI,
    },
];

const Features = () => {
    return (
        <section id="features" className="relative py-24 md:py-32 px-4">
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header - X Business Style */}
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[hsl(var(--text-primary))] tracking-tight leading-[1.1]">
                        Why Sirius?
                    </h2>
                    <p className="text-lg md:text-xl text-[hsl(var(--text-secondary))] max-w-2xl mx-auto leading-relaxed">
                        Stop spending weeks on documentation. Transform your project brief into production-ready specs in hours.
                    </p>
                </div>

                {/* Features Grid - X Business "Why X Ads?" Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="premium-card"
                            >
                                {/* Icon Container */}
                                <div className="mb-6">
                                    <Icon className="w-12 h-12 opacity-90" />
                                </div>
                                
                                {/* Content */}
                                <h3 className="text-xl md:text-[22px] font-bold text-[hsl(var(--text-primary))] mb-3 leading-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-base md:text-[17px] text-[hsl(var(--text-secondary))] leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default memo(Features);
