const IntegrationsSection = () => {
  const integrations = [
    { name: "GitHub", icon: "🐙", color: "from-gray-500 to-gray-700" },
    { name: "Slack", icon: "💬", color: "from-purple-500 to-pink-500" },
    { name: "Figma", icon: "🎨", color: "from-red-500 to-orange-500" },
    { name: "GitLab", icon: "🦊", color: "from-orange-500 to-red-500" },
    { name: "Sentry", icon: "⚡", color: "from-purple-600 to-pink-600" },
    { name: "Zendesk", icon: "🎫", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section id="integrations" className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--bg-secondary))]/50 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Integrates with your tools
          </h2>
          <p
            className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.1s", opacity: 0 }}
          >
            Connect Dayra to the tools your team already uses.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {integrations.map((integration, idx) => (
            <div
              key={idx}
              className="group relative"
              style={{
                animation: `fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.3 + idx * 0.05}s forwards`,
                opacity: 0,
              }}
            >
              <div className="aspect-square bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--subtle-border))] rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[hsl(var(--text-quaternary))] transition-all duration-300 hover:scale-105">
                <div className={`text-4xl bg-gradient-to-br ${integration.color} bg-clip-text text-transparent`}>
                  {integration.icon}
                </div>
                <div className="text-sm font-medium text-[hsl(var(--text-primary))]">
                  {integration.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-[hsl(var(--text-tertiary))] text-sm">
            And 50+ more integrations
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
