"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Mail, ArrowRight, User, LoaderCircle } from "lucide-react";
import { Link, Head } from "@inertiajs/react";
import { store as loginStore } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { store as registerStore } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { Form } from '@inertiajs/react';
import { Turnstile } from '@marsidev/react-turnstile';

interface AuthPageProps {
    initialMode: "login" | "register";
    status?: string;
    canResetPassword?: boolean;
}

function GoogleIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function LoginSignupPage({ initialMode, status, canResetPassword }: AuthPageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(initialMode === "login");
    const [passwordValue, setPasswordValue] = useState('');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
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

        window.addEventListener("resize", () => { setSize(); init(); });
        init();
        raf = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener("resize", () => { setSize(); init(); });
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section className="fixed inset-0 bg-zinc-950 text-zinc-50 overflow-y-auto">
            <Head title={isLogin ? "Log in" : "Create Account"} />
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
        .card-animate{opacity:0;transform:translateY(20px);animation:fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

            <div className="fixed inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

            <div className="accent-lines">
                <div className="hline" />
                <div className="hline" />
                <div className="hline" />
                <div className="vline" />
                <div className="vline" />
                <div className="vline" />
            </div>

            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none"
            />

            {/* Header */}
            <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 z-20">
                <a href="/">
                    <img src="/images/sirius-logo.png" alt="Sirius" className="h-8 w-auto" />
                </a>
                <Button
                    variant="outline"
                    className="h-9 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80"
                    asChild
                >
                    <Link href="/">
                        <span className="mr-2">Home</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </header>

            {/* Card */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4 pt-24 pb-12">
                <div className="card-animate w-full max-w-sm">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur shadow-2xl p-6 space-y-5">

                        {/* Title */}
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-zinc-50">
                                {isLogin ? "Welcome" : "Create an account"}
                            </h1>
                            <p className="text-sm text-zinc-400">
                                {isLogin ? "Log in or create an account" : "Enter your details below to create your account"}
                            </p>
                        </div>

                        {status && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm font-medium text-green-400">
                                {status}
                            </div>
                        )}

                        {/* Tab Switcher */}
                        <div className="flex rounded-lg bg-zinc-800/60 p-1 gap-1">
                            <button
                                type="button"
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
                                    isLogin
                                        ? "bg-zinc-700 text-zinc-50 shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-300"
                                }`}
                            >
                                Log In
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
                                    !isLogin
                                        ? "bg-zinc-700 text-zinc-50 shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-300"
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Login Form */}
                        {isLogin ? (
                            <Form {...loginStore.form()} resetOnSuccess={['password']} className="space-y-4">
                                {({ setData, processing, errors, hasErrors }) => (
                                    <>
                                        {hasErrors && (
                                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-red-400">
                                                {errors.email || errors.password || errors['cf-turnstile-response'] || 'Invalid credentials. Please try again.'}
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-zinc-300 text-sm">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    autoFocus
                                                    placeholder="you@example.com"
                                                    className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="password" className="text-zinc-300 text-sm">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-zinc-400 hover:text-zinc-200 focus:outline-none"
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
                                                <Label htmlFor="remember" className="text-zinc-400 text-sm cursor-pointer">
                                                    Remember me
                                                </Label>
                                            </div>
                                            {canResetPassword && (
                                                <Link href="/forgot-password" className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <div className="flex justify-center">
                                            <Turnstile
                                                siteKey={import.meta.env.VITE_TURNSTILE_SITEKEY || '0x4AAAAAACj9nwv1GucMvdLU'}
                                                onSuccess={(token) => setData("cf-turnstile-response", token)}
                                                options={{ theme: 'dark' }}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full h-11 rounded-xl bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-semibold text-sm"
                                        >
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Continue
                                        </Button>
                                    </>
                                )}
                            </Form>
                        ) : (
                            /* Register Form */
                            <Form {...registerStore.form()} resetOnSuccess={['password']} className="space-y-4">
                                {({ setData, processing, errors, hasErrors }) => (
                                    <>
                                        {hasErrors && (
                                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                                                <ul className="list-inside list-disc text-left space-y-0.5">
                                                    {errors.name && <li>{errors.name}</li>}
                                                    {errors.email && <li>{errors.email}</li>}
                                                    {errors.password && <li>{errors.password}</li>}
                                                    {errors['cf-turnstile-response'] && <li>{errors['cf-turnstile-response']}</li>}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <Label htmlFor="name" className="text-zinc-300 text-sm">Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    placeholder="Full name"
                                                    className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="reg-email" className="text-zinc-300 text-sm">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    id="reg-email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    placeholder="you@example.com"
                                                    className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="reg-password" className="text-zinc-300 text-sm">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    id="reg-password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    placeholder="••••••••"
                                                    value={passwordValue}
                                                    onChange={(e) => setPasswordValue(e.target.value)}
                                                    className="pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-zinc-400 hover:text-zinc-200 focus:outline-none"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {/* Auto-mirrors password value so Laravel's confirmed rule passes */}
                                            <input type="hidden" name="password_confirmation" value={passwordValue} />
                                        </div>

                                        <div className="flex justify-center">
                                            <Turnstile
                                                siteKey={import.meta.env.VITE_TURNSTILE_SITEKEY || '0x4AAAAAACj9nwv1GucMvdLU'}
                                                onSuccess={(token) => setData("cf-turnstile-response", token)}
                                                options={{ theme: 'dark' }}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full h-11 rounded-xl bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-semibold text-sm"
                                        >
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Create account
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}

                        {/* OR separator */}
                        <div className="relative">
                            <Separator className="bg-zinc-800" />
                            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-zinc-900/70 px-2 text-[11px] uppercase tracking-widest text-zinc-500">
                                or
                            </span>
                        </div>

                        {/* Google OAuth */}
                        <a
                            href="/auth/google"
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200/20 bg-white px-4 h-11 text-sm font-medium text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </a>

                        {/* Support link */}
                        <p className="text-center text-sm text-zinc-500">
                            Need help?{" "}
                            <a href="mailto:support@sirius.ai" className="font-semibold text-zinc-300 hover:text-zinc-100 transition-colors">
                                Contact support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
