/**
 * Full system map for the architecture page: runtime topology, data stores,
 * third-party services and the two delivery pipelines, as one hand-laid-out SVG.
 * Hover or click a node to highlight its connections and show its details.
 */
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

type Kind = 'client' | 'edge' | 'app' | 'ai' | 'data' | 'external' | 'delivery';

interface DiagramNode {
    id: string;
    kind: Kind;
    x: number;
    y: number;
    w: number;
    h: number;
    title: string;
    sub?: string;
    items?: string[];
    shape?: 'cylinder';
    detail: string;
    files?: string[];
}

interface DiagramEdge {
    from: string;
    to: string;
    points: Array<[number, number]>;
    label?: string;
    labelAt?: [number, number];
    dashed?: boolean;
}

const KIND_COLOR: Record<Kind, string> = {
    client: '#38bdf8',
    edge: '#a3a3a3',
    app: '#fb7185',
    ai: '#34d399',
    data: '#fbbf24',
    external: '#c4b5fd',
    delivery: '#818cf8',
};

const KIND_LABEL: Record<Kind, string> = {
    client: 'Client',
    edge: 'Edge',
    app: 'Application',
    ai: 'AI service',
    data: 'Data',
    external: 'Third party',
    delivery: 'Delivery',
};

const groups = [
    { x: 470, y: 140, w: 350, h: 360, label: 'DOKPLOY STACK · sirius-laravel' },
    { x: 860, y: 140, w: 300, h: 360, label: 'DOKPLOY STACK · sirius-ai' },
    { x: 20, y: 680, w: 1400, h: 225, label: 'DELIVERY' },
];

