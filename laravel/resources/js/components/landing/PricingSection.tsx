import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "",
      role: "Individual Engineer",
      description: "Test Dayra with a single project",
      features: [
        "1 User",
        "1 Project workspace",
        "5 Documentation artifact generations",
        "PRD, SRS, ERD, wireframes, sequence diagrams",
        "GitHub export",
        "Read-only project sharing",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Team",
      price: "$19",
      period: "/user/month",
      role: "Engineering Teams",
      description: "For teams that need automated documentation generation",
      badge: "Most Popular",
      features: [
        "Per-seat licensing",
        "Unlimited projects",
        "1,000 AI generation credits/month",
        "Full artifact suite (PRD, SRS, ERD, sequence diagrams, wireframes)",
        "Version control for documentation",
        "Role-based collaboration",
        "GitHub export for AI code generator context",
      ],
      cta: "Start 14-Day Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      role: "Large Organizations",
      description: "Advanced controls and integrations",
      features: [
        "Everything in Team",
        "Usage-based billing for additional credits",
        "SSO & advanced access control",
        "Audit logs & compliance reporting",
        "GitHub/Confluence integrations",
        "RAG & context grounding (coming soon)",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Pricing
        </h2>
        <p className="text-center text-[#95A2B3] text-lg mb-16">
          Automate your pre-code documentation workflow. Pay per seat. Scale AI credits with usage. 14-day trial, no card required.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white/[0.03] backdrop-blur-lg border rounded-2xl p-8 hover:-translate-y-2 transition-all duration-300 ${
                tier.highlighted
                  ? "border-[hsl(var(--text-primary))] shadow-2xl scale-105"
                  : "border-white/[0.08]"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[hsl(var(--bg-tertiary))] text-white text-sm font-semibold px-4 py-1 rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                <p className="text-[#95A2B3] text-xs mb-3">{tier.role}</p>
                <p className="text-[#95A2B3] text-sm mb-4">{tier.description}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-extrabold">{tier.price}</span>
                  <span className="text-[#95A2B3] mb-2">{tier.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[hsl(var(--text-primary))] flex-shrink-0 mt-0.5" />
                    <span className="text-[#95A2B3]">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  tier.highlighted
                    ? "bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-tertiary))]/80 text-white"
                    : "bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-[hsl(var(--text-primary))]"
                } transition-all`}
                asChild
              >
                <a href={tier.name === "Free" || tier.name === "Team" ? "/projects" : "#contact"}>
                  {tier.cta}
                </a>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-[#95A2B3] text-sm mt-12">
          All plans include 14-day free trial. Enterprise billing available on request.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
