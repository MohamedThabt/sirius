'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseLinkedInProfileUrl } from '@/lib/validations/linkedin';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type RadioQuestion = {
    id: string;
    question: string;
    subtitle?: string;
    type: 'radio';
    options: readonly string[];
};

type TextQuestion = {
    id: string;
    question: string;
    subtitle?: string;
    type: 'text';
    placeholder: string;
};

type Question = RadioQuestion | TextQuestion;

const QUESTIONS: Question[] = [
    {
        id: 'role',
        question: 'What best describes you?',
        subtitle: 'This helps us tailor your experience from the start.',
        type: 'radio',
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
        subtitle: "We'll surface the most relevant features for you.",
        type: 'radio',
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
        subtitle: 'Knowing your goal helps us make Sirius more useful for you.',
        type: 'radio',
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
        subtitle: 'Optional — we may reach out to early builders for feedback.',
        type: 'text',
        placeholder: 'www.linkedin.com/in/your-username',
    },
];

export default function Questionnaire() {
    const page = usePage<{ errors?: { linkedin?: string } }>();
    const serverLinkedinError = page.props.errors?.linkedin;

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [animating, setAnimating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [linkedinError, setLinkedinError] = useState<string | null>(null);

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

        const onResize = () => {
            setSize();
            init();
        };
        window.addEventListener('resize', onResize);
        init();
        raf = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(raf);
        };
    }, []);

    const navigate = (nextStep: number, dir: 'forward' | 'back') => {
        if (animating) return;
        setDirection(dir);
        setAnimating(true);
        setTimeout(() => {
            setStep(nextStep);
            setAnimating(false);
        }, 260);
    };

    const handleNext = () => {
        if (step < QUESTIONS.length - 1) {
            navigate(step + 1, 'forward');
        }
    };

    const handleBack = () => {
        if (step > 0) navigate(step - 1, 'back');
    };

    const handleSkipQuestion = () => {
        if (step < QUESTIONS.length - 1) {
            navigate(step + 1, 'forward');
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setLinkedinError(null);

        const questionnaire: { question: string; answer: string }[] = [];

        for (const q of QUESTIONS) {
            const raw = (answers[q.id] ?? '').trim();
            if (!raw) {
                continue;
            }
            if (q.id === 'linkedin') {
                const parsed = parseLinkedInProfileUrl(answers[q.id] ?? '');
                if (!parsed.ok) {
                    setLinkedinError(parsed.message);
                    return;
                }
                questionnaire.push({ question: q.question, answer: parsed.normalized });
            } else {
                questionnaire.push({ question: q.question, answer: raw });
            }
        }

        setSubmitting(true);
        router.post(
            '/user/questionnaire',
            { questionnaire },
            {
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const setAnswer = (id: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [id]: value }));
        if (id === 'linkedin') {
            setLinkedinError(null);
        }
    };

    const current = QUESTIONS[step];
    const isLast = step === QUESTIONS.length - 1;
    const hasAnswer = (answers[current.id] ?? '').trim() !== '';
    const progress = ((step + 1) / QUESTIONS.length) * 100;

    const slideOut = animating
        ? direction === 'forward'
            ? '-translate-x-12 opacity-0'
            : 'translate-x-12 opacity-0'
        : '';
    const slideIn = !animating ? 'translate-x-0 opacity-100' : '';

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
        .card-enter{opacity:0;transform:translateX(40px);animation:cardIn .3s cubic-bezier(.22,.61,.36,1) forwards}
        .card-enter-back{opacity:0;transform:translateX(-40px);animation:cardIn .3s cubic-bezier(.22,.61,.36,1) forwards}
        @keyframes cardIn{to{opacity:1;transform:translateX(0)}}
      `}</style>

            <div className="pointer-events-none fixed inset-0 [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

            <div className="accent-lines">
                <div className="hline" /><div className="hline" /><div className="hline" />
                <div className="vline" /><div className="vline" /><div className="vline" />
            </div>

            <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full opacity-50 mix-blend-screen" />

            {/* Header */}
            <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
                <a href="/">
                    <img src="/images/sirius-logo.png" alt="Sirius" className="h-8 w-auto" />
                </a>
                <button
                    type="button"
                    onClick={() => router.visit('/projects')}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    Skip all
                </button>
            </header>

            {/* Main */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 pt-20 pb-16">
                <div className="w-full max-w-lg">

                    {/* Step counter + progress */}
                    <div className="mb-8">
                        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                            <span>Question {step + 1} of {QUESTIONS.length}</span>
                            <span>{Math.round(progress)}% complete</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                                className="h-full rounded-full bg-zinc-300 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Step dots */}
                        <div className="mt-3 flex items-center justify-center gap-2">
                            {QUESTIONS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                                        i < step
                                            ? 'border-zinc-400 bg-zinc-400 text-zinc-900'
                                            : i === step
                                            ? 'border-zinc-200 bg-zinc-200 text-zinc-900 shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                                            : 'border-zinc-700 bg-transparent text-zinc-600'
                                    }`}
                                >
                                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Question card */}
                    <div
                        key={step}
                        className={direction === 'forward' ? 'card-enter' : 'card-enter-back'}
                    >
                        <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl backdrop-blur transition-all duration-[260ms] ${slideOut} ${slideIn}`}>

                            {/* Question heading */}
                            <div className="mb-6">
                                <p className="text-xl font-bold text-zinc-50">{current.question}</p>
                                {current.subtitle && (
                                    <p className="mt-1.5 text-sm text-zinc-400">{current.subtitle}</p>
                                )}
                            </div>

                            {/* Radio options */}
                            {current.type === 'radio' && (
                                <div className="space-y-2.5">
                                    {current.options.map((option) => {
                                        const selected = answers[current.id] === option;
                                        return (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setAnswer(current.id, selected ? '' : option)}
                                                className={`group w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 ${
                                                    selected
                                                        ? 'border-zinc-300 bg-zinc-800 text-zinc-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                                                        : 'border-zinc-700/70 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-200'
                                                }`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span
                                                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                                                            selected
                                                                ? 'border-zinc-200 bg-zinc-200'
                                                                : 'border-zinc-600 group-hover:border-zinc-400'
                                                        }`}
                                                    >
                                                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />}
                                                    </span>
                                                    {option}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Text input */}
                            {current.type === 'text' && (
                                <div className="space-y-1.5">
                                    <Input
                                        type="text"
                                        inputMode="url"
                                        autoComplete="url"
                                        placeholder={(current as TextQuestion).placeholder}
                                        value={answers[current.id] ?? ''}
                                        onChange={(e) => setAnswer(current.id, e.target.value)}
                                        className="h-11 rounded-xl border-zinc-700 bg-zinc-800/60 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
                                        autoFocus
                                    />
                                    <p className="text-[11px] text-zinc-500">
                                        Public profile URL only, e.g. <span className="text-zinc-400">www.linkedin.com/in/mohamed-thabet-swe</span> — https is added for you
                                        when needed.
                                    </p>
                                    {(linkedinError || (current.id === 'linkedin' && serverLinkedinError)) && (
                                        <p className="text-xs text-red-400">
                                            {linkedinError || serverLinkedinError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-5 flex items-center gap-3">
                        {step > 0 ? (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        ) : (
                            <div className="w-10 flex-shrink-0" />
                        )}

                        {isLast ? (
                            <Button
                                type="button"
                                onClick={handleFinish}
                                disabled={submitting}
                                className="h-10 flex-1 rounded-xl bg-zinc-50 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
                            >
                                {submitting ? (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                )}
                                Finish & Continue
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={!hasAnswer}
                                className="h-10 flex-1 rounded-xl bg-zinc-50 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-40"
                            >
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                        <button
                            type="button"
                            onClick={handleSkipQuestion}
                            className="flex-shrink-0 rounded-xl px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
