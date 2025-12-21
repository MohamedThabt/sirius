import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Zap, User, AlertCircle } from "lucide-react";
import { Head, useForm } from "@inertiajs/react";
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import './landing.css';

interface BetaSignupProps {
  message?: string;
}

const queryClient = new QueryClient();

const BetaSignup = ({ message }: BetaSignupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
  });

  useEffect(() => {
    setIsVisible(true);
    // Force dark mode
    document.documentElement.classList.add('dark');
    
    return () => {
      // Optional: remove dark class on unmount if needed
      // document.documentElement.classList.remove('dark');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/beta/signup", {
      onSuccess: () => {
        setData({ name: "", email: "" });
      },
    });
  };

  return (
    <div className="linear-landing dark bg-background text-foreground">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Head title="Join Sirius Beta" />
          <Navbar hideBetaNav />
          <main>
            <section className="sirius-hero relative overflow-hidden min-h-screen flex items-center justify-center p-4">
        <div className="hero-gradient" aria-hidden="true" />
        <div className="hero-stars hero-stars--one" aria-hidden="true" />
        <div className="hero-stars hero-stars--two" aria-hidden="true" />
        <div className="hero-stars hero-stars--three" aria-hidden="true" />
        <div className="hero-nebula hero-nebula--left" aria-hidden="true" />
        <div className="hero-nebula hero-nebula--right" aria-hidden="true" />

        <div className="hero-inner mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <div className="flex flex-col text-left space-y-8" style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease-out' }}>
                <div>
                    <div
                      className="hero-eyebrow mb-4 flex items-center justify-start gap-2"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(10px)",
                        transition: "all 0.6s ease-out",
                      }}
                    >
                      <Zap className="h-4 w-4 text-indigo-400" />
                      <span>Closed Beta Program</span>
                    </div>

                    <h1
                      className="hero-headline mb-4 text-left text-4xl md:text-5xl font-bold"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(10px)",
                        transitionDelay: "0.1s",
                        transition: "all 0.6s ease-out",
                      }}
                    >
                      Join Sirius Beta
                    </h1>

                    <p
                      className="hero-subheadline mb-8 text-left text-lg leading-relaxed text-white/85 sm:text-xl max-w-xl"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(10px)",
                        transitionDelay: "0.2s",
                        transition: "all 0.6s ease-out",
                      }}
                    >
                      Be among the first to experience the Sirius AI Planning Engine.
                    </p>
                </div>

                {/* Features List */}
                <div
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(10px)",
                    transitionDelay: "0.3s",
                    transition: "all 0.6s ease-out",
                  }}
                >
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-300">
                    What You Get
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "PRD Generation",
                      "Database Design (ERD & C4)",
                      "Architecture Diagrams",
                      "User Stories & Features",
                      "Wireframes",
                      "Sequence Diagrams",
                      "Version Control",
                      "Priority Support",
                    ].map((feature) => (
                      <span
                        key={feature}
                        className="flex items-center gap-2 text-sm text-white/90"
                      >
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div 
                className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(15px)",
                  transitionDelay: "0.4s",
                  transition: "all 0.6s ease-out",
                }}
            >
                {/* Success Message */}
                <AnimatePresence>
                    {message && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-green-400 backdrop-blur-sm shadow-lg shadow-green-900/10"
                      >
                        <div className="flex items-center justify-center gap-2 font-medium">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>{message}</span>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>

                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2 ml-1">
                        Full Name
                      </label>
                      <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors">
                            <User className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="John Doe"
                            className={`w-full rounded-xl border bg-black/40 pl-10 pr-4 py-3.5 text-white placeholder-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                              errors.name
                                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-white/20"
                            }`}
                          />
                      </div>
                      <AnimatePresence>
                          {errors.name && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="flex items-center gap-2 text-sm text-red-400 overflow-hidden"
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{errors.name}</span>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2 ml-1">
                        Email Address
                      </label>
                      <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors">
                            <Mail className="h-5 w-5" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="you@example.com"
                            className={`w-full rounded-xl border bg-black/40 pl-10 pr-4 py-3.5 text-white placeholder-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                              errors.email
                                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-white/20"
                            }`}
                          />
                      </div>
                      <AnimatePresence>
                          {errors.email && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="flex items-center gap-2 text-sm text-red-400 overflow-hidden"
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{errors.email}</span>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      <Mail className="h-5 w-5 group-hover:animate-pulse" />
                      {processing ? "Submitting..." : "Join the Beta"}
                    </button>
                    
                     <p className="text-center text-xs text-white/30">
                        Limited spots available. No spam, ever.
                     </p>
                  </div>
                </form>
            </div>
          </div>
        </div>
            </section>
          </main>
          <Footer />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

export default BetaSignup;
