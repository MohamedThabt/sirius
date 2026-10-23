/**
 * Content for the "How Sirius is built" page (pages/architecture.tsx).
 * Every claim maps to code in this repository; file paths are listed so readers can verify them.
 */
import {
    Bot,
    Boxes,
    Braces,
    CloudCog,
    Code2,
    Cpu,
    Database,
    FileCheck2,
    GitBranch,
    Github,
    Layers,
    LayoutTemplate,
    Lock,
    MessagesSquare,
    Monitor,
    Network,
    PenTool,
    RefreshCw,
    Route,
    ScrollText,
    ShieldCheck,
    Sparkles,
    Timer,
    Wallet,
    Workflow,
    type LucideIcon,
} from 'lucide-react';

export type Accent = 'sky' | 'rose' | 'emerald' | 'amber' | 'violet';

/** Literal class strings so Tailwind can see them. */
export const accentClasses: Record<Accent, { text: string; bg: string; border: string; ring: string; dot: string; glow: string }> = {
    sky: {
        text: 'text-sky-600 dark:text-sky-400',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        ring: 'ring-sky-500/40',
        dot: 'bg-sky-500',
        glow: 'from-sky-500/20',
    },
    rose: {
        text: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        ring: 'ring-rose-500/40',
        dot: 'bg-rose-500',
        glow: 'from-rose-500/20',
    },
    emerald: {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        ring: 'ring-emerald-500/40',
        dot: 'bg-emerald-500',
        glow: 'from-emerald-500/20',
    },
    amber: {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        ring: 'ring-amber-500/40',
        dot: 'bg-amber-500',
        glow: 'from-amber-500/20',
    },
    violet: {
        text: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        ring: 'ring-violet-500/40',
        dot: 'bg-violet-500',
        glow: 'from-violet-500/20',
    },
};

export const heroStats = [
    { value: '2', label: 'services', detail: 'Laravel app + FastAPI AI service' },
    { value: '30+', label: 'AI endpoints', detail: 'generate, edit and sync per artifact' },
    { value: '9', label: 'artifact types', detail: 'overview → wireframes' },
    { value: '2', label: 'LangGraph agents', detail: 'with SQLite checkpoints' },
];

// ---------------------------------------------------------------------------
// System map
// ---------------------------------------------------------------------------

export interface SystemNode {
    id: string;
    layer: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    accent: Accent;
    satellites: string[];
    responsibilities: string[];
    files: string[];
}

export const systemNodes: SystemNode[] = [
    {
        id: 'client',
        layer: 'Client',
        title: 'React 19 SPA',
        subtitle: 'Inertia.js v2 · TypeScript · Tailwind v4',
        icon: Monitor,
        accent: 'sky',
        satellites: ['React Flow canvases', 'Mermaid + Monaco', 'Excalidraw board'],
        responsibilities: [
            'Server-driven routing: every page is a React component that receives typed props from a Laravel controller — no separate REST layer for page data.',
            'Rich editors for each artifact: ERD and C4 canvases on React Flow, Mermaid sequence diagrams with a Monaco code pane, a JSON-schema wireframe renderer and an Excalidraw brainstorming board.',
            'Long AI jobs render the page first in an "isGenerating" state, then call a generate-async endpoint so the UI never blocks on the model.',
        ],
        files: ['laravel/resources/js/pages', 'laravel/resources/js/components/database-designer', 'laravel/resources/js/components/c4-diagram'],
    },
    {
        id: 'laravel',
        layer: 'Application',
        title: 'Laravel 12',
        subtitle: 'Controllers · Middleware · Queues',
        icon: Layers,
        accent: 'rose',
        satellites: ['MySQL / PostgreSQL', 'Queue workers', 'GitHub API'],
        responsibilities: [
            'Owns users, projects, modules, features, versions and team roles; authorizes every request (owner / admin / developer / viewer).',
            'Builds the context payload for each AI call — overview, modules, enriched features — and persists the validated result with version history.',
            'Meters AI usage: a check.credits middleware blocks calls when the balance is empty (HTTP 402 → upgrade modal) and every call is logged with its credit cost.',
            'Exports the finished spec to GitHub: connects via GitHub OAuth, creates or links a repository and pushes the generated docs.',
        ],
        files: [
            'laravel/app/Http/Controllers',
            'laravel/app/Http/Middleware/CheckCredits.php',
            'laravel/app/Services/Github/RepoBootstrapService.php',
        ],
    },
    {
        id: 'fastapi',
        layer: 'AI service',
        title: 'FastAPI',
        subtitle: 'Generators · Agents · Validators',
        icon: Cpu,
        accent: 'emerald',
        satellites: ['Prompt library', 'SQLite checkpoints', 'Output validators'],
        responsibilities: [
            'One router per artifact (Overview, Modules, Features, PRD, ERD, Sequence, Wireframe, C4, Flow) with generate / edit / sync endpoints and Pydantic response models.',
            'Two stateful LangGraph agents — the conversational intake and the overview chat — persist their memory per thread in SQLite checkpoints.',
            'Every model response is parsed, repaired and validated (JSON extraction, Mermaid sanitising, ERD / C4 / sequence validators) before it reaches Laravel.',
            'Protected by a service-to-service bearer token and structured request logging.',
        ],
        files: ['fastAPI/src/routes/api_routes.py', 'fastAPI/src/controllers', 'fastAPI/src/utils'],
    },
    {
        id: 'llm',
        layer: 'Model gateway',
        title: 'LiteLLM proxy',
        subtitle: 'OpenAI-compatible gateway',
        icon: CloudCog,
        accent: 'amber',
        satellites: ['Gemini 2.5 Flash', 'Multi-key rotation', 'Langfuse traces'],
        responsibilities: [
            'A single OpenAI-compatible endpoint in front of several Gemini API keys, load-balancing requests and failing over when one key hits its quota.',
            'Keeps provider details out of application code: switching or adding a model is a config change, not a deploy.',
            'Forwards traces to Langfuse for prompt and latency observability.',
        ],
        files: ['fastAPI/README_PROXY.md', 'fastAPI/src/controllers/llm_proxy.py'],
    },
];

