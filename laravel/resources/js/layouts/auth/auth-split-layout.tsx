import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect, type PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

interface AuthSplitLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    visualVariant?: 'login' | 'register';
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthSplitLayoutProps>) {
    useFlashToasts();

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

        const onResize = () => {
            setSize();
            init();
        };

        window.addEventListener("resize", onResize);
        init();
        raf = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                
                <section className="fixed inset-0 bg-zinc-950 text-zinc-50 overflow-y-auto">
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

                        /* === Card minimal fade-up animation === */
                        .card-animate {
                        opacity: 0;
                        transform: translateY(20px);
                        animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
                        }
                        @keyframes fadeUp {
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                        }
                    `}</style>

                    {/* Subtle vignette */}
                    <div className="fixed inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

                    {/* Animated accent lines */}
                    <div className="accent-lines">
                        <div className="hline" />
                        <div className="hline" />
                        <div className="hline" />
                        <div className="vline" />
                        <div className="vline" />
                        <div className="vline" />
                    </div>

                    {/* Particles */}
                    <canvas
                        ref={canvasRef}
                        className="fixed inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none"
                    />

                    {/* Header */}
                    <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 z-20">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-xs tracking-[0.14em] uppercase text-zinc-400">
                            SIRIUS
                            </span>
                        </Link>
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

                    {/* Centered Login Card */}
                    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 pb-20 pt-24">
                        <div className="w-full max-w-sm space-y-8">
                            <Card className="card-animate border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 text-zinc-50">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-2xl text-zinc-50">{title}</CardTitle>
                                    <CardDescription className="text-zinc-400">
                                        {description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">{children}</CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
