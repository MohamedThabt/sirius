import { useState } from "react";
import { CheckCircle2, Mail, Zap, User, AlertCircle, Check } from "lucide-react";
import { Head, useForm } from "@inertiajs/react";
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { Footer } from '@/components/footer';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Turnstile } from '@marsidev/react-turnstile';

interface BetaSignupProps {
  message?: string;
}

const queryClient = new QueryClient();

const BetaSignup = ({ message }: BetaSignupProps) => {
  
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    "cf-turnstile-response": "",
  });

  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string, turnstile?: string }>({});
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
    let turnstileError = undefined;

    if (!data["cf-turnstile-response"]) {
        turnstileError = "Please complete the captcha verification";
    }
    
    setValidationErrors({ name: nameError, email: emailError, turnstile: turnstileError });
    setTouched({ name: true, email: true });
    
    return !nameError && !emailError && !turnstileError;
  };

  const handleFieldChange = (field: 'name' | 'email', value: string) => {
    setData(field, value);
    
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
        setData({ name: "", email: "", "cf-turnstile-response": "" });
        setValidationErrors({});
        setTouched({});
      },
    });
  };

  const nameError = validationErrors.name || errors.name;
  const emailError = validationErrors.email || errors.email;
  const turnstileError = validationErrors.turnstile || errors["cf-turnstile-response"];

  const features = [
    "PRD Generation",
    "Database Design (ERD & C4)",
    "Architecture Diagrams",
    "User Stories & Features",
    "Wireframes",
    "Sequence Diagrams",
    "Version Control",
    "Priority Support",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Head title="Join Sirius Beta" />
          <SiriusNavbar />
          
          <main>
            <section className="sirius-section relative min-h-screen overflow-hidden flex items-center">
              {/* Grid Pattern Background */}
              <GridPattern
                width={40}
                height={40}
                x={-1}
                y={-1}
                className="absolute inset-0 h-full w-full fill-primary/[0.02] stroke-border/40 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
                squares={[
                  [2, 3], [5, 1], [8, 4], [12, 2], [15, 5],
                  [3, 8], [7, 6], [10, 9], [14, 7], [18, 3],
                  [1, 12], [6, 10], [11, 13], [16, 11], [20, 8],
                ]}
              />

              {/* Subtle radial accent */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl z-0" />

              <div className="sirius-container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  
                  {/* Left Column: Content */}
                  <motion.div 
                    className="flex flex-col text-center lg:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="mb-6 flex justify-center lg:justify-start"
                    >
                      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-foreground shadow-sm">
                        <Zap className="w-4 h-4 text-primary" />
                        Closed Beta Program
                      </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.7 }}
                      className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
                    >
                      <span className="text-foreground">Join the</span>
                      <br />
                      <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Sirius Beta
                      </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.7 }}
                      className="text-lg lg:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0"
                    >
                      Be among the first to experience the Sirius AI Planning Engine. Transform your project briefs into build-ready documentation.
                    </motion.p>

                    {/* Features Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45, duration: 0.7 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Right Column: Form */}
                  <motion.div 
                    className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    {/* Success Message */}
                    <AnimatePresence>
                      {message && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center text-green-500 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-center gap-2 font-medium">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>{message}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Card className="p-8 bg-card/80 backdrop-blur-sm border-border shadow-xl">
                      <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-foreground mb-2">
                          Request Early Access
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Limited spots available. Join the waitlist today.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                              className={`w-full rounded-lg border bg-background pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                nameError
                                  ? "border-destructive focus:border-destructive"
                                  : "border-border focus:border-primary hover:border-primary/50"
                              }`}
                            />
                          </div>
                          <AnimatePresence>
                            {nameError && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-sm text-destructive mt-2 overflow-hidden"
                              >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{nameError}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Email Field */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                              className={`w-full rounded-lg border bg-background pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                emailError
                                  ? "border-destructive focus:border-destructive"
                                  : "border-border focus:border-primary hover:border-primary/50"
                              }`}
                            />
                          </div>
                          <AnimatePresence>
                            {emailError && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-sm text-destructive mt-2 overflow-hidden"
                              >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{emailError}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Turnstile Captcha */}
                        <div className="flex justify-center my-4">
                            <Turnstile 
                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACj9nwv1GucMvdLU'} 
                                onSuccess={(token) => {
                                    setData("cf-turnstile-response", token);
                                    if (validationErrors.turnstile) {
                                      setValidationErrors(prev => ({ ...prev, turnstile: undefined }));
                                    }
                                }}
                                options={{
                                    theme: 'auto',
                                }}
                            />
                        </div>
                         <AnimatePresence>
                            {turnstileError && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-sm text-destructive mt-2 overflow-hidden justify-center"
                              >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{turnstileError}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={processing}
                          variant="sirius"
                          size="lg"
                          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                        >
                          <Mail className="h-5 w-5 mr-2" />
                          {processing ? "Submitting..." : "Join the Beta"}
                        </Button>
                        
                        <p className="text-center text-xs text-muted-foreground">
                          No spam, ever. We respect your privacy.
                        </p>
                      </form>
                    </Card>
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
