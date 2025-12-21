import * as React from 'react';
import { FileText, Database, GitBranch, Sparkles, Layers, Workflow } from 'lucide-react';

/**
 * HeroProductMockup - A visual representation of the Sirius app for the hero section
 * Features floating glassmorphic cards with subtle animations
 */
const HeroProductMockup = () => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
        setMousePosition({ x, y });
    };

    return (
        <div 
            className="hero-mockup-container relative w-full h-full min-h-[400px] lg:min-h-[500px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
        >
            {/* Main App Window */}
            <div 
                className="hero-main-mockup absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[380px] lg:w-[420px]"
                style={{
                    transform: `translate(-50%, -50%) perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
                    transition: 'transform 0.15s ease-out',
                }}
            >
                {/* App Frame */}
                <div className="rounded-2xl border border-white/10 bg-[#0d0d0f]/90 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Title Bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                            </div>
                            <span className="text-xs font-medium text-white/50">Sirius - Project Specs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="text-[10px] text-indigo-400 font-medium">AI Active</span>
                        </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-4 space-y-4">
                        {/* Project Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-white">E-Commerce Platform</h4>
                                <p className="text-xs text-white/40">5 modules • 23 features</p>
                            </div>
                            <div className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                <span className="text-[10px] font-medium text-emerald-400">Ready</span>
                            </div>
                        </div>
                        
                        {/* Progress Bars */}
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-white/60">PRD Generation</span>
                                    <span className="text-emerald-400">Complete</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-white/60">ERD Design</span>
                                    <span className="text-indigo-400">In Progress</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full w-[75%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Module Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { icon: FileText, label: 'PRD', color: 'text-orange-400 bg-orange-500/20' },
                                { icon: Database, label: 'ERD', color: 'text-emerald-400 bg-emerald-500/20' },
                                { icon: GitBranch, label: 'GitHub', color: 'text-blue-400 bg-blue-500/20' },
                            ].map((item) => (
                                <div 
                                    key={item.label}
                                    className={`p-2.5 rounded-lg border border-white/[0.06] ${item.color} flex flex-col items-center gap-1.5`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="text-[10px] font-medium text-white/70">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Card - Top Right: Wireframes */}
            <div 
                className="hero-float-card-sm absolute top-[5%] right-[5%] w-[140px] animate-float-slow"
                style={{
                    transform: `translateZ(30px) rotate(8deg) translateX(${mousePosition.x * 0.3}px) translateY(${mousePosition.y * 0.3}px)`,
                }}
            >
                <div className="rounded-xl border border-white/10 bg-[#16181c]/90 backdrop-blur-lg p-3 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-[10px] font-medium text-white/70">Wireframes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-6 rounded bg-white/[0.06] border border-white/[0.04]" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Card - Bottom Left: Sequence Diagram */}
            <div 
                className="hero-float-card-sm absolute bottom-[10%] left-[0%] w-[160px] animate-float-medium"
                style={{
                    transform: `translateZ(25px) rotate(-6deg) translateX(${mousePosition.x * -0.2}px) translateY(${mousePosition.y * -0.2}px)`,
                }}
            >
                <div className="rounded-xl border border-white/10 bg-[#16181c]/90 backdrop-blur-lg p-3 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Workflow className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-[10px] font-medium text-white/70">Sequence</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-purple-500/30 border border-purple-500/40" />
                                <div className="w-px h-8 bg-purple-500/30" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Card - Right: AI Status */}
            <div 
                className="hero-float-card-sm absolute top-[45%] right-[-5%] w-[130px] animate-float-fast"
                style={{
                    transform: `translateZ(20px) rotate(4deg) translateX(${mousePosition.x * 0.4}px) translateY(${mousePosition.y * 0.2}px)`,
                }}
            >
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-lg p-3 shadow-xl">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            <div className="absolute inset-0 animate-ping">
                                <Sparkles className="h-4 w-4 text-indigo-400 opacity-50" />
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-indigo-300 block">AI Generating</span>
                            <span className="text-[8px] text-indigo-400/60">User Stories...</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative glow effects */}
            <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
        </div>
    );
};

export default HeroProductMockup;
