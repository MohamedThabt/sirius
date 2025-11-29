const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Sirius has transformed our pre-code workflow. What used to take weeks of documentation now happens in hours with AI-generated PRDs, ERDs, and wireframes.",
      author: "Sarah Chen",
      role: "Engineering Lead",
      company: "TechStart",
      avatar: "SC",
    },
    {
      quote: "The AI-generated documentation is comprehensive and accurate. Exporting to GitHub gives our AI code generators the perfect context they need.",
      author: "Michael Rodriguez",
      role: "Senior Software Engineer",
      company: "BuildCo",
      avatar: "MR",
    },
    {
      quote: "We've eliminated weeks of manual documentation work. Sirius generates everything we need - from PRDs to sequence diagrams - automatically.",
      author: "Emma Williams",
      role: "CTO",
      company: "Acme Corp",
      avatar: "EW",
    },
  ];

  return (
    <section id="customers" className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            Loved by Engineering Teams
          </h2>
          <p
            className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.1s", opacity: 0 }}
          >
            Join engineering teams automating their pre-code documentation workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--subtle-border))] rounded-xl p-6 md:p-8 hover:border-[hsl(var(--text-quaternary))] transition-all duration-300"
              style={{
                animation: `fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.2 + idx * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              <p className="text-[hsl(var(--text-primary))] mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-xs text-[hsl(var(--text-tertiary))]">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
