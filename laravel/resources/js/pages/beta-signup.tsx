import { Footer } from '@/components/footer';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Head, useForm } from '@inertiajs/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, CheckCircle2, Mail, User, Zap } from 'lucide-react';
import { useState } from 'react';

interface BetaSignupProps {
    message?: string;
}

const queryClient = new QueryClient();

const BetaSignup = ({ message }: BetaSignupProps) => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        'cf-turnstile-response': '',
    });

    const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; turnstile?: string }>({});
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

        if (!data['cf-turnstile-response']) {
            turnstileError = 'Please complete the captcha verification';
        }

        setValidationErrors({ name: nameError, email: emailError, turnstile: turnstileError });
        setTouched({ name: true, email: true });

        return !nameError && !emailError && !turnstileError;
    };

    const handleFieldChange = (field: 'name' | 'email', value: string) => {
        setData(field, value);

        if (touched[field]) {
            const error = validateField(field, value);
            setValidationErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const handleBlur = (field: 'name' | 'email') => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const error = validateField(field, data[field]);
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        post('/beta/signup', {
            onSuccess: () => {
                setData({ name: '', email: '', 'cf-turnstile-response': '' });
                setValidationErrors({});
                setTouched({});
            },
        });
    };

    const nameError = validationErrors.name || errors.name;
    const emailError = validationErrors.email || errors.email;
    const turnstileError = validationErrors.turnstile || errors['cf-turnstile-response'];

    const features = [
        'PRD Generation',
        'Database Design (ERD & C4)',
        'Architecture Diagrams',
        'User Stories & Features',
        'Wireframes',
        'Sequence Diagrams',
        'Version Control',
        'Priority Support',
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
                        <section className="sirius-section relative flex min-h-screen items-center overflow-hidden">
                            {/* Grid Pattern Background */}
                            <GridPattern
                                width={40}
                                height={40}
                                x={-1}
                                y={-1}
                                className="absolute inset-0 h-full w-full [mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-primary/[0.02] stroke-border/40"
                                squares={[
                                    [2, 3],
                                    [5, 1],
                                    [8, 4],
                                    [12, 2],
                                    [15, 5],
                                    [3, 8],
                                    [7, 6],
                                    [10, 9],
                                    [14, 7],
                                    [18, 3],
                                    [1, 12],
                                    [6, 10],
                                    [11, 13],
                                    [16, 11],
                                    [20, 8],
                                ]}
                            />

                            {/* Subtle radial accent */}
                            <div className="absolute top-1/3 left-1/2 z-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-3xl" />

                            <div className="sirius-container relative z-10">
                                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
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
                                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm">
                                                <Zap className="h-4 w-4 text-primary" />
                                                Closed Beta Program
                                            </span>
                                        </motion.div>

                                        {/* Headline */}
                                        <motion.h1
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15, duration: 0.7 }}
                                            className="mb-6 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl"
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
                                            className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 lg:text-xl"
                                        >
                                            Be among the first to experience the Sirius AI Planning Engine. Transform your project briefs into
                                            build-ready documentation.
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
                                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                        <Check className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </motion.div>

                                    {/* Right Column: Form */}
                                    <motion.div
                                        className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto"
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

                                        <Card className="border-border bg-card/80 p-8 shadow-xl backdrop-blur-sm">
                                            <div className="mb-6">
                                                <h2 className="mb-2 text-2xl font-semibold text-foreground">Request Early Access</h2>
                                                <p className="text-sm text-muted-foreground">Limited spots available. Join the waitlist today.</p>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                {/* Name Field */}
                                                <div>
                                                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                                                        Full Name
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            value={data.name}
                                                            onChange={(e) => handleFieldChange('name', e.target.value)}
                                                            onBlur={() => handleBlur('name')}
                                                            placeholder="John Doe"
                                                            className={`w-full rounded-lg border bg-background py-3 pr-4 pl-10 text-foreground placeholder-muted-foreground/50 transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none ${
                                                                nameError
                                                                    ? 'border-destructive focus:border-destructive'
                                                                    : 'border-border hover:border-primary/50 focus:border-primary'
                                                            }`}
                                                        />
                                                    </div>
                                                    <AnimatePresence>
                                                        {nameError && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-2 flex items-center gap-2 overflow-hidden text-sm text-destructive"
                                                            >
                                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                                <span>{nameError}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Email Field */}
                                                <div>
                                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                                        Email Address
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                                            <Mail className="h-5 w-5" />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            value={data.email}
                                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                                            onBlur={() => handleBlur('email')}
                                                            placeholder="you@example.com"
                                                            className={`w-full rounded-lg border bg-background py-3 pr-4 pl-10 text-foreground placeholder-muted-foreground/50 transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none ${
                                                                emailError
                                                                    ? 'border-destructive focus:border-destructive'
                                                                    : 'border-border hover:border-primary/50 focus:border-primary'
                                                            }`}
                                                        />
                                                    </div>
                                                    <AnimatePresence>
                                                        {emailError && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-2 flex items-center gap-2 overflow-hidden text-sm text-destructive"
                                                            >
                                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                                <span>{emailError}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Turnstile Captcha */}
                                                <div className="my-4 flex justify-center">
                                                    <Turnstile
                                                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACj9nwv1GucMvdLU'}
                                                        onSuccess={(token) => {
                                                            setData('cf-turnstile-response', token);
                                                            if (validationErrors.turnstile) {
                                                                setValidationErrors((prev) => ({ ...prev, turnstile: undefined }));
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
                                                            className="mt-2 flex items-center justify-center gap-2 overflow-hidden text-sm text-destructive"
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
                                                    className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/20"
                                                >
                                                    <Mail className="mr-2 h-5 w-5" />
                                                    {processing ? 'Submitting...' : 'Join the Beta'}
                                                </Button>

                                                <p className="text-center text-xs text-muted-foreground">No spam, ever. We respect your privacy.</p>
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
