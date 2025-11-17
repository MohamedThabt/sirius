const WorkflowSection = () => {
  const workflows = [
    {
      title: "Create Project from Brief",
      description: "Enter project description. AI generates initial overview, PRD, and SRS automatically.",
      visual: (
        <div className="relative h-full bg-gradient-to-br from-[hsl(220_13%_10%)] to-[hsl(220_13%_6%)] rounded-lg border border-[hsl(var(--subtle-border))] p-6 overflow-hidden">
          <div className="space-y-3">
            {[
              { status: "todo", priority: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ), color: "bg-[hsl(var(--primary))]", label: "Brief" },
              { status: "todo", priority: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ), color: "bg-[hsl(var(--primary))]", label: "Edit" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--subtle-border))] rounded-lg p-4 flex items-center gap-3 hover:border-[hsl(var(--text-quaternary))] transition-all duration-300"
                style={{
                  animation: `slide-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                <div className="flex-1">
                  <div className="h-3 bg-[hsl(var(--text-primary))] rounded w-3/4 opacity-80"></div>
                </div>
                <div className="text-[hsl(var(--text-tertiary))]">{item.priority}</div>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
        </div>
      ),
    },
    {
      title: "Decompose into Features",
      description: "Break down project into modular user stories and features with AI assistance.",
      visual: (
        <div className="relative h-full bg-gradient-to-br from-[hsl(220_13%_10%)] to-[hsl(220_13%_6%)] rounded-lg border border-[hsl(var(--subtle-border))] p-6 overflow-hidden">
          <div className="space-y-3">
            {[
              { label: "Feature 1", status: "Complete" },
              { label: "Feature 2", status: "In Progress" },
              { label: "Feature 3", status: "Todo" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--subtle-border))] rounded-lg p-3 flex items-center gap-3 hover:border-[hsl(var(--text-quaternary))] transition-all duration-300"
                style={{
                  animation: `slide-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"></div>
                <div className="flex-1">
                  <div className="h-3 bg-[hsl(var(--text-primary))] rounded w-3/4 opacity-80"></div>
                  <div className="h-2 bg-[hsl(var(--text-tertiary))] rounded w-1/2 mt-1 opacity-40"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
        </div>
      ),
    },
    {
      title: "Generate Documentation",
      description: "AI creates ERDs, technical specs, sequence diagrams, and wireframes for each feature.",
      visual: (
        <div className="relative h-full bg-gradient-to-br from-[hsl(220_13%_10%)] to-[hsl(220_13%_6%)] rounded-lg border border-[hsl(var(--subtle-border))] p-6 overflow-hidden">
          <div className="grid grid-cols-2 gap-3 h-full">
            {[
              { label: "ERD", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              )},
              { label: "PRD", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )},
              { label: "Wireframe", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                </svg>
              )},
              { label: "Sequence", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )},
            ].map((col, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-xs text-[hsl(var(--text-tertiary))] font-medium mb-3">{col.label}</div>
                <div className="space-y-2">
                  <div
                    className="h-16 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--subtle-border))] rounded"
                    style={{
                      animation: `fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.1}s forwards`,
                      opacity: 0,
                    }}
                  >
                    <div className="p-2 text-[hsl(var(--text-secondary))]">{col.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
        </div>
      ),
    },
    {
      title: "Collaborate & Refine",
      description: "Team reviews, edits, and version controls documentation in real-time.",
      visual: (
        <div className="relative h-full bg-gradient-to-br from-[hsl(220_13%_10%)] to-[hsl(220_13%_6%)] rounded-lg border border-[hsl(var(--subtle-border))] p-6 overflow-hidden">
          <div className="space-y-4">
            <div className="text-[hsl(var(--text-secondary))]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            {[85, 70, 95].map((progress, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-2 bg-[hsl(var(--text-primary))] rounded w-1/3 opacity-80"></div>
                  <div className="text-xs text-[hsl(var(--text-tertiary))]">{progress}%</div>
                </div>
                <div className="h-2 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[hsl(var(--success))] rounded-full transition-all duration-1000"
                    style={{
                      width: `${progress}%`,
                      animation: `slide-in-up 1s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.2}s forwards`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[hsl(var(--success))]/10 rounded-full blur-3xl"></div>
        </div>
      ),
    },
    {
      title: "Aggregate ERDs",
      description: "Combine all feature ERDs into a single comprehensive project ERD.",
      visual: (
        <div className="relative h-full bg-gradient-to-br from-[hsl(220_13%_10%)] to-[hsl(220_13%_6%)] rounded-lg border border-[hsl(var(--subtle-border))] p-6 overflow-hidden flex items-center justify-center">
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--subtle-border))] rounded flex items-center justify-center"
                  style={{
                    animation: `fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <svg className="w-4 h-4 text-[hsl(var(--text-secondary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="text-center">
              <svg className="w-6 h-6 text-[hsl(var(--text-secondary))] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="h-16 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--subtle-border))] rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-[hsl(var(--text-secondary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
        </div>
      ),
    },
    {
      title: "Export to GitHub",
      description: "Push project specifications to GitHub repository to provide context for AI code generators.",
      visual: (
        <div className="relative h-full bg-gradient-to-br from-[hsl(220_13%_10%)] to-[hsl(220_13%_6%)] rounded-lg border border-[hsl(var(--subtle-border))] p-6 overflow-hidden flex items-center justify-center">
          <div className="text-center space-y-3">
            <svg className="w-16 h-16 text-[hsl(var(--text-secondary))] mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="text-xs text-[hsl(var(--text-tertiary))] font-mono">git push specs</div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gray-500/10 rounded-full blur-3xl"></div>
        </div>
      ),
    },
  ];

  return (
    <section id="method" className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            How It Works
          </h2>
          <p
            className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.1s", opacity: 0 }}
          >
            From project brief to GitHub export in six simple steps. AI-powered documentation generation at every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {workflows.map((workflow, idx) => (
            <div
              key={idx}
              className="group space-y-4"
              style={{
                animation: `fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.2 + idx * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                {workflow.visual}
              </div>
              <h3 className="text-xl font-semibold">{workflow.title}</h3>
              <p className="text-[hsl(var(--text-secondary))] text-sm leading-relaxed">
                {workflow.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
