import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
          Start Creating Documentation Today
        </h2>
        <p
          className="text-lg md:text-xl text-[hsl(var(--text-secondary))] mb-10 max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          Join developers who automate documentation with AI. From project brief to GitHub-ready specs in hours, not weeks.
        </p>
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <Button variant="default" size="lg" className="text-base px-8 bg-white text-black hover:bg-white/90" asChild>
            <a href="/projects">Get Started Free</a>
          </Button>
          <Button variant="ghost" size="lg" className="text-base text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]" asChild>
            <a href="#demo">Watch Demo</a>
          </Button>
        </div>
        <p
          className="text-sm text-[hsl(var(--text-tertiary))] mt-6 animate-fade-in-up"
          style={{ animationDelay: "0.3s", opacity: 0 }}
        >
          No credit card required · 3 free projects · Start in minutes
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
