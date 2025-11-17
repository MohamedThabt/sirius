const SocialProof = () => {
  const companies = [
    "GitHub",
    "GitLab",
    "Vercel",
    "Linear",
    "Notion",
  ];

  return (
    <section className="py-16 border-b border-white/[0.08]">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm font-semibold tracking-[0.11em] uppercase text-[#95A2B3] mb-8">
          Trusted by developers at
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {companies.map((company) => (
            <div
              key={company}
              className="text-2xl font-semibold text-white/20 hover:text-white/40 transition-colors"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
