import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Zap } from "lucide-react";
import { Head, useForm } from "@inertiajs/react";

interface BetaSignupProps {
  message?: string;
}

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
    <>
      <Head title="Join Sirius Beta" />
      <section className="sirius-hero relative overflow-hidden min-h-screen">
        <div className="hero-gradient" aria-hidden="true" />
        <div className="hero-stars hero-stars--one" aria-hidden="true" />
        <div className="hero-stars hero-stars--two" aria-hidden="true" />
        <div className="hero-stars hero-stars--three" aria-hidden="true" />
        <div className="hero-nebula hero-nebula--left" aria-hidden="true" />
        <div className="hero-nebula hero-nebula--right" aria-hidden="true" />

        <div className="hero-inner mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center min-h-screen">
          <div className="hero-copy w-full" style={{ opacity: isVisible ? 1 : 0 }}>
            {/* Eyebrow with icon */}
            <div
              className="hero-eyebrow mb-6 flex items-center justify-center gap-2"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20%)",
                transition: "all 0.6s ease-out",
              }}
            >
              <Zap className="h-4 w-4 text-indigo-400" />
              <span>Closed Beta Program</span>
            </div>

            {/* Main Headline */}
            <h1
              className="hero-headline mb-6 text-center text-4xl md:text-5xl font-bold"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: "0.1s",
                transition: "all 0.6s ease-out",
              }}
            >
              Join Sirius Beta
            </h1>

            {/* Subheadline */}
            <p
              className="hero-subheadline mx-auto mb-8 text-balance text-center text-lg leading-relaxed text-white/85 sm:text-xl max-w-2xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(16px)",
                transitionDelay: "0.2s",
                transition: "all 0.6s ease-out",
              }}
            >
              Be among the first to experience the Sirius AI Planning Engine. Submit your details below to join our exclusive beta program.
            </p>

            {/* Success Message */}
            {message && (
              <div
                className="mx-auto mb-8 max-w-2xl rounded-2xl border border-green-400/30 bg-green-500/10 p-4 text-center text-green-300"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(16px)",
                  transitionDelay: "0.3s",
                  transition: "all 0.6s ease-out",
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{message}</span>
                </div>
              </div>
            )}

            {/* Signup Form */}
            <form
              onSubmit={handleSubmit}
              className="mx-auto mb-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(12px)",
                transitionDelay: "0.3s",
                transition: "all 0.6s ease-out",
              }}
            >
              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="John Doe"
                    className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-red-400/50 focus:ring-red-400/40"
                        : "border-white/20 focus:border-indigo-400/50 focus:ring-indigo-400/40"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-400/50 focus:ring-red-400/40"
                        : "border-white/20 focus:border-indigo-400/50 focus:ring-indigo-400/40"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {processing ? "Submitting..." : "Join the Beta"}
                </button>
              </div>
            </form>

            {/* Features List */}
            <div
              className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(12px)",
                transitionDelay: "0.45s",
                transition: "all 0.6s ease-out",
              }}
            >
              <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-indigo-300">
                As a Beta Member, You Get Access To
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {/* Footer Note */}
            <div
              className="mt-8 text-center text-sm text-white/60"
              style={{
                opacity: isVisible ? 1 : 0,
                transitionDelay: "0.55s",
                transition: "opacity 0.6s ease-out",
              }}
            >
              <p>
                💡 This is an exclusive closed beta. Selected users will be notified when their account is ready.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BetaSignup;