const nodes: DiagramNode[] = [
    {
        id: 'browser',
        kind: 'client',
        x: 20,
        y: 230,
        w: 200,
        h: 115,
        title: 'Browser',
        sub: 'React 19 · Inertia 2',
        items: ['TypeScript · Tailwind 4', 'React Flow · Mermaid', 'Monaco · Excalidraw'],
        detail: 'Single-page React app driven by Inertia: every page is a component that receives typed props from a Laravel controller. Artifact editors run fully client-side.',
        files: ['laravel/resources/js/pages', 'laravel/resources/js/components'],
    },
    {
        id: 'browserSvc',
        kind: 'external',
        x: 20,
        y: 400,
        w: 200,
        h: 95,
        title: 'In-browser services',
        items: ['PostHog analytics', 'Google Analytics 4', 'Turnstile widget'],
        detail: 'Product analytics (PostHog, GA4) and the Cloudflare Turnstile challenge on sign-up and login, loaded as browser SDKs.',
        files: ['laravel/resources/js/app.tsx', 'laravel/resources/js/components/login-signup.tsx'],
    },
    {
        id: 'cloudflare',
        kind: 'edge',
        x: 260,
        y: 160,
        w: 170,
        h: 74,
        title: 'Cloudflare',
        sub: 'DNS · proxy · TLS',
        detail: 'DNS and TLS-terminating proxy in front of the production host.',
    },
    {
        id: 'nginx',
        kind: 'edge',
        x: 260,
        y: 290,
        w: 170,
        h: 74,
        title: 'Nginx',
        sub: 'static files · FastCGI',
        detail: 'Serves built assets and /storage, and forwards PHP requests to PHP-FPM on port 9000.',
        files: ['laravel/.docker/nginx.prod.conf'],
    },
    {
        id: 'laravel',
        kind: 'app',
        x: 490,
        y: 175,
        w: 310,
        h: 190,
        title: 'Laravel 12 · PHP-FPM',
        sub: 'Inertia server-side routing',
        items: [
            'Controllers + policies (4 roles)',
            'Credit metering · 402 → upgrade',
            'Overview / PRD version history',
            'GitHub export (OAuth)',
            'Bank-transfer payments + review',
            'Admin dashboard · Pulse',
            'Queued jobs: ERD merge, mail',
        ],
        detail: 'The product backend. Owns users, projects, modules, features and their versions; authorizes every request; builds the context for each AI call; meters credits and exports specs to GitHub. The container migrates and seeds on start.',
        files: ['laravel/app/Http/Controllers', 'laravel/routes/web.php', 'laravel/scripts/php-entrypoint'],
    },
    {
        id: 'nightwatch',
        kind: 'app',
        x: 490,
        y: 395,
        w: 145,
        h: 64,
        title: 'Nightwatch agent',
        sub: '→ Nightwatch cloud',
        detail: 'Sidecar container that ships Laravel exceptions, requests and queries to Laravel Nightwatch.',
        files: ['docker-compose.yml'],
    },
    {
        id: 'storage',
        kind: 'data',
        shape: 'cylinder',
        x: 655,
        y: 390,
        w: 145,
        h: 74,
        title: 'Storage volume',
        sub: 'uploads · logs',
        detail: 'Shared Docker volume for payment screenshots, user uploads and application logs; mounted by both PHP-FPM and Nginx.',
        files: ['laravel/docker-compose.prod.yml'],
    },
    {
        id: 'postgres',
        kind: 'data',
        shape: 'cylinder',
        x: 530,
        y: 530,
        w: 230,
        h: 110,
        title: 'PostgreSQL',
        items: ['projects, modules, features', 'versions, credits, usage', 'sessions · cache · jobs'],
        detail: 'Primary relational store. Sessions, cache and the job queue also use the database driver, so there is no separate cache tier to operate.',
        files: ['laravel/database/migrations', 'laravel/config/database.php'],
    },
    {
        id: 'fastapi',
        kind: 'ai',
        x: 880,
        y: 175,
        w: 260,
        h: 175,
        title: 'FastAPI · Python',
        sub: 'Bearer-protected REST',
        items: [
            '9 artifact routers (gen/edit/sync)',
            'Intake agent · LangGraph',
            'Overview chat agent · LangGraph',
            'Prompt library',
            'JSON repair · diagram validators',
            'Fallbacks · logs & health API',
        ],
        detail: 'The AI service. One router per artifact with Pydantic response models, two stateful LangGraph agents, and a validation layer that repairs and checks every model response before Laravel sees it.',
        files: ['fastAPI/src/routes/api_routes.py', 'fastAPI/src/controllers', 'fastAPI/src/utils'],
    },
    {
        id: 'sqlite',
        kind: 'data',
        shape: 'cylinder',
        x: 880,
        y: 385,
        w: 105,
        h: 90,
        title: 'SQLite',
        sub: 'agent',
        items: ['checkpoints'],
        detail: 'LangGraph SqliteSaver checkpoints: conversation state for the intake and overview agents, keyed by thread id.',
        files: ['fastAPI/src/controllers/intake_agent.py', 'fastAPI/src/controllers/chat_intent_controller.py'],
    },
    {
        id: 'litellm',
        kind: 'ai',
        x: 1000,
        y: 385,
        w: 140,
        h: 90,
        title: 'LiteLLM',
        sub: 'proxy :4000',
        items: ['key rotation'],
        detail: 'OpenAI-compatible gateway container. Load-balances across Gemini API keys and fails over on quota errors, so application code never handles provider keys.',
        files: ['fastAPI/src/configllm.yaml', 'fastAPI/README_PROXY.md'],
    },
    {
        id: 'thirdparty',
        kind: 'external',
        x: 1200,
        y: 160,
        w: 220,
        h: 150,
        title: 'Third-party APIs',
        items: [
            'GitHub API · OAuth',
            'Google OAuth (Socialite)',
            'Resend · email + webhooks',
            'Telegram bot · admin alerts',
            'Turnstile · siteverify',
            'Nightwatch cloud',
        ],
        detail: 'Services called from Laravel: GitHub for repository export, Google sign-in, transactional email with delivery webhooks, Telegram alerts for sign-ups and feedback, and server-side Turnstile verification.',
        files: ['laravel/config/services.php', 'laravel/app/Services/Github', 'laravel/app/Services/Notification'],
    },
    {
        id: 'gemini',
        kind: 'external',
        x: 1200,
        y: 340,
        w: 220,
        h: 58,
        title: 'Gemini 2.5 Flash',
        sub: '7 API keys, load-balanced',
        detail: 'Primary model for every generator and agent node.',
        files: ['fastAPI/src/configllm.yaml'],
    },
    {
        id: 'cerebras',
        kind: 'external',
        x: 1200,
        y: 410,
        w: 220,
        h: 58,
        title: 'Cerebras · Llama 3.1 8B',
        sub: 'configured alternative',
        detail: 'Additional model registered in the gateway for fast, low-cost calls.',
        files: ['fastAPI/src/configllm.yaml'],
    },
    {
        id: 'langfuse',
        kind: 'external',
        x: 1200,
        y: 480,
        w: 220,
        h: 58,
        title: 'Langfuse',
        sub: 'tracing hook (disabled)',
        detail: 'LiteLLM success/failure callbacks to Langfuse are present in the config but commented out.',
        files: ['fastAPI/src/configllm.yaml'],
    },
    // Delivery: production
    {
        id: 'repo',
        kind: 'delivery',
        x: 120,
        y: 720,
        w: 200,
        h: 64,
        title: 'GitHub repo',
        sub: 'push to main',
        detail: 'Monorepo with laravel/ and fastAPI/. Pushes to main trigger both production workflows.',
    },
    {
        id: 'actions',
        kind: 'delivery',
        x: 370,
        y: 720,
        w: 230,
        h: 64,
        title: 'GitHub Actions',
        sub: 'laravel.yml · fastapi.yml',
        detail: 'Builds the multi-stage Docker images. Wayfinder route helpers are generated inside the Laravel build.',
        files: ['.github/workflows/laravel.yml', '.github/workflows/fastapi.yml', 'laravel/Dockerfile'],
    },
    {
        id: 'ghcr',
        kind: 'delivery',
        x: 650,
        y: 720,
        w: 230,
        h: 64,
        title: 'GHCR',
        sub: 'sirius-laravel · sirius-fastapi',
        detail: 'GitHub Container Registry, images tagged by branch and commit SHA.',
    },
    {
        id: 'dokploy',
        kind: 'delivery',
        x: 930,
        y: 720,
        w: 200,
        h: 64,
        title: 'Dokploy',
        sub: 'compose redeploy API',
        detail: 'Called by the workflows after a successful push; pulls the new images and restarts both compose stacks on the VPS.',
    },
    // Delivery: this demo
    {
        id: 'demoBranch',
        kind: 'delivery',
        x: 120,
        y: 820,
        w: 200,
        h: 64,
        title: 'demo/github-pages',
        sub: 'this site',
        detail: 'Branch holding the static demo build configuration and the in-browser mock server.',
        files: ['laravel/vite.demo.config.ts', 'laravel/resources/js/demo'],
    },
    {
        id: 'demoActions',
        kind: 'delivery',
        x: 370,
        y: 820,
        w: 230,
        h: 64,
        title: 'GitHub Actions',
        sub: 'demo-pages.yml · vite build',
        detail: 'Builds the frontend without PHP: axios is aliased to the mock server and Wayfinder helpers are stubbed.',
        files: ['.github/workflows/demo-pages.yml'],
    },
    {
        id: 'ghpages',
        kind: 'delivery',
        x: 650,
        y: 820,
        w: 230,
        h: 64,
        title: 'gh-pages branch',
        sub: 'static build + 404.html',
        detail: 'Published build; 404.html is a copy of the app so deep links resolve client-side.',
    },
    {
        id: 'pages',
        kind: 'delivery',
        x: 930,
        y: 820,
        w: 200,
        h: 64,
        title: 'GitHub Pages',
        sub: 'static hosting',
        detail: 'Serves the static demo.',
    },
    {
        id: 'cfDemo',
        kind: 'edge',
        x: 1180,
        y: 820,
        w: 220,
        h: 64,
        title: 'Cloudflare',
        sub: 'sirius.sirthabet.dev',
        detail: 'DNS and proxy for the demo domain.',
    },
];

