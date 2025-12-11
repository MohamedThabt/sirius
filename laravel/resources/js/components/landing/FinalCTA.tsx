import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section id="final-cta" className="space-section relative pt-12 pb-24 md:pt-16 md:pb-32 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Stop Writing Docs Manually?
        </h2>
        <p className="text-lg md:text-xl text-[hsl(var(--text-secondary))] mb-10 max-w-2xl mx-auto">
          Join engineers who generate complete project specs in hours instead of weeks. Start with 3 free projects—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="default" size="lg" className="text-base px-8 bg-white text-black hover:bg-white/90" asChild>
            <a href="/beta">Join Closed Beta</a>
          </Button>
          <Button variant="ghost" size="lg" className="text-base text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]" asChild>
            <a href="#features">See How It Works</a>
          </Button>
        </div>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-6">
          No credit card required · 3 free projects · Export to GitHub
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
