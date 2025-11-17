const StatsSection = () => {
  const stats = [
    { value: "10,000+", label: "Documentation artifacts generated" },
    { value: "200ms", label: "Avg response time" },
    { value: "99.99%", label: "Uptime" },
    { value: "5M+", label: "Hours saved" },
  ];

  return (
    <section className="relative py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center space-y-2"
              style={{
                animation: `fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.2 + idx * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
