'use client';

import { BentoPricing } from '@/components/bento-pricing';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function PricingSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimateBackground = isHydrated && !isMobile && !prefersReducedMotion;

    const getParticleColor = useCallback(() => {
        const el = sectionRef.current;
        if (!el) return '150,150,150';
        const raw = getComputedStyle(el).getPropertyValue('--muted-foreground').trim();
        const temp = document.createElement('div');
        temp.style.color = raw;
        document.body.appendChild(temp);
        const computed = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        const match = computed.match(/(\d+),\s*(\d+),\s*(\d+)/);
        return match ? `${match[1]},${match[2]},${match[3]}` : '150,150,150';
    }, []);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!shouldAnimateBackground) return;

        const canvas = canvasRef.current;
        const section = sectionRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !section) return;

        let raf = 0;
        let inView = false;
        let observer: IntersectionObserver | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let lastFrameTime = 0;
        const targetFrameMs = 1000 / 40;

        const setSize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        setSize();

        const particleRgb = getParticleColor();

        type P = { x: number; y: number; v: number; o: number };
        let ps: P[] = [];

        const make = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            v: Math.random() * 0.25 + 0.05,
            o: Math.random() * 0.35 + 0.15,
        });

        const init = () => {
            ps = [];
            const count = Math.floor((canvas.width * canvas.height) / 12000);
            for (let i = 0; i < count; i++) ps.push(make());
        };

        const renderParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ps.forEach((p) => {
                p.y -= p.v;
                if (p.y < 0) {
                    p.x = Math.random() * canvas.width;
                    p.y = canvas.height + Math.random() * 40;
                    p.v = Math.random() * 0.25 + 0.05;
                    p.o = Math.random() * 0.35 + 0.15;
                }
                ctx.fillStyle = `rgba(${particleRgb},${p.o})`;
                ctx.fillRect(p.x, p.y, 0.7, 2.2);
            });
        };

        const stopAnimation = () => {
            if (!raf) return;
            cancelAnimationFrame(raf);
            raf = 0;
        };

        const draw = (time: number) => {
            if (!inView || document.hidden) {
                stopAnimation();
                return;
            }

            if (lastFrameTime && time - lastFrameTime < targetFrameMs) {
                raf = requestAnimationFrame(draw);
                return;
            }

            lastFrameTime = time;
            renderParticles();
            raf = requestAnimationFrame(draw);
        };

        const startAnimation = () => {
            if (raf || !inView || document.hidden) return;
            lastFrameTime = 0;
            raf = requestAnimationFrame(draw);
        };

        resizeObserver = new ResizeObserver(() => {
            setSize();
            init();
            if (inView) renderParticles();
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        init();
        renderParticles();

        observer = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting;
                if (inView) {
                    startAnimation();
                } else {
                    stopAnimation();
                }
            },
            { rootMargin: '200px' },
        );
        observer.observe(section);

        const onVisibilityChange = () => {
            if (document.hidden) {
                stopAnimation();
            } else {
                startAnimation();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            if (observer) observer.disconnect();
            if (resizeObserver) resizeObserver.disconnect();
            stopAnimation();
        };
    }, [shouldAnimateBackground, getParticleColor]);

    return (
        <section ref={sectionRef} className="relative w-full overflow-hidden bg-background py-24 text-foreground">
            <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:var(--border);will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in srgb, var(--muted-foreground) 24%, transparent),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
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
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_30%,rgba(0,0,0,0.02),transparent_60%)] dark:[background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

            {/* Animated accent lines */}
            {shouldAnimateBackground && (
                <div className="accent-lines">
                    <div className="hline" />
                    <div className="hline" />
                    <div className="hline" />
                    <div className="vline" />
                    <div className="vline" />
                    <div className="vline" />
                </div>
            )}

            {/* Particles */}
            {shouldAnimateBackground && (
                <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-50 mix-blend-screen" />
            )}

            {/* Dotted Background */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 size-full bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03] mix-blend-overlay"
                    />
                </div>
            </div>

            <div className="relative z-10 w-full px-4 md:px-6">
                <div className="mb-16 space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Simple, transparent pricing</h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Choose the perfect plan for your team's needs.</p>
                </div>

                <BentoPricing />
            </div>
        </section>
    );
}
