import { Footer } from '@/components/footer';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import {
    accentClasses,
    agents,
    delivery,
    editors,
    heroStats,
    lifecycle,
    pipeline,
    safeguards,
    stack,
    systemLinks,
    systemNodes,
    type Accent,
    type AgentLevel,
} from '@/lib/sirius/architecture';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, FileCode2, Info } from 'lucide-react';
import { Fragment, useState, type ReactNode } from 'react';

const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.5, ease: 'easeOut' },
} as const;

function Section({
    id,
    eyebrow,
    title,
    subtitle,
    children,
    className,
}: {
    id: string;
    eyebrow: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section id={id} className={cn('sirius-section scroll-mt-24', className)}>
            <div className="sirius-container">
                <motion.div {...reveal} className="mx-auto mb-12 max-w-3xl text-center">
                    <span className="text-kicker mb-3 block">{eyebrow}</span>
                    <h2 className="text-section-title mb-4 text-foreground">{title}</h2>
                    {subtitle && <p className="text-body text-muted-foreground">{subtitle}</p>}
                </motion.div>
                {children}
            </div>
        </section>
    );
}

function AccentBadge({ accent, children }: { accent: Accent; children: ReactNode }) {
    const a = accentClasses[accent];
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', a.border, a.bg, a.text)}>
            {children}
        </span>
    );
}