const edges: DiagramEdge[] = [
    {
        from: 'browser',
        to: 'cloudflare',
        points: [
            [220, 270],
            [240, 270],
            [240, 197],
            [260, 197],
        ],
        label: 'HTTPS',
        labelAt: [240, 236],
    },
    {
        from: 'cloudflare',
        to: 'nginx',
        points: [
            [345, 234],
            [345, 290],
        ],
        label: 'proxied',
        labelAt: [345, 262],
    },
    {
        from: 'nginx',
        to: 'laravel',
        points: [
            [430, 327],
            [490, 327],
        ],
        label: 'FastCGI',
        labelAt: [460, 315],
    },
    {
        from: 'browser',
        to: 'browserSvc',
        points: [
            [120, 345],
            [120, 400],
        ],
        label: 'JS SDKs',
        labelAt: [120, 372],
    },
    {
        from: 'laravel',
        to: 'fastapi',
        points: [
            [800, 270],
            [880, 270],
        ],
        label: 'REST + Bearer',
        labelAt: [840, 258],
    },
    {
        from: 'laravel',
        to: 'nightwatch',
        points: [
            [562, 365],
            [562, 395],
        ],
    },
    {
        from: 'laravel',
        to: 'storage',
        points: [
            [727, 365],
            [727, 390],
        ],
    },
    {
        from: 'laravel',
        to: 'postgres',
        points: [
            [645, 365],
            [645, 530],
        ],
        label: 'SQL',
        labelAt: [645, 515],
    },
    {
        from: 'laravel',
        to: 'thirdparty',
        points: [
            [700, 175],
            [700, 118],
            [1395, 118],
            [1395, 160],
        ],
        label: 'OAuth · mail · alerts · repos',
        labelAt: [1040, 118],
    },
    {
        from: 'fastapi',
        to: 'sqlite',
        points: [
            [932, 350],
            [932, 385],
        ],
    },
    {
        from: 'fastapi',
        to: 'litellm',
        points: [
            [1070, 350],
            [1070, 385],
        ],
        label: 'OpenAI API',
        labelAt: [1070, 367],
    },
    {
        from: 'litellm',
        to: 'gemini',
        points: [
            [1140, 405],
            [1170, 405],
            [1170, 369],
            [1200, 369],
        ],
    },
    {
        from: 'litellm',
        to: 'cerebras',
        points: [
            [1140, 439],
            [1200, 439],
        ],
    },
    {
        from: 'litellm',
        to: 'langfuse',
        points: [
            [1140, 460],
            [1170, 460],
            [1170, 509],
            [1200, 509],
        ],
        dashed: true,
    },
    {
        from: 'repo',
        to: 'actions',
        points: [
            [320, 752],
            [370, 752],
        ],
    },
    {
        from: 'actions',
        to: 'ghcr',
        points: [
            [600, 752],
            [650, 752],
        ],
        label: 'push',
        labelAt: [625, 740],
    },
    {
        from: 'ghcr',
        to: 'dokploy',
        points: [
            [880, 752],
            [930, 752],
        ],
        label: 'API',
        labelAt: [905, 740],
    },
    {
        from: 'dokploy',
        to: 'fastapi',
        points: [
            [1050, 720],
            [1050, 500],
        ],
        label: 'redeploy',
        labelAt: [1050, 610],
    },
    {
        from: 'dokploy',
        to: 'laravel',
        points: [
            [1010, 720],
            [1010, 665],
            [790, 665],
            [790, 500],
        ],
    },
    {
        from: 'demoBranch',
        to: 'demoActions',
        points: [
            [320, 852],
            [370, 852],
        ],
    },
    {
        from: 'demoActions',
        to: 'ghpages',
        points: [
            [600, 852],
            [650, 852],
        ],
    },
    {
        from: 'ghpages',
        to: 'pages',
        points: [
            [880, 852],
            [930, 852],
        ],
    },
    {
        from: 'pages',
        to: 'cfDemo',
        points: [
            [1130, 852],
            [1180, 852],
        ],
    },
];