export const systemLinks = ['Inertia visits · JSON props', 'REST · Bearer token', 'OpenAI-compatible API'];

// ---------------------------------------------------------------------------
// Request lifecycle
// ---------------------------------------------------------------------------

export const lifecycle: { actor: string; accent: Accent; title: string; body: string }[] = [
    {
        actor: 'Browser',
        accent: 'sky',
        title: 'User clicks “Generate PRD”',
        body: 'Inertia sends a POST visit. No JSON API client is needed — the response is the next page.',
    },
    {
        actor: 'Laravel',
        accent: 'rose',
        title: 'Guard rails before spending tokens',
        body: 'Auth, project role and the check.credits middleware run first. The pending job is stored in the session and the PRD page renders immediately with isGenerating = true.',
    },
    {
        actor: 'Browser',
        accent: 'sky',
        title: 'Page asks for the async result',
        body: 'Once mounted, the page calls /prd/generate-async, so the slow model call never holds the navigation open.',
    },
    {
        actor: 'Laravel',
        accent: 'rose',
        title: 'Context is assembled',
        body: 'The base overview, every module and its enriched features are collected into a structured payload — the model always sees the whole project.',
    },
    {
        actor: 'FastAPI',
        accent: 'emerald',
        title: 'Prompt + model call',
        body: 'The PRD router loads its prompt template, calls the model through LiteLLM and asks for a schema-shaped response.',
    },
    {
        actor: 'FastAPI',
        accent: 'emerald',
        title: 'Parse, repair, validate',
        body: 'JSON is extracted even from chatty output, double-encoded strings are unwrapped and Mermaid blocks are sanitised before returning a Pydantic model.',
    },
    {
        actor: 'Laravel',
        accent: 'rose',
        title: 'Persist and meter',
        body: 'The PRD is saved as a new version, usage is logged and credits are deducted in the same request.',
    },
    {
        actor: 'Browser',
        accent: 'sky',
        title: 'Rendered as a living document',
        body: 'Markdown with GFM tables and inline Mermaid diagrams, editable by hand or by asking the AI for targeted changes.',
    },
];

// ---------------------------------------------------------------------------
// Generation pipeline
// ---------------------------------------------------------------------------