/** Horizontal (desktop) / vertical (mobile) connector with a travelling packet. */
function Connector({ label, index }: { label: string; index: number }) {
    return (
        <div className="flex min-w-0 items-center justify-center lg:flex-col">
            <div className="relative h-10 w-px bg-gradient-to-b from-border via-foreground/30 to-border lg:h-px lg:w-full lg:bg-gradient-to-r">
                <motion.span
                    className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground shadow-[0_0_12px_2px] shadow-foreground/40 lg:hidden"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.6 }}
                />
                <motion.span
                    className="absolute top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_12px_2px] shadow-foreground/40 lg:block"
                    animate={{ left: ['0%', '100%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.6 }}
                />
            </div>
            <span className="ml-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase lg:mt-3 lg:ml-0 lg:text-center">{label}</span>
        </div>
    );
}

function SystemMap() {
    const [selectedId, setSelectedId] = useState(systemNodes[1].id);
    const selected = systemNodes.find((node) => node.id === selectedId) ?? systemNodes[0];
    const a = accentClasses[selected.accent];

    return (
        <div>
            <motion.div
                {...reveal}
                className="grid grid-cols-1 items-start gap-0 lg:grid-cols-[1fr_minmax(90px,0.6fr)_1fr_minmax(90px,0.6fr)_1fr_minmax(90px,0.6fr)_1fr] lg:items-center"
            >
                {systemNodes.map((node, index) => {
                    const accent = accentClasses[node.accent];
                    const isActive = node.id === selectedId;
                    const Icon = node.icon;
                    return (
                        <Fragment key={node.id}>
                            <button
                                type="button"
                                onClick={() => setSelectedId(node.id)}
                                className={cn(
                                    'group relative overflow-hidden rounded-2xl border bg-card/60 p-5 text-left backdrop-blur transition-all duration-300 hover:-translate-y-0.5 focus:outline-none',
                                    isActive ? cn('ring-2', accent.ring, accent.border) : 'border-border hover:border-foreground/20',
                                )}
                            >
                                <div
                                    className={cn(
                                        'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                                        accent.glow,
                                        isActive && 'opacity-100',
                                    )}
                                />
                                <div className="relative">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accent.bg, accent.text)}>
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">{node.layer}</span>
                                    </div>
                                    <div className="text-lg font-semibold text-foreground">{node.title}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">{node.subtitle}</div>
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {node.satellites.map((s) => (
                                            <span
                                                key={s}
                                                className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </button>
                            {index < systemNodes.length - 1 && <Connector label={systemLinks[index]} index={index} />}
                        </Fragment>
                    );
                })}
            </motion.div>

            <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn('mt-10 grid gap-6 rounded-2xl border bg-card/40 p-6 md:grid-cols-[1.6fr_1fr] md:p-8', a.border)}
            >
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <AccentBadge accent={selected.accent}>{selected.layer}</AccentBadge>
                        <h3 className="text-xl font-semibold text-foreground">{selected.title}</h3>
                    </div>
                    <ul className="space-y-3">
                        {selected.responsibilities.map((item) => (
                            <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                                <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', a.dot)} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-xl border border-border bg-background/50 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                        <FileCode2 className="h-4 w-4" /> Where it lives
                    </div>
                    <ul className="space-y-2">
                        {selected.files.map((file) => (
                            <li key={file} className="rounded-md bg-muted/60 px-3 py-2 font-mono text-xs break-all text-foreground/80">
                                {file}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-xs text-muted-foreground">Click any layer above to inspect it.</p>
                </div>
            </motion.div>
        </div>
    );
}

function Lifecycle() {
    return (
        <div className="relative mx-auto max-w-3xl">
            <div className="absolute top-2 bottom-2 left-[19px] w-px bg-gradient-to-b from-sky-500/50 via-emerald-500/50 to-rose-500/50 md:left-1/2" />
            <ol className="space-y-8">
                {lifecycle.map((step, index) => {
                    const a = accentClasses[step.accent];
                    const right = index % 2 === 1;
                    return (
                        <motion.li
                            key={step.title}
                            {...reveal}
                            transition={{ ...reveal.transition, delay: 0.04 * index }}
                            className="relative grid grid-cols-[40px_1fr] gap-4 md:grid-cols-2 md:gap-12"
                        >
                            <span
                                className={cn(
                                    'z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-background text-sm font-semibold md:absolute md:left-1/2 md:-translate-x-1/2',
                                    a.border,
                                    a.text,
                                )}
                            >
                                {index + 1}
                            </span>
                            <div
                                className={cn(
                                    'rounded-xl border border-border bg-card/50 p-5',
                                    right ? 'md:col-start-2' : 'md:col-start-1 md:text-right',
                                )}
                            >
                                <div className={cn('mb-2 flex', !right && 'md:justify-end')}>
                                    <AccentBadge accent={step.accent}>{step.actor}</AccentBadge>
                                </div>
                                <h3 className="font-semibold text-foreground">{step.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                            </div>
                        </motion.li>
                    );
                })}
            </ol>
        </div>
    );
}

function Pipeline() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pipeline.map((stage, index) => {
                const Icon = stage.icon;
                return (
                    <motion.div key={stage.step} {...reveal} transition={{ ...reveal.transition, delay: 0.04 * index }}>
                        <Link
                            href={stage.href}
                            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-xl"
                        >
                            <span className="pointer-events-none absolute -top-6 -right-2 font-mono text-7xl font-bold text-foreground/[0.04] transition-colors group-hover:text-foreground/[0.08]">
                                {stage.step}
                            </span>
                            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground">
                                <Icon className="h-5 w-5" />
                            </span>
                            <h3 className="text-base font-semibold text-foreground">{stage.title}</h3>
                            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground/70 transition-colors group-hover:text-foreground">
                                Open in demo{' '}
                                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}

function AgentGraph({ levels, accent }: { levels: AgentLevel[]; accent: Accent }) {
    const a = accentClasses[accent];
    return (
        <div className="flex flex-col items-center gap-1 py-2">
            {levels.map((level, levelIndex) => (
                <Fragment key={levelIndex}>
                    {levelIndex > 0 && <ArrowDown className="h-4 w-4 text-muted-foreground/60" />}
                    <div className={cn('grid w-full gap-3', level.nodes.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                        {level.nodes.map((node) => (
                            <div key={node.name} className="flex flex-col items-center gap-1">
                                {node.edge && <span className="text-[10px] tracking-wide text-muted-foreground uppercase">{node.edge}</span>}
                                <span
                                    className={cn(
                                        'max-w-full truncate rounded-lg border px-3 py-1.5 font-mono text-xs',
                                        node.terminal ? 'border-dashed border-border text-muted-foreground' : cn(a.border, a.bg, 'text-foreground'),
                                    )}
                                >
                                    {node.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </Fragment>
            ))}
        </div>
    );
}

function Agents() {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {agents.map((agent, index) => (
                <motion.div
                    key={agent.name}
                    {...reveal}
                    transition={{ ...reveal.transition, delay: 0.1 * index }}
                    className="flex flex-col rounded-2xl border border-border bg-card/50 p-6 md:p-8"
                >
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
                        <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{agent.endpoint}</code>
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{agent.summary}</p>
                    <div className="mb-6 flex-1 rounded-xl border border-border bg-background/60 p-4">
                        <AgentGraph levels={agent.levels} accent={agent.accent} />
                    </div>
                    <ul className="space-y-2">
                        {agent.notes.map((note) => (
                            <li key={note} className="flex gap-2.5 text-sm text-muted-foreground">
                                <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', accentClasses[agent.accent].dot)} />
                                {note}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            ))}
        </div>
    );
}

export default function Architecture() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="How Sirius is built">
                <meta
                    name="description"
                    content="The architecture behind Sirius: a Laravel + Inertia/React app, a FastAPI AI service with LangGraph agents, and a LiteLLM gateway to Gemini."
                />
            </Head>

            <SiriusNavbar />

            {/* Hero */}
            <header className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-24">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-20 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-emerald-500/10 blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] bg-[size:48px_48px] opacity-40" />
                </div>
                <div className="sirius-container relative text-center">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Under the hood
                        </span>
                        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
                            How Sirius turns a brief into{' '}
                            <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                                build-ready specs
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            A Laravel + React product app, a Python AI service with stateful LangGraph agents, and a model gateway — designed so every
                            generated artifact is grounded in the whole project, validated before it is saved, and metered per call.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/projects/1"
                                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                            >
                                Explore the app <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#system"
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                See the architecture <ArrowDown className="h-4 w-4" />
                            </a>
                        </div>
                    </motion.div>

                    <motion.dl
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4"
                    >
                        {heroStats.map((stat) => (
                            <div key={stat.label} className="bg-background/90 px-4 py-6 backdrop-blur">
                                <dt className="text-xs tracking-widest text-muted-foreground uppercase">{stat.label}</dt>
                                <dd className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{stat.value}</dd>
                                <dd className="mt-1 text-xs text-muted-foreground">{stat.detail}</dd>
                            </div>
                        ))}
                    </motion.dl>
                </div>
            </header>

            <Section
                id="system"
                eyebrow="System map"
                title="Four layers, one request path"
                subtitle="The browser never talks to the model. Laravel owns data, permissions and billing; FastAPI owns prompts, agents and validation; LiteLLM owns providers."
                className="bg-card/30"
            >
                <SystemMap />
            </Section>

            <Section
                id="lifecycle"
                eyebrow="Request lifecycle"
                title="What happens when you click “Generate PRD”"
                subtitle="Render first, generate second — the page appears instantly while the model works."
            >
                <Lifecycle />
            </Section>

            <Section
                id="pipeline"
                eyebrow="Generation pipeline"
                title="Each artifact feeds the next"
                subtitle="Later documents are generated from earlier ones, so the PRD, ERD and diagrams stay consistent with the same modules and features."
                className="bg-card/30"
            >
                <Pipeline />
            </Section>

            <Section
                id="agents"
                eyebrow="Agents"
                title="Stateful conversations with LangGraph"
                subtitle="Two graphs route each message to the right node instead of sending everything through one giant prompt."
            >
                <Agents />
            </Section>

            <Section
                id="reliability"
                eyebrow="Reliability"
                title="LLM output is treated as untrusted input"
                subtitle="Every response is parsed, repaired and validated before it can reach the database."
                className="bg-card/30"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {safeguards.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                {...reveal}
                                transition={{ ...reveal.transition, delay: 0.03 * index }}
                                className="rounded-2xl border border-border bg-background/60 p-5"
                            >
                                <Icon className="mb-4 h-5 w-5 text-foreground" />
                                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                                <code className="mt-4 block truncate font-mono text-[11px] text-muted-foreground/80">{item.file}</code>
                            </motion.div>
                        );
                    })}
                </div>
            </Section>

            <Section
                id="editors"
                eyebrow="Frontend"
                title="Editors, not just text"
                subtitle="Each artifact has a purpose-built editor. They are all live in this demo."
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {editors.map((editor, index) => {
                        const Icon = editor.icon;
                        return (
                            <motion.div key={editor.title} {...reveal} transition={{ ...reveal.transition, delay: 0.04 * index }}>
                                <Link
                                    href={editor.href}
                                    className="group flex h-full flex-col rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-xl"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <Icon className="h-6 w-6 text-foreground" />
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">{editor.title}</h3>
                                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{editor.body}</p>
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {editor.tags.map((tag) => (
                                            <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </Section>

            <Section id="stack" eyebrow="Stack & delivery" title="Technology and how it ships" className="bg-card/30">
                <div className="grid gap-4 md:grid-cols-2">
                    {stack.map((group) => {
                        const a = accentClasses[group.accent];
                        return (
                            <motion.div key={group.group} {...reveal} className="rounded-2xl border border-border bg-background/60 p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <span className={cn('h-2 w-2 rounded-full', a.dot)} />
                                    <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{group.group}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {group.items.map((item) => (
                                        <span key={item} className={cn('rounded-lg border px-3 py-1.5 text-sm', a.border, a.bg, 'text-foreground')}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div {...reveal} className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-4">
                    {delivery.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.title} className="relative rounded-2xl border border-border bg-background/60 p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                                    <Icon className="h-4 w-4 text-foreground" />
                                </div>
                                <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                                {index < delivery.length - 1 && (
                                    <ArrowRight className="absolute top-1/2 -right-3 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-background text-muted-foreground md:block" />
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </Section>

            <Section
                id="demo"
                eyebrow="About this demo"
                title="Running without a backend"
                subtitle="Sirius is no longer live. This site is the real production frontend, rebuilt as a static site with an in-browser mock server."
            >
                <motion.div {...reveal} className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                        <p>
                            Inertia sends every visit through{' '}
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">axios</code>. The demo build aliases
                            that import to a small module that answers each visit with the same component and props a Laravel controller would return,
                            built from mock data.
                        </p>
                        <p>
                            Pages, links, layouts and editors are unchanged. Writes and AI calls are intercepted and answered with a friendly
                            “read-only demo” message.
                        </p>
                        <p>It is deployed to GitHub Pages; a 404.html copy of the app makes deep links like /projects/1/prd work.</p>
                        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            All projects, diagrams and documents you see are sample data. Nothing is saved.
                        </div>
                    </div>
                    <pre className="overflow-x-auto rounded-2xl border border-border bg-card/70 p-5 font-mono text-xs leading-relaxed text-foreground/90">
                        {`// vite.demo.config.ts
resolve: {
  alias: [
    // Inertia's transport → in-browser mock server
    { find: /^axios$/, replacement: 'demo/axios-shim.ts' },
    { find: '@', replacement: 'resources/js' },
  ],
}

// demo/axios-shim.ts
async function axios({ method, url }) {
  if (method !== 'get') toast.info(READ_ONLY);
  return {
    status: 200,
    headers: { 'x-inertia': 'true' },
    data: JSON.stringify(resolveVisit(url)),
  };
}`}
                    </pre>
                </motion.div>

                <motion.div {...reveal} className="mt-16 flex flex-col items-center gap-4 text-center">
                    <h3 className="text-2xl font-semibold text-foreground">See it for yourself</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/projects/1"
                            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                        >
                            Open the sample project <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            Back to the landing page
                        </Link>
                    </div>
                </motion.div>
            </Section>

            <Footer />
        </div>
    );
}