const pathOf = (points: Array<[number, number]>) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');

function NodeShape({ node, dimmed, active }: { node: DiagramNode; dimmed: boolean; active: boolean }) {
    const { x, y, w, h } = node;
    const stroke = active ? 'var(--foreground)' : 'var(--border)';
    const dash = node.kind === 'external' ? '5 4' : undefined;
    const top = node.shape === 'cylinder' ? 14 : 0;
    const titleY = y + top + 24;

    return (
        <g style={{ opacity: dimmed ? 0.28 : 1, transition: 'opacity 150ms' }}>
            {node.shape === 'cylinder' ? (
                <>
                    <path
                        d={`M${x} ${y + 8} a${w / 2} 8 0 0 0 ${w} 0 V${y + h - 8} a${w / 2} 8 0 0 1 ${-w} 0 Z`}
                        fill="var(--card)"
                        stroke={stroke}
                        strokeWidth={active ? 1.5 : 1}
                    />
                    <ellipse cx={x + w / 2} cy={y + 8} rx={w / 2} ry={8} fill="var(--card)" stroke={stroke} strokeWidth={active ? 1.5 : 1} />
                </>
            ) : (
                <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={10}
                    fill="var(--card)"
                    stroke={stroke}
                    strokeWidth={active ? 1.5 : 1}
                    strokeDasharray={dash}
                />
            )}
            <circle cx={x + 16} cy={titleY - 4.5} r={4} fill={KIND_COLOR[node.kind]} />
            <text x={x + 27} y={titleY} fontSize={14} fontWeight={600} fill="var(--foreground)">
                {node.title}
            </text>
            {node.sub && (
                <text x={x + 16} y={titleY + 19} fontSize={11.5} fill="var(--muted-foreground)">
                    {node.sub}
                </text>
            )}
            {node.items?.map((item, i) => (
                <text key={item} x={x + 16} y={titleY + (node.sub ? 40 : 21) + i * 17} fontSize={11.5} fill="var(--muted-foreground)">
                    {node.items!.length > 1 && node.shape !== 'cylinder' ? `· ${item}` : item}
                </text>
            ))}
        </g>
    );
}

