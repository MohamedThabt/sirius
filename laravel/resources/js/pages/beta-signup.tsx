import { useState } from "react";
import { CheckCircle2, Mail, Zap, User, AlertCircle } from "lucide-react";
import { Head, useForm } from "@inertiajs/react";
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { useForceTheme } from '@/hooks/use-force-theme';
import './landing.css';

interface BetaSignupProps {
  message?: string;
}

const queryClient = new QueryClient();

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.6, ease: "easeOut" }
  })
};

const BetaSignup = ({ message }: BetaSignupProps) => {
  useForceTheme('dark');
  
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
  });

  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});

  const validateField = (field: 'name' | 'email', value: string): string | undefined => {
    if (field === 'name') {
      if (!value.trim()) {
        return 'Name is required';
      }
      if (value.trim().length < 2) {
        return 'Name must be at least 2 characters';
      }
    }
    
    if (field === 'email') {
      if (!value.trim()) {
        return 'Email is required';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const nameError = validateField('name', data.name);
    const emailError = validateField('email', data.email);
    
    setValidationErrors({ name: nameError, email: emailError });
    setTouched({ name: true, email: true });
    
    return !nameError && !emailError;
  };

  const handleFieldChange = (field: 'name' | 'email', value: string) => {
    setData(field, value);
    
    // Clear validation error when user starts typing (if field was touched)
    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: 'name' | 'email') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, data[field]);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    post("/beta/signup", {
      onSuccess: () => {
        setData({ name: "", email: "" });
        setValidationErrors({});
        setTouched({});
      },
    });
  };

  // Combined errors: show validation errors first, then server errors
  const nameError = validationErrors.name || errors.name;
  const emailError = validationErrors.email || errors.email;

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
            <motion.div 
              className="flex flex-col text-left space-y-8"
              initial="hidden"
              animate="visible"
            >
                <div>
                    <motion.div
                      className="hero-eyebrow mb-4 flex items-center justify-start gap-2"
                      variants={fadeInUp}
                      custom={0}
                    >
                      <Zap className="h-5 w-5 text-indigo-400" />
                      <span>Closed Beta Program</span>
                    </motion.div>

                    <motion.h1
                      className="hero-headline mb-4 text-left text-4xl md:text-5xl font-bold"
                      variants={fadeInUp}
                      custom={1}
                    >
                      Join Sirius Beta
                    </motion.h1>

                    <motion.p
                      className="hero-subheadline mb-8 text-left text-lg leading-relaxed text-white/85 sm:text-xl max-w-xl"
                      variants={fadeInUp}
                      custom={2}
                    >
                      Be among the first to experience the Sirius AI Planning Engine.
                    </motion.p>
                </div>

                {/* Features List */}
                <motion.div
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                  variants={fadeInUp}
                  custom={3}
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
                        <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div 
                className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
                variants={fadeInUp}
                custom={4}
                initial="hidden"
                animate="visible"
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
                            onChange={(e) => handleFieldChange("name", e.target.value)}
                            onBlur={() => handleBlur("name")}
                            placeholder="John Doe"
                            className={`w-full rounded-xl border bg-black/40 pl-10 pr-4 py-3.5 text-white placeholder-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                              nameError
                                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-white/20"
                            }`}
                          />
                      </div>
                      <AnimatePresence>
                          {nameError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="flex items-center gap-2 text-sm text-red-400 overflow-hidden"
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{nameError}</span>
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
                            onChange={(e) => handleFieldChange("email", e.target.value)}
                            onBlur={() => handleBlur("email")}
                            placeholder="you@example.com"
                            className={`w-full rounded-xl border bg-black/40 pl-10 pr-4 py-3.5 text-white placeholder-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                              emailError
                                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-white/20"
                            }`}
                          />
                      </div>
                      <AnimatePresence>
                          {emailError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="flex items-center gap-2 text-sm text-red-400 overflow-hidden"
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{emailError}</span>
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
            </motion.div>
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
