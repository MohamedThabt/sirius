export interface Attachment {
    type: 'file' | 'repo';
    id: string;
    name: string;
    status: 'pending' | 'processed' | 'failed';
}

export interface ClarificationOption {
    id: string;
    label: string;
}

export interface ClarificationQuestion {
    id: string;
    text: string;
    selection_mode: 'single' | 'multiple';
    recommended_option_id: string | null;
    options: ClarificationOption[];
    allow_custom_text: boolean;
}

export interface ClarificationAnswer {
    question_id: string;
    selected_option_ids: string[];
    custom_text: string | null;
}

export interface BriefMessage {
    id: string;
    client_message_id: string;
    role: 'user' | 'agent' | 'system';
    kind: 'text' | 'attachments' | 'clarification' | 'clarification_answer' | 'ready' | 'system';
    content: string;
    attachments?: Attachment[];
    clarification?: { questions: ClarificationQuestion[] };
    answers?: ClarificationAnswer[];
    in_reply_to_message_id?: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

export interface BriefContext {
    version: number;
    summary: string;
    requirements: string[];
    constraints: string[];
    sources: { type: string; ref_id: string; excerpt: string }[];
    open_questions: string[];
    updated_at: string;
}

export function createMockClarificationResponse(userMessageContent: string): BriefMessage {
    return {
        id: crypto.randomUUID(),
        client_message_id: crypto.randomUUID(),
        role: 'agent',
        kind: 'clarification',
        content: "Thanks for the project brief! I have a few questions to make sure I capture your vision accurately before generating documentation.",
        clarification: {
            questions: [
                {
                    id: 'q1',
                    text: 'Who are the primary users of this application?',
                    selection_mode: 'single',
                    recommended_option_id: 'q1_opt_a',
                    options: [
                        { id: 'q1_opt_a', label: 'End consumers (B2C)' },
                        { id: 'q1_opt_b', label: 'Business users (B2B)' },
                        { id: 'q1_opt_c', label: 'Internal team members' },
                    ],
                    allow_custom_text: true,
                },
                {
                    id: 'q2',
                    text: 'Which platforms should the first version support?',
                    selection_mode: 'multiple',
                    recommended_option_id: 'q2_opt_web',
                    options: [
                        { id: 'q2_opt_web', label: 'Web application' },
                        { id: 'q2_opt_ios', label: 'iOS native' },
                        { id: 'q2_opt_android', label: 'Android native' },
                        { id: 'q2_opt_desktop', label: 'Desktop (Electron)' },
                    ],
                    allow_custom_text: false,
                },
                {
                    id: 'q3',
                    text: "What's the expected user scale at launch?",
                    selection_mode: 'single',
                    recommended_option_id: null,
                    options: [
                        { id: 'q3_opt_a', label: 'Under 100 users (internal/beta)' },
                        { id: 'q3_opt_b', label: '100–1,000 users (early adopters)' },
                        { id: 'q3_opt_c', label: '1,000–10,000 users (growth stage)' },
                        { id: 'q3_opt_d', label: '10,000+ users (scale)' },
                    ],
                    allow_custom_text: true,
                },
            ],
        },
        status: 'completed',
        created_at: new Date().toISOString(),
    };
}

export function createMockReadyResponse(): BriefMessage {
    return {
        id: crypto.randomUUID(),
        client_message_id: crypto.randomUUID(),
        role: 'agent',
        kind: 'ready',
        content: `Great, I have enough context to generate your project documentation. Here's a summary of what I've captured:

**Project Type:** Web application targeting end consumers

**Key Features Identified:**
- User authentication and profiles
- Core application workflow
- Dashboard and analytics
- Notification system

**Technical Context:**
- Web-first platform (responsive)
- Expected to handle moderate traffic at launch
- Standard authentication and authorization patterns

**Next Steps:** I'll generate your System Overview, which will include the high-level architecture, key modules, and technology recommendations. You can review and refine it from there.`,
        status: 'completed',
        created_at: new Date().toISOString(),
    };
}

export function createMockContext(userBrief: string): BriefContext {
    return {
        version: 1,
        summary: userBrief.length > 30
            ? userBrief.slice(0, 200) + (userBrief.length > 200 ? '...' : '')
            : 'A modern web application focused on delivering a streamlined user experience with real-time features and scalable architecture.',
        requirements: [
            'User registration and authentication with OAuth providers',
            'Real-time collaboration workflow engine',
            'Analytics dashboard with key business metrics',
            'Push notification system across channels',
            'Role-based admin management panel',
        ],
        constraints: [
            'Web-first responsive design with mobile parity',
            'OWASP Top 10 security compliance',
            'GDPR-compliant data handling and retention',
        ],
        sources: [
            {
                type: 'user',
                ref_id: 'initial-brief',
                excerpt: userBrief.slice(0, 120) || 'Initial project brief submitted by user',
            },
            {
                type: 'file',
                ref_id: 'spec-doc',
                excerpt: 'Technical requirements document with architecture guidelines',
            },
        ],
        open_questions: [],
        updated_at: new Date().toISOString(),
    };
}
