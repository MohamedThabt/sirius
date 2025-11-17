import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, FileText, Database, GitBranch } from "lucide-react";

const headline = "From Project Brief to Complete Spec";
const subheadline =
  "Turn your idea into complete technical specifications. Sirius generates PRDs, user stories, ERDs, diagrams, and wireframes—automatically.";

const coreArtifacts = [
  { icon: FileText, label: "PRD", desc: "Complete documentation" },
  { icon: Database, label: "ERDs & C4", desc: "Architecture diagrams" },
  { icon: GitBranch, label: "User Stories", desc: "Feature breakdown" },
];

const additionalFeatures = [
  "System Overviews",
  "Feature Lists",
  "Wireframes",
  "Sequence Diagrams",
  "Version Control with Diff History",
];

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="sirius-hero relative overflow-hidden">
      <div className="hero-gradient" aria-hidden="true" />
      <div className="hero-stars hero-stars--one" aria-hidden="true" />
      <div className="hero-stars hero-stars--two" aria-hidden="true" />
      <div className="hero-stars hero-stars--three" aria-hidden="true" />
      <div className="hero-nebula hero-nebula--left" aria-hidden="true" />
      <div className="hero-nebula hero-nebula--right" aria-hidden="true" />

      <div className="hero-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hero-copy" style={{ opacity: isVisible ? 1 : 0 }}>
          {/* Eyebrow with icon */}
          <div className="hero-eyebrow mb-6 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Sirius AI Planning Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-headline mb-6 text-center" aria-label={headline}>
            {headline.split(" ").map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="hero-headline-word"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20%)",
                  transitionDelay: `${index * 0.05}s`,
                }}
              >
                {word}
                {"\u00a0"}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p
            className="hero-subheadline mx-auto mb-8 max-w-3xl text-balance text-center text-lg leading-relaxed text-white/85 sm:text-xl"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(16px)",
              transitionDelay: "0.25s",
            }}
          >
            {subheadline}
          </p>

          {/* Core Artifacts - Visual Cards */}
          <div
            className="mx-auto mb-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "0.35s",
            }}
          >
            {coreArtifacts.map((artifact, index) => {
              const Icon = artifact.icon;
              return (
                <div
                  key={artifact.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:border-indigo-400/30 hover:bg-white/10"
                  style={{
                    transitionDelay: `${0.4 + index * 0.1}s`,
                  }}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-indigo-300" />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-white">{artifact.label}</h3>
                  <p className="text-sm text-white/60">{artifact.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Additional Features */}
          <div
            className="mx-auto mb-10 max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "0.55s",
            }}
          >
            <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-indigo-300">
              Plus Everything You Need
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {additionalFeatures.map((feature) => (
                <span
                  key={feature}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 transition-colors hover:border-indigo-400/40 hover:bg-white/10"
                >
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className="hero-cta mb-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "0.65s",
            }}
          >
            <Button size="lg" className="hero-cta-primary group h-12 px-8 text-base font-semibold" asChild>
              <a href="/projects">
                Generate Your First Spec
              </a>
            </Button>
            <Button size="lg" variant="ghost" className="hero-cta-secondary h-12 px-6 text-base" asChild>
              <a href="#demo" className="flex items-center gap-2">
                Watch the Workflow
                <svg className="hero-cta-icon" fill="none" viewBox="0 0 16 16">
                  <path
                    fill="currentColor"
                    d="M5.46967 11.4697C5.17678 11.7626 5.17678 12.2374 5.46967 12.5303C5.76256 12.8232 6.23744 12.8232 6.53033 12.5303L10.5303 8.53033C10.8207 8.23999 10.8236 7.77014 10.5368 7.47624L6.63419 3.47624C6.34492 3.17976 5.87009 3.17391 5.57361 3.46318C5.27713 3.75244 5.27128 4.22728 5.56054 4.52376L8.94583 7.99351L5.46967 11.4697Z"
                  />
                </svg>
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            className="hero-footnote flex flex-col items-center justify-center gap-3 text-center sm:flex-row"
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDelay: "0.75s",
            }}
          >
            <p className="flex items-center gap-2 text-sm text-white/70">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              No credit card required
            </p>
            <span className="hidden text-white/40 sm:inline">•</span>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Built for engineers & PMs
            </p>
            <span className="hidden text-white/40 sm:inline">•</span>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Enterprise-ready specs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
