import React from "react";
import { X, Check, Clock, FileText, Layers, Code2, Sparkles, Zap, GitBranch, Layout, ArrowRight, Github } from "lucide-react";

const ComparisonSection = () => {
  const problems = [
    {
      text: "Spending weeks writing PRDs, ERDs, and technical specs manually",
      icon: Clock,
    },
    {
      text: "Scattered documentation across Notion, Confluence, and Google Docs",
      icon: FileText,
    },
    {
      text: "No visual diagrams—or hours spent in draw.io and Mermaid",
      icon: Layers,
    },
    {
      text: "AI code tools generate wrong code without proper context",
      icon: Code2,
    },
  ];

  const solutions = [
    {
      text: "AI generates complete PRD, SRS, ERDs, and wireframes from your brief",
      icon: Sparkles,
    },
    {
      text: "Single platform for all documentation—versioned and organized",
      icon: Zap,
    },
    {
      text: "Auto-generated diagrams that stay in sync with your specs",
      icon: Layout,
    },
    {
      text: "Export to GitHub so Copilot/Cursor understand your architecture",
      icon: GitBranch,
    },
  ];

  const workflowSteps = [
    {
      icon: FileText,
      title: "1. Describe Your Idea",
      description: "Write a brief description of your project in plain language",
    },
    {
      icon: Sparkles,
      title: "2. AI Generates Specs",
      description: "Sirius creates PRD, features, ERDs, wireframes, and diagrams",
    },
    {
      icon: Github,
      title: "3. Export to GitHub",
      description: "Push documentation to your repo for AI code generator context",
    },
  ];

  return (
    <section id="comparison" className="space-section py-24">
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

          {/* Workflow Steps */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={index}>
                    <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-lg p-6 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--bg-tertiary))] border border-white/10">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                      <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                        {step.description}
                      </p>
                      {index < workflowSteps.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                          <ArrowRight className="h-6 w-6 text-[hsl(var(--text-tertiary))]" />
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
