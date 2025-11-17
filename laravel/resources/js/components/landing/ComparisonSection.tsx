import React from "react";
import { X, Check, Clock, FileText, Layers, Code2, Sparkles, Zap, GitBranch, Layout } from "lucide-react";

const ComparisonSection = () => {
  const problems = [
    {
      text: "Manual documentation creation takes weeks",
      icon: Clock,
    },
    {
      text: "Time-consuming requirements gathering and writing",
      icon: FileText,
    },
    {
      text: "Disconnected tools for PRDs, ERDs, and wireframes",
      icon: Layers,
    },
    {
      text: "Lack of visual diagrams and technical specifications",
      icon: Code2,
    },
  ];

  const solutions = [
    {
      text: "AI-automated documentation generation from briefs",
      icon: Sparkles,
    },
    {
      text: "Instant ERD, wireframe, and sequence diagram creation",
      icon: Zap,
    },
    {
      text: "Unified platform for all documentation artifacts",
      icon: Layout,
    },
    {
      text: "Seamless GitHub integration for AI code generator context",
      icon: GitBranch,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-transparent via-white/[0.01] to-white/[0.02] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              From Documentation Chaos to AI-Powered Automation
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[hsl(var(--text-secondary))]">
              Transform your pre-code workflow from manual, time-consuming documentation to instant AI-powered generation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Problems Section */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
              <div className="relative rounded-2xl border border-red-500/20 bg-white/[0.03] backdrop-blur-lg p-8 transition-all duration-300 hover:border-red-500/30 hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">
                    The Problem with Manual Documentation
                  </h3>
                </div>
                <div className="space-y-4">
                  {problems.map((problem, index) => {
                    const Icon = problem.icon;
                    return (
                      <div key={index} className="group/item flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-white/[0.02]">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 group-hover/item:bg-red-500/15 transition-colors">
                          <Icon className="h-4 w-4 text-red-400" />
                        </div>
                        <p className="flex-1 text-sm leading-relaxed text-[hsl(var(--text-secondary))] group-hover/item:text-white transition-colors">
                          {problem.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Solutions Section */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
              <div className="relative rounded-2xl border border-emerald-500/20 bg-white/[0.03] backdrop-blur-lg p-8 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">
                    The AI-Powered Documentation Solution
                  </h3>
                </div>
                <div className="space-y-4">
                  {solutions.map((solution, index) => {
                    const Icon = solution.icon;
                    return (
                      <div key={index} className="group/item flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-white/[0.02]">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 group-hover/item:bg-emerald-500/20 transition-colors">
                          <Icon className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="flex-1 text-sm leading-relaxed text-[hsl(var(--text-secondary))] group-hover/item:text-white transition-colors">
                          {solution.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Divider/Transition */}
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/30 to-emerald-500/30"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-lg">
                <svg className="h-6 w-6 text-[hsl(var(--text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/30 to-red-500/30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
