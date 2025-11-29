import React from "react";
import { Code2, FileText, ArrowRight, Github, Sparkles } from "lucide-react";

const CompetitorComparison = () => {
  const workflowSteps = [
    {
      icon: FileText,
      title: "Plan with Sirius",
      description: "Generate PRDs, ERDs, wireframes, and specs",
      color: "from-[hsl(var(--bg-tertiary))] to-[hsl(var(--bg-tertiary))]/70",
      borderColor: "border-[hsl(var(--bg-tertiary))]/40",
    },
    {
      icon: Github,
      title: "Export to GitHub",
      description: "Structured documentation in your repo",
      color: "from-gray-500/20 to-gray-500/10",
      borderColor: "border-gray-500/30",
    },
    {
      icon: Code2,
      title: "Code with Copilot/Cursor",
      description: "AI code generators use your specs as context",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-transparent via-white/[0.01] to-white/[0.02] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/15 px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span className="text-xs font-semibold text-blue-300">Better Together</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Works Best with AI Code Generators
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[hsl(var(--text-secondary))]">
              Sirius automates pre-code planning and documentation. Export to GitHub, then hand off to Copilot or Cursor for seamless code generation.
            </p>
          </div>

          {/* Workflow Visualization */}
          <div className="relative">
            {/* Desktop Workflow */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between gap-6">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={index}>
                      {/* Step Card */}
                      <div className="flex-1">
                        <div className="group relative">
                          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-lg p-8 transition-all duration-300 hover:border-white/[0.12] hover:shadow-2xl hover:-translate-y-1">
                            {/* Icon */}
                            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} border ${step.borderColor} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            
                            {/* Content */}
                            <h3 className="mb-2 text-xl font-semibold text-white">{step.title}</h3>
                            <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      {index < workflowSteps.length - 1 && (
                        <div className="flex-shrink-0">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
                            <ArrowRight className="h-6 w-6 text-[hsl(var(--text-tertiary))]" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Mobile Workflow */}
            <div className="md:hidden space-y-6">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={index}>
                    {/* Step Card */}
                    <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-lg p-6 transition-all duration-300 hover:border-white/[0.12]">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} border ${step.borderColor} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                          <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    {index < workflowSteps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="h-6 w-6 rotate-90 text-[hsl(var(--text-tertiary))]" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Integration Details */}
          <div className="mt-16 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Visual */}
              <div className="relative">
                <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[hsl(220_13%_8%)] to-[hsl(220_13%_6%)] p-6">
                  {/* GitHub Repo Structure Mockup */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Github className="h-4 w-4" />
                      <span className="font-medium">project-repo</span>
                    </div>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <FileText className="h-3 w-3" />
                        <span>README.md</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="ml-1 h-3 w-3 rounded border border-white/20"></div>
                        <span>specs/</span>
                      </div>
                      <div className="ml-8 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <FileText className="h-3 w-3" />
                          <span>prd.md</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <FileText className="h-3 w-3" />
                          <span>DatabaseDesign.md</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <FileText className="h-3 w-3" />
                          <span>features/</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow to Copilot/Cursor */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2">
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                      <Code2 className="h-5 w-5 text-blue-400" />
                      <span className="text-xs font-medium text-blue-300">AI Context</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Benefits */}
              <div>
                <h3 className="mb-4 text-2xl font-semibold text-white">Perfect Integration</h3>
                <p className="mb-6 text-[hsl(var(--text-secondary))] leading-relaxed">
                  Sirius generates comprehensive documentation and exports it to your GitHub repository. 
                  When you use Copilot or Cursor, they can read your specs directly from the repo, 
                  providing better context for code generation.
                </p>
                <div className="space-y-4">
                  {[
                    "Export PRDs, ERDs, and specs to GitHub",
                    "AI code generators use specs as context",
                    "Seamless handoff from planning to coding",
                    "Better code quality with structured documentation",
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                        <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-[hsl(var(--text-secondary))]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-sm text-[hsl(var(--text-tertiary))] mb-4">
              Ready to streamline your workflow?
            </p>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/10"
            >
              Start Creating Documentation
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitorComparison;