export const pipeline: { step: string; title: string; body: string; href: string; icon: LucideIcon }[] = [
    {
        step: '01',
        title: 'Intake',
        body: 'Conversational agent turns a vague idea into a structured brief.',
        href: '/projects/3/prepare',
        icon: MessagesSquare,
    },
    {
        step: '02',
        title: 'System overview',
        body: 'Versioned overview, refined through an intent-routed chat.',
        href: '/projects/1/system-overview',
        icon: ScrollText,
    },
    {
        step: '03',
        title: 'Technical details',
        body: 'Platforms, stack, data stores and external services.',
        href: '/projects/1/technology',
        icon: Code2,
    },
    { step: '04', title: 'Modules', body: 'DDD-style bounded contexts with metrics and their own ERD.', href: '/projects/1/modules', icon: Boxes },
    {
        step: '05',
        title: 'Features',
        body: 'Acceptance criteria, user flows and success metrics per feature.',
        href: '/projects/1/modules/13/features/108',
        icon: Sparkles,
    },
    {
        step: '06',
        title: 'Feature artifacts',
        body: 'Data model, sequence diagram and multi-screen wireframe.',
        href: '/features/108/wireframe',
        icon: LayoutTemplate,
    },
    { step: '07', title: 'PRD', body: 'Generated from everything above, then kept in sync.', href: '/projects/1/prd', icon: FileCheck2 },
    { step: '08', title: 'Architecture & data', body: 'C4 system context and a merged project-wide ERD.', href: '/projects/1/c4', icon: Network },
    { step: '09', title: 'GitHub export', body: 'Specs pushed to a repo, ready for AI code generators.', href: '/projects/1', icon: Github },
];

// ---------------------------------------------------------------------------
// LangGraph agents
// ---------------------------------------------------------------------------

export interface AgentLevel {
    nodes: { name: string; edge?: string; terminal?: boolean }[];
}

export const agents: { name: string; endpoint: string; summary: string; accent: Accent; levels: AgentLevel[]; notes: string[] }[] = [
    {
        name: 'Project intake agent',
        endpoint: 'POST /v1/chat/intake',
        summary: 'Interviews the user until the brief is complete, answering side questions without losing its place.',
        accent: 'violet',
        levels: [
            { nodes: [{ name: 'guardrails' }] },
            {
                nodes: [
                    { name: 'guardrails_response', edge: 'off-topic' },
                    { name: 'intent_classifier', edge: 'on-topic' },
                ],
            },
            {
                nodes: [
                    { name: 'qna_handler', edge: 'user asks' },
                    { name: 'extractor', edge: 'user answers' },
                ],
            },
            {
                nodes: [
                    { name: 'question_generator', edge: 'gaps left' },
                    { name: 'summary_generator', edge: 'brief complete' },
                ],
            },
            { nodes: [{ name: 'summarize_messages' }] },
            { nodes: [{ name: 'END', terminal: true }] },
        ],
        notes: [
            'Guardrails reject off-topic prompts before any extraction runs',
            'Extracted fields accumulate in typed state across turns',
            'Thread memory survives restarts via SqliteSaver',
        ],
    },
    {
        name: 'Overview chat agent',
        endpoint: 'POST /v1/chat/generate-intent',
        summary: 'Decides whether a message is a question or an edit request, and only rewrites the overview when it should.',
        accent: 'emerald',
        levels: [
            { nodes: [{ name: 'mode_router' }] },
            {
                nodes: [
                    { name: 'ask_chatbot', edge: 'ask mode' },
                    { name: 'intent_router', edge: 'agent mode' },
                ],
            },
            {
                nodes: [
                    { name: 'extract_engineer_notes', edge: 'edit intent' },
                    { name: 'chatbot', edge: 'chat intent' },
                ],
            },
            { nodes: [{ name: 'summarize_messages' }] },
            { nodes: [{ name: 'END', terminal: true }] },
        ],
        notes: [
            'Edits produce a new overview version, never an in-place overwrite',
            'Engineer notes are distilled before the rewrite',
            'Long chats are summarised to stay inside the context window',
        ],
    },
];

// ---------------------------------------------------------------------------
// Reliability
// ---------------------------------------------------------------------------

