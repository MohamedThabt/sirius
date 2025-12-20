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
        description: "Describe your project idea in plain language. Sirius AI analyzes your brief and generates a complete Product Requirements Document with goals, scope, functional requirements, and success metrics.",
        icon: IconDocAI,
        gradient: "from-amber-500 to-orange-500",
        glowColor: "rgba(251, 191, 36, 0.15)",
    },
    {
        title: "Smart Feature Decomposition",
        description: "AI breaks your project into logical modules and user stories with acceptance criteria, priority levels, and implementation order. Each feature becomes a self-contained unit ready for development.",
        icon: IconLayersAI,
        gradient: "from-blue-500 to-indigo-500",
        glowColor: "rgba(99, 102, 241, 0.15)",
    },
    {
        title: "Auto-Generated Diagrams",
        description: "Every user story gets its own ERD, sequence diagram, and wireframe. Sirius understands the data flow and user interactions, creating accurate visual documentation without manual diagramming.",
        icon: IconDiagrams,
        gradient: "from-purple-500 to-pink-500",
        glowColor: "rgba(168, 85, 247, 0.15)",
    },
    {
        title: "Unified Database Schema",
        description: "Feature ERDs are intelligently merged into a single project-wide database diagram. See entity relationships across your entire system with proper normalization and foreign key mappings.",
        icon: IconDatabaseAI,
        gradient: "from-emerald-500 to-teal-500",
        glowColor: "rgba(16, 185, 129, 0.15)",
    },
    {
        title: "Version-Controlled Specs",
        description: "Every documentation change is tracked. Iterate on specs with your team, compare versions, and maintain a complete history of your project's evolution from concept to implementation.",
        icon: IconVersion,
        gradient: "from-violet-500 to-purple-500",
        glowColor: "rgba(139, 92, 246, 0.15)",
    },
    {
        title: "GitHub → AI Code Generators",
        description: "Export your complete specification to GitHub. When you use Copilot, Cursor, or other AI coding tools, they have full context of your PRD, ERDs, and architecture to generate accurate code.",
        icon: IconGitAI,
        gradient: "from-cyan-500 to-blue-500",
        glowColor: "rgba(34, 211, 238, 0.15)",
    },
];

const Features = () => {
    return (
        <section id="features" className="space-section relative py-24 md:py-32 px-4">
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-sm text-white/70 font-medium">Powerful Features</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                        Tools designed to help you get ahead
                    </h2>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                        Stop spending weeks on documentation. Sirius transforms your project brief into production-ready specs, diagrams, and technical documentation—in hours.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="group relative"
                            >
                                {/* Glow effect on hover */}
                                <div 
                                    className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                                    style={{ background: feature.glowColor }}
                                />
                                
                                {/* Card */}
                                <div className="relative h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.06] group-hover:-translate-y-1">
                                    {/* Icon Container with Custom SVGs */}
                                    <div className="mb-5 transition-transform duration-500 group-hover:scale-110">
                                        <Icon className="w-14 h-14" />
                                    </div>
                                    
                                    {/* Content */}
                                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-white transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                                        {feature.description}
                                    </p>
                                    
                                    {/* Bottom gradient line */}
                                    <div className={`absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
