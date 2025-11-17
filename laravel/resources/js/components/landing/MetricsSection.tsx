const MetricsSection = () => {
  const metrics = [
    {
      number: "90%",
      title: "Time saved on documentation",
      description: "Reduce documentation creation time from weeks to hours with AI automation",
    },
    {
      number: "100%",
      title: "Documentation artifacts generated",
      description: "Automatically generate PRDs, SRSs, ERDs, wireframes, and sequence diagrams",
    },
    {
      number: "5x",
      title: "Faster pre-code phase",
      description: "Jump from project brief to GitHub-ready documentation in hours, not weeks",
    },
    {
      number: "24/7",
      title: "AI documentation generation",
      description: "Always-on AI assistant that generates comprehensive documentation artifacts",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Why Choose Dayra for Documentation?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mt-16">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/[0.03] backdrop-blur-lg border border-white/[0.08] rounded-2xl p-8 hover:-translate-y-2 hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="text-6xl font-extrabold mb-4">
                {metric.number}
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {metric.title}
              </h3>
              <p className="text-[#95A2B3] leading-relaxed">
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
