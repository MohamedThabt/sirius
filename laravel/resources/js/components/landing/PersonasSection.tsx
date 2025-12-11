import { Code2, Users, Building2 } from "lucide-react";

const PersonasSection = () => {
  const personas = [
    {
      icon: Code2,
      title: "Solo Developers & Freelancers",
      description: "Stop spending days on documentation before you can start coding. Describe your client's project, get complete specs in hours, and jump straight into development with clear requirements.",
      benefits: ["Fast client proposals", "Professional documentation", "Clear scope definition"],
    },
    {
      icon: Users,
      title: "Startup Engineering Teams",
      description: "Move fast without breaking things. Sirius gives every feature proper specs before implementation, reducing rewrites and keeping your team aligned as you scale.",
      benefits: ["Reduce technical debt", "Better sprint planning", "Onboard devs faster"],
    },
    {
      icon: Building2,
      title: "Enterprise Development",
      description: "Standardize documentation across teams and projects. Export specs to GitHub so your AI coding tools have full context, improving code quality and consistency.",
      benefits: ["Consistent standards", "Knowledge sharing", "AI-ready codebase"],
    },
  ];

  return (
    <section id="personas" className="space-section pt-24 pb-16">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Built for Engineers Who Ship
        </h2>
        <p className="text-center text-[hsl(var(--text-secondary))] text-lg mb-16 max-w-2xl mx-auto">
          Whether you're a solo developer or leading a team, Sirius fits your workflow
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="bg-white/[0.03] backdrop-blur-lg border border-white/[0.08] rounded-2xl p-8 hover:-translate-y-2 hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-[hsl(var(--bg-tertiary))] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <persona.icon className="w-7 h-7 text-[hsl(var(--text-primary))]" />
              </div>
              <h3 className="text-xl font-bold mb-4">{persona.title}</h3>
              <p className="text-[hsl(var(--text-secondary))] mb-6 leading-relaxed">
                {persona.description}
              </p>
              <ul className="space-y-2">
                {persona.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-[hsl(var(--text-tertiary))]">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonasSection;
