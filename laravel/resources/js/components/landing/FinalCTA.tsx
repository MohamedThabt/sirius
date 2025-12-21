import { memo } from "react";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section id="final-cta" className="space-section relative py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[hsl(var(--text-primary))]">
          Ready to Stop Writing Docs Manually?
        </h2>
        <p className="text-lg md:text-xl text-[hsl(var(--text-secondary))] mb-10 max-w-2xl mx-auto">
          Join engineers who generate complete project specs in hours instead of weeks. Free during closed beta—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="default" size="lg" className="h-14 px-10 text-base font-semibold rounded-full bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] hover:bg-white hover:text-black border-0 shadow-none" asChild>
            <a href="/beta">Join Closed Beta</a>
          </Button>
          <Button variant="ghost" size="lg" className="h-14 px-8 text-base font-medium rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm" asChild>
            <a href="#features">See How It Works</a>
          </Button>
        </div>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-6">
          Free during closed beta · 3 free projects · Export to GitHub
        </p>
      </div>
    </section>
  );
};

export default memo(FinalCTA);
