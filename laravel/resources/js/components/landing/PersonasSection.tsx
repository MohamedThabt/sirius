import { Code2, Users, Building2, ArrowRight } from "lucide-react";

const PersonasSection = () => {
  const personas = [
    {
      icon: Code2,
      title: "Software Engineers",
      description: "Create projects, generate documentation, break down features into user stories. Automate PRD, SRS, ERD, and wireframe creation.",
      link: "Learn more",
    },
    {
      icon: Users,
      title: "Team Leads & Managers",
      description: "Review documentation, manage team access, oversee project progress. Ensure documentation quality and completeness.",
      link: "Learn more",
    },
    {
      icon: Building2,
      title: "Engineering Teams",
      description: "Collaborate on documentation with version control, integrate with GitHub workflows, and export specifications for AI code generators.",
      link: "Learn more",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white/[0.02] to-transparent">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Built for Software Engineers & Teams
        </h2>
        <p className="text-center text-[#95A2B3] text-lg mb-16">
          From individual engineers to engineering teams, Sirius automates your pre-code documentation workflow
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="bg-white/[0.03] backdrop-blur-lg border border-white/[0.08] rounded-2xl p-8 hover:-translate-y-2 hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[hsl(var(--bg-tertiary))] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <persona.icon className="w-8 h-8 text-[hsl(var(--text-primary))]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{persona.title}</h3>
              <p className="text-[#95A2B3] mb-6 leading-relaxed">
                {persona.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors group/link"
              >
                {persona.link}
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonasSection;
