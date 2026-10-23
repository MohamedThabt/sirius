/**
 * Props the real backend computes on the fly (markdown exports, AI suggestions,
 * usage stats), reproduced from the mock data.
 */
import type { FeatureItem, FeatureSuggestion, ModuleSuggestion } from '@/types/modules';
import type { DemoProject } from './projects';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Mirrors FeatureMarkdownService::formatProjectFeaturesToMarkdown. */
export function buildFeaturesMarkdown(owner: DemoProject): string {
    const lines: string[] = [];
    let counter = 1;

    for (const mod of owner.modules) {
        if (!mod.features?.length) continue;
        lines.push(`## Module: ${mod.name}`, `*${mod.description}*`, '');

        for (const feature of mod.features) {
            lines.push(`### FR-${counter++} ${feature.name}`, '', `**Priority:** ${capitalize(feature.priority)}`, '');
            if (feature.description) lines.push(feature.description, '');
            if (feature.acceptance_criteria) lines.push('**Acceptance Criteria:**', '', feature.acceptance_criteria, '');
            if (feature.user_flows) lines.push('**User Flow:**', '', feature.user_flows, '');
        }
    }

    return lines.join('\n');
}

/** Mirrors FeatureSpecService::generateSpecsMarkdown. */
export function buildSpecsMarkdown(feature: FeatureItem): string {
    const lines = [`# ${feature.name}`, '', `**Order of Implementation:** ${feature.order_of_implementation}`];
    const section = (title: string, body?: string | null) => {
        if (body?.trim()) lines.push('', `## ${title}`, '', body.trim());
    };
    const diagram = (title: string, body?: string | null) => {
        if (body?.trim()) lines.push('', `## ${title}`, '', '```mermaid', body.trim(), '```');
    };

    section('Summary', feature.summary);
    section('Description', feature.description);
    section('Acceptance Criteria', feature.acceptance_criteria);
    section('Priority', capitalize(feature.priority));
    section('Metrics', feature.metrics);
    section('User Journey', feature.user_flows);
    diagram('Database Schema', feature.datamodel);
    diagram('Sequence Diagram', feature.sequence_diagram);

    return lines.join('\n');
}

/** Example output of the "Generate modules" AI step. */
export const moduleSuggestions: ModuleSuggestion[] = [
    {
        name: 'Reviews & Ratings',
        description: 'Verified-purchase reviews with star ratings, photos and vendor replies.',
        metrics: 'Share of orders with a review above 15%',
    },
    {
        name: 'Wishlist',
        description: 'Shoppers save products for later and get notified about price drops.',
        metrics: 'Wishlist-to-purchase conversion above 8%',
    },
    {
        name: 'Admin Back Office',
        description: 'Vendor approval, catalog moderation and platform-wide reporting.',
        metrics: 'Vendor approval time under 24 hours',
    },
];

/** Example output of the "Generate features" AI step. */
export const featureSuggestions: FeatureSuggestion[] = [
    {
        name: 'Social Login',
        description: 'Sign in with Google or Apple in one click.',
        summary: 'OAuth login for faster onboarding.',
        priority: 'medium',
    },
    {
        name: 'Two-Factor Authentication',
        description: 'Optional TOTP-based second factor for vendors and admins.',
        summary: 'Extra security for privileged accounts.',
        priority: 'high',
    },
    {
        name: 'Account Deletion',
        description: 'Self-service account deletion that satisfies GDPR erasure requests.',
        summary: 'GDPR-compliant data removal.',
        priority: 'low',
    },
];

const USAGE_ACTIONS = ['System Overview', 'PRD Generation', 'Module Suggestions', 'Feature ERD', 'Sequence Diagram', 'Wireframe', 'C4 Diagram'];

/** Props for settings/usage (UsageController::index). */
export function usageProps(page: number) {
    const today = new Date();
    const graphData = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (29 - index));
        return { date: date.toISOString().slice(0, 10), credits: [0, 2, 5, 3, 8, 1, 4][index % 7] };
    });

    const allLogs = Array.from({ length: 24 }, (_, index) => {
        const created = new Date(today);
        created.setHours(today.getHours() - index * 9);
        return {
            id: 1000 - index,
            action_type: USAGE_ACTIONS[index % USAGE_ACTIONS.length],
            model: 'claude-sonnet',
            credits_used: (index % 4) + 1,
            cost: null,
            created_at: created.toISOString(),
        };
    });

    const perPage = 10;
    const lastPage = Math.ceil(allLogs.length / perPage);
    const current = Math.min(Math.max(page || 1, 1), lastPage);

    return {
        credits: { total: 500, remaining: 420, used: 80, percentage_used: 16, days_until_reset: 12 },
        plan: { name: 'Pro', slug: 'pro', price: 19 },
        subscription: { id: 1, status: 'active', started_at: '2025-10-01T09:00:00.000Z', ends_at: null },
        graphData,
        usageLogs: {
            data: allLogs.slice((current - 1) * perPage, current * perPage),
            current_page: current,
            last_page: lastPage,
            per_page: perPage,
            total: allLogs.length,
        },
        totalConsumedCredits: 80,
    };
}
