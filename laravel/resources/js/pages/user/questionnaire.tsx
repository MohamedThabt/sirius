'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, SkipForward } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const QUESTIONS = [
    {
        id: 'role',
        question: 'What best describes you?',
        type: 'radio' as const,
        options: [
            'Student working on projects',
            'Freelancer (working with clients)',
            'Startup founder',
            'Working in a company',
            'Other',
        ],
    },
    {
        id: 'project_type',
        question: 'What kind of projects do you usually work on?',
        type: 'radio' as const,
        options: [
            'Frontend / UI projects (web interfaces, user experiences)',
            'Backend systems (APIs, databases, system logic)',
            'Full-stack applications (end-to-end web apps)',
            'Mobile applications (iOS / Android / Flutter)',
            'Data / AI projects (ML models, data pipelines, analytics)',
            'Product planning (PRDs, feature design, specs)',
            'Other',
        ],
    },
    {
        id: 'signup_reason',
        question: 'What made you sign up today?',
        type: 'radio' as const,
        options: [
            "I have an idea but don't know how to start",
            'I waste too much time on planning',
            'I want better technical docs',
            'Just exploring',
        ],
    },
    {
        id: 'linkedin',
        question: 'Add your LinkedIn account',
        type: 'text' as const,
        placeholder: 'https://linkedin.com/in/your-username',
    },
] as const;

export default function Questionnaire() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

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

        const make = (): P => ({
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

        const onResize = () => { setSize(); init(); };
        window.addEventListener('resize', onResize);
        init();
        raf = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(raf);
        };
    }, []);

    const setAnswer = (id: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        const questionnaire = QUESTIONS.filter((q) => {
            const val = answers[q.id] ?? '';
            return val.trim() !== '';
        }).map((q) => ({
            question: q.question,
            answer: answers[q.id],
        }));

        setSubmitting(true);
        router.post(
            '/user/questionnaire',
            { questionnaire },
            { onFinish: () => setSubmitting(false) },
        );
    };

    const handleSkip = () => {
        router.visit('/projects');
    };

    return (
        <section className="fixed inset-0 overflow-y-auto bg-zinc-950 text-zinc-50">
            <Head title="Almost there — tell us about yourself" />
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
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        .card-animate{opacity:0;transform:translateY(20px);animation:fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.3s forwards}
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
            <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
                <a href="/">
                    <img src="/images/sirius-logo.png" alt="Sirius" className="h-8 w-auto" />
                </a>
                <button
                    type="button"
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                >
                    <SkipForward className="h-4 w-4" />
                    Skip for now
                </button>
            </header>

            {/* Content */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-start p-4 pt-24 pb-16">
                <div className="card-animate w-full max-w-xl">
                    {/* Intro */}
                    <div className="mb-8 space-y-1 text-center">
                        <h1 className="text-3xl font-bold text-zinc-50">Help us personalise your experience</h1>
                        <p className="text-sm text-zinc-400">All questions are optional — answer what feels right and skip the rest.</p>
                    </div>

                    <div className="space-y-6">
                        {QUESTIONS.map((q) => (
                            <div
                                key={q.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl backdrop-blur"
                            >
                                <p className="mb-4 text-base font-semibold text-zinc-100">{q.question}</p>

                                {q.type === 'radio' && (
                                    <div className="space-y-2">
                                        {q.options.map((option) => {
                                            const selected = answers[q.id] === option;
                                            return (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() =>
                                                        setAnswer(q.id, selected ? '' : option)
                                                    }
                                                    className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-all duration-150 ${
                                                        selected
                                                            ? 'border-zinc-400 bg-zinc-700 text-zinc-50'
                                                            : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <span
                                                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                                selected
                                                                    ? 'border-zinc-300 bg-zinc-300'
                                                                    : 'border-zinc-600'
                                                            }`}
                                                        >
                                                            {selected && (
                                                                <span className="h-2 w-2 rounded-full bg-zinc-900" />
                                                            )}
                                                        </span>
                                                        {option}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {q.type === 'text' && (
                                    <Input
                                        type="url"
                                        placeholder={'placeholder' in q ? q.placeholder : ''}
                                        value={answers[q.id] ?? ''}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        className="rounded-lg border-zinc-700 bg-zinc-800/60 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-600"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="h-11 flex-1 rounded-xl bg-zinc-50 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
                        >
                            {submitting ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ArrowRight className="mr-2 h-4 w-4" />
                            )}
                            Save & Continue
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSkip}
                            className="h-11 rounded-xl border-zinc-700 bg-transparent text-sm font-medium text-zinc-400 hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                        >
                            Skip
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
