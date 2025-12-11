const MetricsSection = () => {
  const metrics = [
    {
      number: "Hours",
      subtitle: "not weeks",
      title: "From Brief to Complete Specs",
      description: "What traditionally takes 2-4 weeks of manual documentation is now generated in hours. Enter your project description and get PRD, user stories, ERDs, and wireframes automatically.",
    },
    {
      number: "6",
      subtitle: "artifacts",
      title: "Complete Documentation Suite",
      description: "Every project gets a full set of documentation: System Overview, PRD, User Stories with acceptance criteria, ERDs, Sequence Diagrams, and Wireframes—all generated from your brief.",
    },
    {
      number: "1-Click",
      subtitle: "export",
      title: "GitHub Integration",
      description: "Push your entire documentation to a GitHub repository with a single click. AI code generators like Copilot and Cursor can then use your specs as context for accurate code generation.",
    },
    {
      number: "∞",
      subtitle: "iterations",
      title: "Unlimited Refinements",
      description: "Regenerate any section, edit details, and iterate until your specs are perfect. Full version history ensures you never lose work and can compare changes over time.",
    },
  ];

  return (
    <section id="metrics" className="space-section py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Built for Real Engineering Workflows
        </h2>
        <p className="text-center text-[hsl(var(--text-secondary))] text-lg mb-16 max-w-2xl mx-auto">
          Sirius fits into how you already work—from idea to implementation
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/[0.03] backdrop-blur-lg border border-white/[0.08] rounded-2xl p-8 hover:-translate-y-2 hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-5xl font-extrabold">
                  {metric.number}
                </div>
                <div className="text-lg text-[hsl(var(--text-tertiary))] font-medium">
                  {metric.subtitle}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">
                {metric.title}
              </h3>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
