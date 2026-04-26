'use client';

import { store as loginStore } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { store as registerStore } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { parseAuthEmail, parseRegisterPassword } from '@/lib/validations/auth';
import { Form, Head, Link } from '@inertiajs/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, Lock, Mail, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AuthPageProps {
    initialMode: 'login' | 'register';
    status?: string;
    canResetPassword?: boolean;
}

function GoogleIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

function PasswordRequirementHints({ password }: { password: string }) {
    const items = [
        { met: password.length >= 12, text: '12+ chars' },
        { met: /[a-z]/.test(password), text: 'a–z' },
        { met: /[A-Z]/.test(password), text: 'A–Z' },
        { met: /[0-9]/.test(password), text: '0–9' },
        { met: /[^A-Za-z0-9]/.test(password), text: '!@#' },
    ];
    return (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
            {items.map((row) => (
                <span
                    key={row.text}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 transition-all duration-200 ${
                        row.met
                            ? 'bg-emerald-500/12 text-emerald-400 ring-emerald-500/25'
                            : 'bg-zinc-800/50 text-zinc-600 ring-zinc-700/40'
                    }`}
                >
                    <span
                        className={`flex h-2.5 w-2.5 items-center justify-center rounded-full transition-colors ${
                            row.met ? 'bg-emerald-500/30' : ''
                        }`}
                    >
                        {row.met && <Check className="h-1.5 w-1.5" strokeWidth={3.5} />}
                    </span>
                    {row.text}
                </span>
            ))}
        </div>
    );
}

export default function LoginSignupPage({ initialMode, status, canResetPassword }: AuthPageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [passwordValue, setPasswordValue] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [loginClientError, setLoginClientError] = useState<string | null>(null);
    const [registerClientEmailError, setRegisterClientEmailError] = useState<string | null>(null);
    const [registerClientPasswordError, setRegisterClientPasswordError] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState('');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setSize();

        type P = { x: number; y: number; v: number; o: number };
        let ps: P[] = [];
        let raf = 0;

        const make = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            v: Math.random() * 0.25 + 0.05,
            o: Math.random() * 0.35 + 0.15,
        });

        const init = () => {
            ps = [];
            const count = Math.floor((canvas.width * canvas.height) / 9000);
            for (let i = 0; i < count; i++) ps.push(make());
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ps.forEach((p) => {
                p.y -= p.v;
                if (p.y < 0) {
                    p.x = Math.random() * canvas.width;
                    p.y = canvas.height + Math.random() * 40;
                    p.v = Math.random() * 0.25 + 0.05;
                    p.o = Math.random() * 0.35 + 0.15;
                }
                ctx.fillStyle = `rgba(250,250,250,${p.o})`;
                ctx.fillRect(p.x, p.y, 0.7, 2.2);
            });
            raf = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', () => {
            setSize();
            init();
        });
        init();
        raf = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener('resize', () => {
                setSize();
                init();
            });
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section className="fixed inset-0 overflow-y-auto bg-zinc-950 text-zinc-50">
            <Head title={isLogin ? 'Log in' : 'Create Account'} />
            <style>{`
        .accent-lines{position:fixed;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:#27272a;will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,250,250,.24),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
        .hline:nth-child(1)::after{animation-delay:.12s}
        .hline:nth-child(2)::after{animation-delay:.22s}
        .hline:nth-child(3)::after{animation-delay:.32s}
        .vline:nth-child(4)::after{animation-delay:.42s}
        .vline:nth-child(5)::after{animation-delay:.54s}
        .vline:nth-child(6)::after{animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        @keyframes shimmer{0%{opacity:0}35%{opacity:.25}100%{opacity:0}}
        .card-animate{opacity:0;transform:translateY(16px);animation:fadeUp 0.7s cubic-bezier(.22,.61,.36,1) 0.25s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

            <div className="pointer-events-none fixed inset-0 [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

            <div className="accent-lines">
                <div className="hline" />
                <div className="hline" />
                <div className="hline" />
                <div className="vline" />
                <div className="vline" />
                <div className="vline" />
            </div>

            <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full opacity-50 mix-blend-screen" />

            {/* Header */}
            <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between border-b border-zinc-800/80 px-6 py-3">
                <a href="/">
                    <img src="/images/sirius-logo.png" alt="Sirius" className="h-7 w-auto" />
                </a>
                <Button variant="outline" className="h-8 rounded-lg border-zinc-800 bg-zinc-900 text-xs text-zinc-50 hover:bg-zinc-900/80" asChild>
                    <Link href="/">
                        <span className="mr-1.5">Home</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </header>

            {/* Card */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-14">
                <div className="card-animate w-full max-w-[360px]">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur">
                        {/* Title */}
                        <div className="mb-4 space-y-0.5">
                            <h1 className="text-xl font-bold text-zinc-50">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
                            <p className="text-xs text-zinc-500">
                                {isLogin ? 'Sign in to continue' : 'Fill in your details to get started'}
                            </p>
                        </div>

                        {status && (
                            <div className="mb-3 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-center text-xs font-medium text-green-400">
                                {status}
                            </div>
                        )}

                        {/* Tab Switcher */}
                        <div className="flex gap-1 rounded-lg bg-zinc-800/60 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(true);
                                    setLoginClientError(null);
                                    setRegisterClientEmailError(null);
                                    setRegisterClientPasswordError(null);
                                }}
                                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-200 ${
                                    isLogin ? 'bg-zinc-700 text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                            >
                                Log In
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(false);
                                    setLoginClientError(null);
                                    setRegisterClientEmailError(null);
                                    setRegisterClientPasswordError(null);
                                }}
                                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-200 ${
                                    !isLogin ? 'bg-zinc-700 text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Login Form */}
                        {isLogin ? (
                            <Form
                                {...loginStore.form()}
                                resetOnSuccess={['password']}
                                className="mt-4 space-y-3"
                                noValidate
                                onSubmit={(e) => {
                                    const parsed = parseAuthEmail(loginEmail);
                                    if (!parsed.ok) {
                                        e.preventDefault();
                                        setLoginClientError(parsed.message);
                                    } else {
                                        setLoginClientError(null);
                                    }
                                }}
                            >
                                {({ processing, errors, hasErrors }) => (
                                    <>
                                        {hasErrors && (
                                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs font-medium text-red-400">
                                                {errors.email ||
                                                    errors.password ||
                                                    errors['cf-turnstile-response'] ||
                                                    'Invalid credentials. Please try again.'}
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <Label htmlFor="email" className="text-xs text-zinc-400">
                                                Email
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    autoFocus
                                                    value={loginEmail}
                                                    onChange={(ev) => {
                                                        setLoginEmail(ev.target.value);
                                                        setLoginClientError(null);
                                                    }}
                                                    placeholder="you@example.com"
                                                    className="rounded-lg border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
                                                />
                                            </div>
                                            {loginClientError && (
                                                <p className="text-xs text-red-400">{loginClientError}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="password" className="text-xs text-zinc-400">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    placeholder="••••••••"
                                                    className="rounded-lg border-zinc-800 bg-zinc-950 pr-10 pl-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 text-zinc-400 hover:text-zinc-200 focus:outline-none"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    className="border-zinc-700 data-[state=checked]:bg-zinc-50 data-[state=checked]:text-zinc-900"
                                                />
                                                <Label htmlFor="remember" className="cursor-pointer text-sm text-zinc-400">
                                                    Remember me
                                                </Label>
                                            </div>
                                            {canResetPassword && (
                                                <Link href="/forgot-password" className="text-sm text-zinc-300 transition-colors hover:text-zinc-100">
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <div className="flex justify-center overflow-hidden">
                                            <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
                                            <Turnstile
                                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITEKEY || '0x4AAAAAACj9nwv1GucMvdLU'}
                                                onSuccess={(token) => setTurnstileToken(token)}
                                                options={{ theme: 'auto' }}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-10 w-full rounded-xl bg-zinc-50 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
                                        >
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Continue
                                        </Button>
                                    </>
                                )}
                            </Form>
                        ) : (
                            /* Register Form */
                            <Form
                                {...registerStore.form()}
                                resetOnSuccess={['password', 'name', 'email']}
                                className="mt-4 space-y-3"
                                noValidate
                                onSubmit={(e) => {
                                    const emailParsed = parseAuthEmail(registerEmail);
                                    if (!emailParsed.ok) {
                                        e.preventDefault();
                                        setRegisterClientEmailError(emailParsed.message);
                                        setRegisterClientPasswordError(null);
                                        return;
                                    }
                                    setRegisterClientEmailError(null);
                                    const passParsed = parseRegisterPassword(passwordValue);
                                    if (!passParsed.ok) {
                                        e.preventDefault();
                                        setRegisterClientPasswordError(passParsed.message);
                                        return;
                                    }
                                    setRegisterClientPasswordError(null);
                                }}
                            >
                                {({ processing, errors, hasErrors }) => (
                                    <>
                                        {hasErrors && (
                                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400">
                                                <ul className="list-inside list-disc space-y-0.5 text-left">
                                                    {errors.name && <li>{errors.name}</li>}
                                                    {errors.email && <li>{errors.email}</li>}
                                                    {errors.password && <li>{errors.password}</li>}
                                                    {errors['cf-turnstile-response'] && <li>{errors['cf-turnstile-response']}</li>}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <Label htmlFor="name" className="text-xs text-zinc-400">
                                                Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    placeholder="Full name"
                                                    className="rounded-lg border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="reg-email" className="text-xs text-zinc-400">
                                                Email
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                                <Input
                                                    id="reg-email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    value={registerEmail}
                                                    onChange={(ev) => {
                                                        setRegisterEmail(ev.target.value);
                                                        setRegisterClientEmailError(null);
                                                    }}
                                                    placeholder="you@example.com"
                                                    className="rounded-lg border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
                                                />
                                            </div>
                                            {(errors.email || registerClientEmailError) && (
                                                <p className="text-xs text-red-400">{errors.email || registerClientEmailError}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="reg-password" className="text-xs text-zinc-400">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                                <Input
                                                    id="reg-password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    value={passwordValue}
                                                    onChange={(e) => {
                                                        setPasswordValue(e.target.value);
                                                        setRegisterClientPasswordError(null);
                                                    }}
                                                    className="rounded-lg border-zinc-800 bg-zinc-950 pr-10 pl-10 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 text-zinc-400 hover:text-zinc-200 focus:outline-none"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-zinc-600">
                                                12+ chars · upper &amp; lower case · number · symbol
                                            </p>
                                            <PasswordRequirementHints password={passwordValue} />
                                            {(errors.password || registerClientPasswordError) && (
                                                <p className="text-xs text-red-400">
                                                    {errors.password || registerClientPasswordError}
                                                </p>
                                            )}
                                            <input type="hidden" name="password_confirmation" value={passwordValue} />
                                        </div>

                                        <div className="flex justify-center overflow-hidden">
                                            <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
                                            <Turnstile
                                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITEKEY || '0x4AAAAAACj9nwv1GucMvdLU'}
                                                onSuccess={(token) => setTurnstileToken(token)}
                                                options={{ theme: 'auto' }}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-10 w-full rounded-xl bg-zinc-50 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
                                        >
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Create account
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}

                        {/* OR separator */}
                        <div className="relative mt-4">
                            <Separator className="bg-zinc-800" />
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900/70 px-2 text-[10px] tracking-widest text-zinc-600 uppercase">
                                or
                            </span>
                        </div>

                        {/* Google OAuth */}
                        <a
                            href={isLogin ? '/auth/google/login' : '/auth/google/register'}
                            className="mt-4 flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-zinc-700/50 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:outline-none"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </a>

                        {/* Support link */}
                        <p className="mt-3 text-center text-xs text-zinc-600">
                            Need help?{' '}
                            <a href="mailto:mohamedthabetthabet36@gmail.com" className="font-semibold text-zinc-400 transition-colors hover:text-zinc-200">
                                Contact support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