export default function SystemDiagram() {
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string>('laravel');
    const focus = hovered ?? selected;
    const isHovering = hovered !== null;

    const connected = useMemo(() => {
        const ids = new Set<string>([focus]);
        edges.forEach((e) => {
            if (e.from === focus) ids.add(e.to);
            if (e.to === focus) ids.add(e.from);
        });
        return ids;
    }, [focus]);

    const selectedNode = nodes.find((n) => n.id === selected) ?? nodes[0];

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {(Object.keys(KIND_LABEL) as Kind[]).map((kind) => (
                    <span key={kind} className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[kind] }} />
                        {KIND_LABEL[kind]}
                    </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-0 w-5 border-t border-dashed border-muted-foreground" /> external / optional
                </span>
                <span className="ml-auto hidden md:inline">Hover or click any box</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-background/60">
                <svg
                    viewBox="0 100 1440 815"
                    className="block w-full min-w-[1080px] select-none"
                    role="img"
                    aria-label="Sirius system architecture: clients, edge, Laravel and AI stacks, data stores, third-party services and delivery pipelines"
                    style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
                >
                    <defs>
                        <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0 0 L10 5 L0 10 z" fill="var(--muted-foreground)" />
                        </marker>
                        <marker
                            id="arch-arrow-active"
                            viewBox="0 0 10 10"
                            refX="9"
                            refY="5"
                            markerWidth="7"
                            markerHeight="7"
                            orient="auto-start-reverse"
                        >
                            <path d="M0 0 L10 5 L0 10 z" fill="var(--foreground)" />
                        </marker>
                    </defs>

                    {/* Zone captions */}
                    {[
                        ['CLIENT', 20, 214],
                        ['EDGE', 260, 146],
                        ['EXTERNAL SERVICES', 1200, 146],
                    ].map(([label, x, y]) => (
                        <text
                            key={label as string}
                            x={x as number}
                            y={y as number}
                            fontSize={10.5}
                            letterSpacing={1.5}
                            fill="var(--muted-foreground)"
                        >
                            {label}
                        </text>
                    ))}

                    {groups.map((g) => (
                        <g key={g.label}>
                            <rect
                                x={g.x}
                                y={g.y}
                                width={g.w}
                                height={g.h}
                                rx={14}
                                fill="var(--muted)"
                                fillOpacity={0.35}
                                stroke="var(--border)"
                                strokeDasharray="2 4"
                            />
                            <text x={g.x + 14} y={g.y + 20} fontSize={10.5} letterSpacing={1.5} fill="var(--muted-foreground)">
                                {g.label}
                            </text>
                        </g>
                    ))}
                    <text x={36} y={757} fontSize={10.5} letterSpacing={1.5} fill="var(--muted-foreground)">
                        PROD
                    </text>
                    <text x={36} y={857} fontSize={10.5} letterSpacing={1.5} fill="var(--muted-foreground)">
                        DEMO
                    </text>

                    {edges.map((edge) => {
                        const active = edge.from === focus || edge.to === focus;
                        return (
                            <path
                                key={`${edge.from}-${edge.to}`}
                                d={pathOf(edge.points)}
                                fill="none"
                                stroke={active ? 'var(--foreground)' : 'var(--muted-foreground)'}
                                strokeOpacity={active ? 1 : 0.75}
                                strokeWidth={active ? 1.8 : 1.3}
                                strokeDasharray={edge.dashed ? '5 4' : undefined}
                                markerEnd={`url(#${active ? 'arch-arrow-active' : 'arch-arrow'})`}
                            />
                        );
                    })}

                    {nodes.map((node) => (
                        <g
                            key={node.id}
                            onMouseEnter={() => setHovered(node.id)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => setSelected(node.id)}
                            className="cursor-pointer"
                        >
                            <NodeShape node={node} dimmed={isHovering && !connected.has(node.id)} active={node.id === focus} />
                        </g>
                    ))}

                    {edges
                        .filter((e) => e.label && e.labelAt)
                        .map((edge) => {
                            const active = edge.from === focus || edge.to === focus;
                            return (
                                <text
                                    key={`label-${edge.from}-${edge.to}`}
                                    x={edge.labelAt![0]}
                                    y={edge.labelAt![1] + 4}
                                    textAnchor="middle"
                                    fontSize={10.5}
                                    fill={active ? 'var(--foreground)' : 'var(--muted-foreground)'}
                                    stroke="var(--background)"
                                    strokeWidth={5}
                                    paintOrder="stroke"
                                    className="pointer-events-none"
                                >
                                    {edge.label}
                                </text>
                            );
                        })}
                </svg>
            </div>

            <div className="mt-4 grid gap-4 rounded-xl border border-border p-5 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: KIND_COLOR[selectedNode.kind] }} />
                        <span className="text-xs tracking-wide text-muted-foreground uppercase">{KIND_LABEL[selectedNode.kind]}</span>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{selectedNode.title}</h3>
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{selectedNode.detail}</p>
                </div>
                {selectedNode.files && (
                    <ul className="space-y-1 md:text-right">
                        {selectedNode.files.map((file) => (
                            <li key={file} className={cn('font-mono text-xs text-muted-foreground')}>
                                {file}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
