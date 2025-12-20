import React from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { 
    IconTimeWarning, 
    IconScattered, 
    IconNoVisuals, 
    IconMagic, 
    IconCentral, 
    IconSync, 
    IconGitAI,
    IconDocAI
} from './LandingIcons';

const ComparisonSection = () => {
  const problems = [
    {
      text: "Spending weeks writing manual specs",
      icon: IconTimeWarning,
    },
    {
      text: "Docs scattered in Notion & Confluence",
      icon: IconScattered,
    },
    {
      text: "No diagrams or outdated visuals",
      icon: IconNoVisuals,
    },
  ];

  const solutions = [
    {
      text: "Instant AI-generated PRDs & ERDs",
      icon: IconMagic,
    },
    {
      text: "Single source of truth for all modules",
      icon: IconCentral,
    },
    {
      text: "Visuals automatically synced with specs",
      icon: IconSync,
    },
  ];

  const workflowSteps = [
    {
      icon: IconDocAI,
      title: "1. Describe",
      description: "Explain your idea in plain language",
    },
    {
      icon: IconMagic,
      title: "2. Generate",
      description: "AI creates PRD, ERDs & wireframes",
    },
    {
      icon: IconGitAI,
      title: "3. Export",
      description: "Ship context to GitHub for coding",
    },
  ];

  return (
    <section id="comparison" className="space-section py-24 px-4 border-t border-white/[0.05]">
      <div className="container mx-auto max-w-5xl">
        {/* Simplified Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            From Documentation Chaos to <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              AI-Powered Automation
            </span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Transform your pre-code workflow from manual, time-consuming documentation to instant AI-powered generation.
          </p>
        </div>

        {/* Clean Side-by-Side Comparison */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 relative mb-24">
          
          {/* Divider Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />

          {/* Left: Manual (Problems) */}
          <div className="space-y-8">
             <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider uppercase">
                  Manual Workflow
                </span>
             </div>
             <div className="space-y-6">
                {problems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-5 group">
                      <div className="flex-shrink-0 opacity-70 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
                        <Icon className="w-12 h-12" />
                      </div>
                      <span className="text-lg text-white/60 group-hover:text-white/80 transition-colors">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Right: AI (Solutions) */}
          <div className="space-y-8">
             <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                  Sirius Automation
                </span>
             </div>
             <div className="space-y-6">
                {solutions.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-5 group">
                       <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Icon className="w-12 h-12" />
                      </div>
                      <span className="text-lg text-white font-medium">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Simplified Workflow */}
        <div className="border-t border-white/[0.05] pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className="w-16 h-16 relative z-10 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