export const safeguards: { icon: LucideIcon; title: string; body: string; file: string }[] = [
    {
        icon: Braces,
        title: 'JSON repair',
        body: 'Extracts JSON from fenced or chatty replies and unwraps double-encoded strings before validation.',
        file: 'utils/json_utils.py',
    },
    {
        icon: ShieldCheck,
        title: 'Diagram validators',
        body: 'Dedicated validators for ERD, C4 and sequence output reject diagrams that would not render.',
        file: 'utils/*_validator.py',
    },
    {
        icon: PenTool,
        title: 'Mermaid sanitising',
        body: 'Normalises Mermaid on both sides so diagrams also render on GitHub after export.',
        file: 'MermaidSanitizerService.php',
    },
    {
        icon: RefreshCw,
        title: 'Fallbacks',
        body: 'A fallback service returns safe, structured defaults when generation fails mid-flow.',
        file: 'services/fallback_service.py',
    },
    {
        icon: Route,
        title: 'Key rotation',
        body: 'LiteLLM balances across API keys and fails over on quota errors.',
        file: 'configllm.yaml',
    },
    {
        icon: Wallet,
        title: 'Credit metering',
        body: 'Middleware blocks spend at zero balance; every AI call is logged with model and cost.',
        file: 'CheckCredits.php · AiUsageService.php',
    },
    {
        icon: Timer,
        title: 'Async generation',
        body: 'Render-then-generate keeps requests short and avoids gateway timeouts on long prompts.',
        file: '*Controller::generateAsync',
    },
    {
        icon: Lock,
        title: 'Service auth & tracing',
        body: 'Bearer token between services, request IDs in structured logs, Nightwatch and Pulse in production.',
        file: 'security/auth.py · RequestId.php',
    },
];

// ---------------------------------------------------------------------------
// Editors
// ---------------------------------------------------------------------------

export const editors: { icon: LucideIcon; title: string; body: string; href: string; tags: string[] }[] = [
    {
        icon: Database,
        title: 'Database designer',
        body: 'Interactive ERD canvas with auto-layout, search and export. Converts between Mermaid and DBML.',
        href: '/projects/1/erd',
        tags: ['React Flow', 'DBML', 'Mermaid'],
    },
    {
        icon: Network,
        title: 'C4 architecture',
        body: 'System-context diagrams generated as JSON and laid out as a navigable canvas.',
        href: '/projects/1/c4',
        tags: ['React Flow', 'JSON schema'],
    },
    {
        icon: Workflow,
        title: 'Sequence diagrams',
        body: 'Monaco code pane with a live Mermaid preview, zoom and PNG export.',
        href: '/features/108/sequence-diagram',
        tags: ['Monaco', 'Mermaid'],
    },
    {
        icon: LayoutTemplate,
        title: 'Wireframe renderer',
        body: 'Multi-screen wireframes rendered from a JSON schema with 30+ node types.',
        href: '/features/108/wireframe',
        tags: ['JSON → React', 'Screens'],
    },
    {
        icon: Bot,
        title: 'AI-edited documents',
        body: 'Overview and PRD with version history and chat-driven edits.',
        href: '/projects/1/system-overview',
        tags: ['Versions', 'Markdown', 'GFM'],
    },
    {
        icon: Sparkles,
        title: 'Brainstorming board',
        body: 'Free-form Excalidraw canvas saved per project.',
        href: '/projects/1/brainstorming',
        tags: ['Excalidraw'],
    },
];

// ---------------------------------------------------------------------------
// Stack & delivery
// ---------------------------------------------------------------------------

export const stack: { group: string; accent: Accent; items: string[] }[] = [
    {
        group: 'Frontend',
        accent: 'sky',
        items: [
            'React 19',
            'TypeScript',
            'Inertia.js 2',
            'Tailwind CSS 4',
            'Radix UI / shadcn',
            'Framer Motion',
            'React Flow',
            'Mermaid',
            'Monaco',
            'Excalidraw',
        ],
    },
    {
        group: 'Application',
        accent: 'rose',
        items: ['PHP 8.2', 'Laravel 12', 'Sanctum', 'Socialite (Google)', 'Queues', 'Wayfinder', 'Pulse', 'Nightwatch'],
    },
    {
        group: 'AI',
        accent: 'emerald',
        items: ['Python', 'FastAPI', 'Pydantic', 'LangGraph', 'LangChain Core', 'LiteLLM', 'Gemini 2.5 Flash', 'Langfuse'],
    },
    {
        group: 'Data & infra',
        accent: 'amber',
        items: ['MySQL / PostgreSQL', 'Redis', 'SQLite checkpoints', 'Docker', 'Nginx + PHP-FPM', 'GitHub Actions', 'GHCR', 'Dokploy'],
    },
];

export const delivery: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: GitBranch, title: 'Push to main', body: 'Separate workflows for the Laravel and FastAPI services.' },
    { icon: Boxes, title: 'Docker builds', body: 'Multi-stage images; Wayfinder routes generated at build time.' },
    { icon: Github, title: 'GHCR', body: 'Images tagged by branch and commit SHA.' },
    { icon: CloudCog, title: 'Dokploy redeploy', body: 'Compose stack: Nginx, PHP-FPM, Nightwatch agent.' },
];
