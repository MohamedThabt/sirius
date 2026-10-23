/**
 * Content for the "How Sirius is built" page (pages/architecture.tsx).
 * Every claim maps to code or config in this repository.
 */

export const summary = [
    { label: 'Frontend', value: 'React 19 · Inertia 2 · TypeScript' },
    { label: 'Backend', value: 'Laravel 12 · PHP 8.2 · PostgreSQL' },
    { label: 'AI', value: 'FastAPI · LangGraph · LiteLLM → Gemini' },
    { label: 'Hosting', value: 'Docker · Dokploy · Cloudflare' },
];

// ---------------------------------------------------------------------------
// Request lifecycle: "Generate PRD"
// ---------------------------------------------------------------------------

export const lifecycle: { actor: string; title: string; body: string }[] = [
    { actor: 'Browser', title: 'Click “Generate PRD”', body: 'Inertia sends a POST visit; the response is the next page, not JSON.' },
    {
        actor: 'Laravel',
        title: 'Check before spending tokens',
        body: 'Auth, project role and the check.credits middleware run first. The job is parked in the session and the page renders immediately in a generating state.',
    },
    {
        actor: 'Browser',
        title: 'Request the result',
        body: 'The mounted page calls /prd/generate-async, so the slow model call never blocks navigation.',
    },
    {
        actor: 'Laravel',
        title: 'Assemble context',
        body: 'Base overview, modules and enriched features are packed into one payload, so the model always sees the whole project.',
    },
    {
        actor: 'FastAPI',
        title: 'Prompt and call',
        body: 'The PRD router loads its prompt and calls the model through LiteLLM with a schema-shaped response.',
    },
    {
        actor: 'FastAPI',
        title: 'Parse, repair, validate',
        body: 'JSON is extracted from chatty output, double-encoded strings are unwrapped and Mermaid is sanitised before a Pydantic model is returned.',
    },
    {
        actor: 'Laravel',
        title: 'Persist and meter',
        body: 'The PRD is saved as a new version, the call is logged with its model and cost, and credits are deducted.',
    },
    { actor: 'Browser', title: 'Render', body: 'Markdown with tables and inline Mermaid, editable by hand or through targeted AI edits.' },
];

// ---------------------------------------------------------------------------
// Generation pipeline (each step links into the demo)
// ---------------------------------------------------------------------------

export const pipeline: { title: string; body: string; href: string }[] = [
    { title: 'Brief intake', body: 'Conversational agent turns an idea into a structured brief.', href: '/projects/3/brief-intake' },
    { title: 'System overview', body: 'Versioned overview refined through an intent-routed chat.', href: '/projects/1/system-overview' },
    { title: 'Technical details', body: 'Platforms, stack, data stores and external services.', href: '/projects/1/technology' },
    { title: 'Modules', body: 'Bounded contexts with metrics and their own ERD.', href: '/projects/1/modules' },
    { title: 'Features', body: 'Acceptance criteria, user flows and success metrics.', href: '/projects/1/modules/13/features/108' },
    { title: 'Feature artifacts', body: 'Data model, sequence diagram and multi-screen wireframe.', href: '/features/108/wireframe' },
    { title: 'PRD', body: 'Generated from everything above and kept in sync.', href: '/projects/1/prd' },
    { title: 'Architecture & data', body: 'C4 system context and a merged project-wide ERD.', href: '/projects/1/c4' },
    { title: 'GitHub export', body: 'Specs pushed to a repository for AI code generators.', href: '/projects/1' },
];

// ---------------------------------------------------------------------------
// LangGraph agents
// ---------------------------------------------------------------------------

export interface AgentLevel {
    nodes: { name: string; edge?: string; terminal?: boolean }[];
}

