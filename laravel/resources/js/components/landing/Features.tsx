const Features = () => {
  const features = [
    {
      title: "AI-Generated Documentation",
      description: "Automatic PRD, SRS, and project overview generation from briefs. AI understands context and creates production-ready documentation instantly.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      title: "Project Decomposition",
      description: "Break down projects into modular features and user stories. Organize complex projects into manageable components with AI assistance.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: "from-blue-400 to-blue-600",
    },
    {
      title: "Visual Documentation",
      description: "Auto-generate ERDs, wireframes, and sequence diagrams. AI creates visual representations of your architecture and data models automatically.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "ERD Aggregation",
      description: "Combine user story ERDs into comprehensive project ERDs. Visualize your complete database structure in one unified diagram.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Team Collaboration",
      description: "Real-time collaboration on documentation with version control. Review, edit, and refine documentation together with your team.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-indigo-400 to-purple-500",
    },
    {
      title: "GitHub Integration",
      description: "Export project specifications to GitHub repositories. Provide context for AI code generators by storing all documentation alongside your code.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      gradient: "from-cyan-400 to-blue-500",
    },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Everything You Need for Pre-Code Documentation
          </h2>
          <p
            className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.1s", opacity: 0 }}
          >
            From project brief to production-ready documentation. AI-powered tools for automating your pre-code phase workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group space-y-4"
              style={{
                animation: `fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.2 * idx}s forwards`,
                opacity: 0,
              }}
            >
              <div className="text-[hsl(var(--text-secondary))]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--text-primary))]">
                {feature.title}
              </h3>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
