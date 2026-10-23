import { Footer } from '@/components/footer';
import { SIRIUS_REPO_URL } from '@/components/github-repo-link';
import SystemDiagram from '@/components/sirius/architecture/SystemDiagram';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { agents, lifecycle, pipeline, safeguards, stack, summary, type AgentLevel } from '@/lib/sirius/architecture';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Fragment, type CSSProperties, type ReactNode } from 'react';

function Section({
    index,
    title,
    intro,
    children,
    wide = false,
}: {
    index: string;
    title: string;
    intro?: string;
    children: ReactNode;
    wide?: boolean;
}) {
    return (
        <section className="border-t border-border py-16 md:py-20">
            <div className={cn('mx-auto px-4 sm:px-6', wide ? 'max-w-[1480px]' : 'max-w-6xl')}>
                <div className={cn('mb-10 grid gap-4 md:grid-cols-[180px_1fr]', wide && 'mx-auto max-w-6xl sm:px-6')}>
                    <span className="font-mono text-xs text-muted-foreground">{index}</span>
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
                        {intro && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>}
                    </div>
                </div>
                {children}
            </div>
        </section>
    );
}

function AgentGraph({ levels }: { levels: AgentLevel[] }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            {levels.map((level, i) => (
                <Fragment key={i}>
                    {i > 0 && <span className="h-4 w-px bg-border" />}
                    <div className={cn('grid w-full gap-3', level.nodes.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                        {level.nodes.map((node) => (
                            <div key={node.name} className="flex flex-col items-center gap-1">
                                {node.edge && <span className="text-[10px] tracking-wide text-muted-foreground uppercase">{node.edge}</span>}
                                <span
                                    className={cn(
                                        'max-w-full truncate rounded-md border px-2.5 py-1 font-mono text-xs',
                                        node.terminal ? 'border-dashed border-border text-muted-foreground' : 'border-border bg-card text-foreground',
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

export default function Architecture() {
    return (
        <div
            className="min-h-screen bg-background text-foreground"
            // Higher-contrast secondary text and hairlines for this long-form page.
            style={{ '--muted-foreground': 'oklch(0.82 0 0)', '--border': 'oklch(1 0 0 / 18%)', '--card': 'oklch(0.22 0 0)' } as CSSProperties}
        >
            <Head title="How Sirius is built">
                <meta
                    name="description"
                    content="Architecture of Sirius: a Laravel + Inertia/React app, a FastAPI AI service with LangGraph agents, a LiteLLM gateway to Gemini, PostgreSQL, and Docker/Dokploy delivery."
                />
            </Head>

            <SiriusNavbar />

            <header className="mx-auto max-w-6xl px-4 pt-36 pb-16 sm:px-6 md:pt-44">
                <p className="font-mono text-xs text-muted-foreground">Architecture</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">How Sirius is built</h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                    Sirius turns a plain-language brief into an overview, modules, features, ERDs, sequence diagrams, wireframes, a PRD and a C4
                    diagram. It runs as two services: a Laravel app that owns data, permissions and billing, and a Python service that owns prompts,
                    agents and validation.
                </p>
                <dl className="mt-10 grid grid-cols-1 border-y border-border sm:grid-cols-2 lg:grid-cols-4">
                    {summary.map((item, i) => (
                        <div
                            key={item.label}
                            className={cn(
                                'py-4 sm:px-4',
                                i > 0 && 'border-t border-border sm:border-t-0',
                                i >= 2 && 'sm:border-t lg:border-t-0',
                                i % 2 === 1 && 'sm:border-l',
                                i > 0 && 'lg:border-l',
                            )}
                        >
                            <dt className="text-xs text-muted-foreground">{item.label}</dt>
                            <dd className="mt-1 text-sm font-medium text-foreground">{item.value}</dd>
                        </div>
                    ))}
                </dl>
                <div className="mt-8 flex flex-wrap gap-3 text-sm">
                    <Link
                        href="/projects/1"
                        className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 font-medium text-background hover:opacity-90"
                    >
                        Explore the app <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                        href={SIRIUS_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
                    >
                        Source on GitHub <ArrowUpRight className="h-4 w-4" />
                    </a>
                </div>
            </header>

            <Section
                index="01"
                title="System map"
                intro="Every runtime component, data store, third-party service and both delivery pipelines. The browser never talks to a model: Laravel calls FastAPI, which calls LiteLLM."
                wide
            >
                <SystemDiagram />
            </Section>

            <Section index="02" title="Request lifecycle" intro="What happens when you click “Generate PRD”. Render first, generate second.">
                <ol className="divide-y divide-border border-y border-border">
                    {lifecycle.map((step, i) => (
                        <li key={step.title} className="grid gap-1 py-4 md:grid-cols-[180px_160px_1fr] md:gap-6">
                            <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                            <span className="font-mono text-xs text-foreground md:pt-0.5">{step.actor}</span>
                            <div>
                                <p className="text-sm font-medium text-foreground">{step.title}</p>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </Section>

            <Section
                index="03"
                title="Generation pipeline"
                intro="Each artifact is generated from the ones before it, so documents stay consistent. Every step opens in the demo."
            >
                <ol className="grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-3">
                    {pipeline.map((step, i) => (
                        <li key={step.title} className="border-r border-b border-border">
                            <Link href={step.href} className="group flex h-full flex-col p-5 transition-colors hover:bg-muted/40">
                                <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                                <span className="mt-3 flex items-center justify-between text-sm font-medium text-foreground">
                                    {step.title}
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                                </span>
                                <span className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</span>
                            </Link>
                        </li>
                    ))}
                </ol>
            </Section>

            <Section
                index="04"
                title="Agents"
                intro="Two LangGraph state machines route each message to the right node instead of sending everything through one prompt."
            >
                <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-2">
                    {agents.map((agent) => (
                        <div key={agent.name} className="flex flex-col bg-background p-6">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <h3 className="text-base font-semibold text-foreground">{agent.name}</h3>
                                <code className="font-mono text-xs text-muted-foreground">{agent.endpoint}</code>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{agent.summary}</p>
                            <div className="my-6 flex-1">
                                <AgentGraph levels={agent.levels} />
                            </div>
                            <ul className="space-y-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
                                {agent.notes.map((note) => (
                                    <li key={note}>— {note}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>

            <Section
                index="05"
                title="Reliability"
                intro="Model output is treated as untrusted input: parsed, repaired and validated before it can reach the database."
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-y border-border text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="py-3 pr-6 font-normal">Concern</th>
                                <th className="py-3 pr-6 font-normal">Mechanism</th>
                                <th className="py-3 font-normal">Where</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {safeguards.map((row) => (
                                <tr key={row.concern} className="align-top">
                                    <td className="py-3 pr-6 font-medium whitespace-nowrap text-foreground">{row.concern}</td>
                                    <td className="py-3 pr-6 text-muted-foreground">{row.mechanism}</td>
                                    <td className="py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">{row.where}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section index="06" title="Stack" intro="Versions as pinned in package.json, composer.json and requirements.txt.">
                <dl className="divide-y divide-border border-y border-border">
                    {stack.map((group) => (
                        <div key={group.layer} className="grid gap-2 py-4 md:grid-cols-[180px_1fr] md:gap-6">
                            <dt className="text-sm font-medium text-foreground">{group.layer}</dt>
                            <dd className="text-sm leading-relaxed text-muted-foreground">{group.items.join(' · ')}</dd>
                        </div>
                    ))}
                </dl>
            </Section>

            <Section
                index="07"
                title="About this demo"
                intro="Sirius is no longer running. This site is the production frontend rebuilt as a static site, with an in-browser mock server in place of Laravel."
            >
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                        <p>
                            Inertia sends every visit through <code className="font-mono text-foreground">axios</code>. The demo build aliases that
                            import to a small module that answers each visit with the component and props a Laravel controller would return, built
                            from sample data.
                        </p>
                        <p>Pages, layouts and editors are unchanged. Writes and AI calls are answered with a read-only notice; nothing is saved.</p>
                        <p>The build is published to GitHub Pages, with a 404.html copy of the app so deep links like /projects/1/prd work.</p>
                    </div>
                    <pre className="overflow-x-auto rounded-lg border border-border bg-card p-5 font-mono text-xs leading-relaxed text-foreground/90">
                        {`// vite.demo.config.ts
resolve: {
  alias: [
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
                </div>
            </Section>

            <Footer />
        </div>
    );
}