export const agents: { name: string; endpoint: string; summary: string; levels: AgentLevel[]; notes: string[] }[] = [
    {
        name: 'Brief intake agent',
        endpoint: 'POST /v1/chat/intake',
        summary: 'Interviews the user until the brief is complete and answers side questions without losing its place.',
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
                    { name: 'qna_handler', edge: 'asks' },
                    { name: 'extractor', edge: 'answers' },
                ],
            },
            {
                nodes: [
                    { name: 'question_generator', edge: 'gaps left' },
                    { name: 'summary_generator', edge: 'complete' },
                ],
            },
            { nodes: [{ name: 'summarize_messages' }] },
            { nodes: [{ name: 'END', terminal: true }] },
        ],
        notes: [
            'Off-topic messages never reach extraction',
            'Extracted fields accumulate in typed state',
            'Thread state persists in SQLite checkpoints',
        ],
    },
    {
        name: 'Overview chat agent',
        endpoint: 'POST /v1/chat/generate-intent',
        summary: 'Decides whether a message is a question or an edit, and only rewrites the overview when it should.',
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
                    { name: 'extract_engineer_notes', edge: 'edit' },
                    { name: 'chatbot', edge: 'chat' },
                ],
            },
            { nodes: [{ name: 'summarize_messages' }] },
            { nodes: [{ name: 'END', terminal: true }] },
        ],
        notes: [
            'Edits create a new version, never an overwrite',
            'Long chats are summarised to fit the context window',
            'Thread state persists in SQLite checkpoints',
        ],
    },
];

// ---------------------------------------------------------------------------
// Reliability
// ---------------------------------------------------------------------------

export const safeguards: { concern: string; mechanism: string; where: string }[] = [
    {
        concern: 'Malformed model output',
        mechanism: 'JSON extracted from fenced or chatty replies; double-encoded strings unwrapped',
        where: 'fastAPI/src/utils/json_utils.py',
    },
    {
        concern: 'Diagrams that will not render',
        mechanism: 'Dedicated ERD, C4 and sequence validators; Mermaid sanitised for GitHub',
        where: 'utils/*_validator.py · MermaidSanitizerService',
    },
    {
        concern: 'Generation failures',
        mechanism: 'Fallback service returns safe structured defaults',
        where: 'fastAPI/src/services/fallback_service.py',
    },
    { concern: 'Provider quotas', mechanism: 'LiteLLM balances across seven keys and fails over', where: 'fastAPI/src/configllm.yaml' },
    {
        concern: 'Runaway spend',
        mechanism: 'Credit middleware blocks calls at zero (HTTP 402); every call logged with cost',
        where: 'CheckCredits.php · AiUsageService.php',
    },
    { concern: 'Slow requests', mechanism: 'Render first, generate async: no long-held navigation requests', where: '*Controller::generateAsync' },
    {
        concern: 'Service-to-service trust',
        mechanism: 'Shared bearer token from the environment, constant-time compare',
        where: 'fastAPI/src/security/auth.py',
    },
    {
        concern: 'Observability',
        mechanism: 'Request IDs in structured logs, Nightwatch and Pulse, FastAPI logs & health API',
        where: 'RequestId.php · /v1/logs · /v1/health',
    },
];

// ---------------------------------------------------------------------------
// Stack inventory (versions from package.json, composer.json, requirements.txt)
// ---------------------------------------------------------------------------

export const stack: { layer: string; items: string[] }[] = [
    {
        layer: 'Frontend',
        items: [
            'React 19',
            'Inertia.js 2',
            'TypeScript 5.7',
            'Vite 7',
            'Tailwind CSS 4',
            'Radix UI / shadcn',
            'Framer Motion 12',
            'React Flow 12',
            'Mermaid 11',
            'Monaco',
            'Excalidraw 0.18',
            'Zod',
        ],
    },
    {
        layer: 'Application',
        items: ['PHP 8.2', 'Laravel 12', 'Sanctum 4', 'Socialite (Google, GitHub)', 'Wayfinder', 'Pulse', 'Nightwatch', 'Resend'],
    },
    {
        layer: 'AI service',
        items: ['Python', 'FastAPI 0.121', 'Pydantic', 'LangGraph 1.0', 'LangChain Core 1.2', 'LiteLLM 1.80', 'Gemini 2.5 Flash', 'Cerebras'],
    },
    { layer: 'Data', items: ['PostgreSQL', 'Database queue, cache & sessions', 'SQLite (agent checkpoints)', 'Docker volumes'] },
    {
        layer: 'Delivery & ops',
        items: ['Docker (multi-stage)', 'GitHub Actions', 'GHCR', 'Dokploy', 'Nginx + PHP-FPM', 'Cloudflare', 'GitHub Pages (demo)'],
    },
    {
        layer: 'Integrations',
        items: ['GitHub API', 'Google OAuth', 'Resend', 'Telegram Bot API', 'Cloudflare Turnstile', 'PostHog', 'Google Analytics 4'],
    },
];
