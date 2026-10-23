/**
 * In-browser replacement for the Laravel backend used by the static demo.
 *
 * resolveVisit(url) returns the Inertia page object ({ component, props, url })
 * that the real controllers would render for a GET request, built from the mock
 * data in ./data. Authentication is removed: every visitor is the demo user and
 * every project page is reachable.
 */
import type { Sections } from '@/types';
import type { FeatureItem, ModuleItem } from '@/types/modules';
import { buildFeaturesMarkdown, buildSpecsMarkdown, featureSuggestions, moduleSuggestions, usageProps } from './data/derived';
import { demoProjects, demoUser, findFeature, findProject, pendingInvitations, teammates, type DemoProject } from './data/projects';

export const DEMO_READ_ONLY_MESSAGE = 'This is a read-only demo — changes and AI generation are disabled.';

type Props = Record<string, unknown>;
type Result = { component: string; props: Props } | { redirect: string };

interface InertiaPage {
    component: string;
    props: Props & { errors: Record<string, never> };
    url: string;
    version: string | null;
    clearHistory: boolean;
    encryptHistory: boolean;
    rememberedState: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Shared props (HandleInertiaRequests + ShareProjectData middleware)
// ---------------------------------------------------------------------------

function readSidebarCookie(): boolean {
    const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]*)/);
    return !match || match[1] === 'true';
}

function sharedProps(owner?: DemoProject): Props {
    return {
        name: 'Sirius',
        quote: { message: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
        auth: { user: demoUser, admin: null },
        userCredits: { balance: 420, total: 500, used: 80, daysUntilReset: 12 },
        sidebarOpen: readSidebarCookie(),
        flash: {},
        ...(owner
            ? {
                  currentProject: { id: owner.project.id, name: owner.project.name, status: owner.project.status },
                  repository: null,
              }
            : {}),
    };
}

// ---------------------------------------------------------------------------
// Per-project helpers
// ---------------------------------------------------------------------------

function sectionsFor(owner: DemoProject): Sections {
    const p = owner.project;
    return {
        overview: p.overview || null,
        prd: owner.prd,
        data_modeling: p.erd ?? null,
        wireframes: null,
        technical_details: p.technical_details || null,
        user_stories: null,
        non_functional_requirements: p.non_functional_requirements || null,
    };
}

function overviewVersionsFor(owner: DemoProject) {
    const last = owner.overviewVersions.length - 1;
    return owner.overviewVersions.map((v, index) => ({
        id: owner.project.id * 100 + index + 1,
        project_id: owner.project.id,
        overview: v.overview,
        version_number: index + 1,
        is_base_version: index === last,
        user_prompt: v.user_prompt,
        created_at: v.created_at,
        updated_at: v.created_at,
    }));
}

function prdVersionsFor(owner: DemoProject) {
    const prd = owner.prd;
    if (!prd) return [];
    return [
        {
            id: 0,
            project_id: owner.project.id,
            prd_content: prd,
            version_number: 1,
            is_base_version: true,
            user_prompt: null,
            created_at: owner.project.created_at,
            updated_at: owner.project.updated_at,
        },
    ];
}

function membersFor(owner: DemoProject) {
    return [
        { id: demoUser.id, name: demoUser.name, email: demoUser.email, avatar: demoUser.avatar, role: 'owner', joined_at: owner.project.created_at },
        ...teammates.filter((t) => owner.memberIds.includes(t.id)),
    ];
}

const withoutFeatures = (mod: ModuleItem) => ({ ...mod, features: undefined });

/** Sidebar project list some pages read from props. */
const sidebarProjects = () => demoProjects.map(({ project: p }) => ({ id: p.id, name: p.name, status: p.status }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

type Handler = (params: Record<string, string>, query: URLSearchParams) => Result;

const notFound = (): Result => ({ component: 'Error', props: { status: 404 } });

function withProject(params: Record<string, string>, render: (owner: DemoProject) => Result): Result {
    const owner = findProject(Number(params.project));
    return owner ? render(owner) : notFound();
}

function withModule(params: Record<string, string>, render: (owner: DemoProject, mod: ModuleItem) => Result): Result {
    return withProject(params, (owner) => {
        const mod = owner.modules.find((m) => m.id === Number(params.module));
        return mod ? render(owner, mod) : notFound();
    });
}

function withFeature(params: Record<string, string>, render: (owner: DemoProject, mod: ModuleItem, feature: FeatureItem) => Result): Result {
    const match = findFeature(Number(params.feature));
    return match ? render(match.owner, match.module, match.feature) : notFound();
}

const featureUrl = (owner: DemoProject, mod: ModuleItem, feature: FeatureItem) =>
    `/projects/${owner.project.id}/modules/${mod.id}/features/${feature.id}`;

function projectPage(component: string, owner: DemoProject, extra: Props = {}): Result {
    return { component, props: { project: owner.project, sections: sectionsFor(owner), ...extra } };
}

const routes: Array<[string, Handler]> = [
    // Public pages
    ['/', () => ({ component: 'landing', props: { canLogin: true } })],
    ['/team', () => ({ component: 'team', props: {} })],
    ['/architecture', () => ({ component: 'architecture', props: {} })],
    ['/pricing', () => ({ component: 'pricing', props: {} })],

    // Auth is removed in the demo: every auth screen goes straight to the app.
    ['/login', () => ({ redirect: '/projects' })],
    ['/register', () => ({ redirect: '/projects' })],
    ['/forgot-password', () => ({ redirect: '/projects' })],
    ['/verify-email', () => ({ redirect: '/projects' })],
    ['/confirm-password', () => ({ redirect: '/projects' })],
    ['/dashboard', () => ({ redirect: '/projects' })],
    ['/upgrade/pro', () => ({ redirect: '/pricing' })],

    // Projects
    [
        '/projects',
        (_, query) => {
            const search = (query.get('search') ?? '').trim().toLowerCase();
            const projects = demoProjects
                .map((p) => p.project)
                .filter((p) => !search || p.name.toLowerCase().includes(search) || p.brief.toLowerCase().includes(search));
            return {
                component: 'Projects/Index',
                props: {
                    projects,
                    invitations: pendingInvitations,
                    ownedCount: projects.length,
                    teamCount: 0,
                    search: query.get('search') ?? '',
                    invitationsCount: pendingInvitations.length,
                },
            };
        },
    ],
    ['/projects/invitations', () => ({ component: 'Projects/Invitations', props: { invitations: pendingInvitations, projects: sidebarProjects() } })],
    ['/team/my-invitations', () => ({ redirect: '/projects/invitations' })],
    [
        '/projects/:project',
        (params) =>
            withProject(params, (owner) => {
                if (!owner.project.brief) return { redirect: `/projects/${owner.project.id}/prepare` };
                const members = membersFor(owner);
                return projectPage('Projects/Show', owner, {
                    repository: null,
                    userRole: 'owner',
                    hasTechnicalIntake: owner.technicalIntake !== null,
                    modules: owner.modules,
                    brainstormingCompleted: false,
                    teamMembers: members.slice(0, 5).map(({ id, name, email, avatar }) => ({ id, name, email, avatar })),
                    teamMembersCount: members.length,
                });
            }),
    ],
    [
        '/projects/:project/prepare',
        (params) =>
            withProject(params, (owner) => ({
                component: 'Projects/Prepare',
                props: {
                    projectId: owner.project.id,
                    projectName: owner.project.name,
                    projects: sidebarProjects(),
                },
            })),
    ],
    [
        '/projects/:project/technology',
        (params) => withProject(params, (owner) => projectPage('Projects/Technology', owner, { technicalIntake: owner.technicalIntake })),
    ],
    [
        '/projects/:project/erd',
        (params) =>
            withProject(params, (owner) => projectPage('Projects/DatabaseDesigner', owner, { initialContent: owner.project.erd ?? undefined })),
    ],
    ['/projects/:project/c4', (params) => withProject(params, (owner) => projectPage('Projects/SystemArchitecture', owner))],
    ['/projects/:project/brainstorming', (params) => withProject(params, (owner) => projectPage('Projects/Brainstorming', owner))],
    ['/projects/:project/brainstorming/scene', (params) => withProject(params, (owner) => projectPage('Projects/Brainstorming', owner))],
    [
        '/projects/:project/system-overview',
        (params) =>
            withProject(params, (owner) =>
                projectPage('Projects/SystemOverview', owner, {
                    overviewVersions: overviewVersionsFor(owner),
                    overviewChat: owner.project.overview_chat ?? [],
                    hasModules: owner.modules.length > 0,
                }),
            ),
    ],
    [
        '/projects/:project/prd',
        (params) =>
            withProject(params, (owner) =>
                projectPage('Projects/PRD', owner, {
                    prdVersions: prdVersionsFor(owner),
                    featuresMarkdown: buildFeaturesMarkdown(owner),
                }),
            ),
    ],
    [
        '/projects/:project/team',
        (params) =>
            withProject(params, (owner) => ({
                component: 'Projects/Team',
                props: {
                    project: {
                        id: owner.project.id,
                        name: owner.project.name,
                        status: owner.project.status,
                        user_id: demoUser.id,
                        progress: owner.project.progress,
                    },
                    members: membersFor(owner),
                    invitations:
                        owner.project.id === 1
                            ? [
                                  {
                                      id: 601,
                                      user: { id: 8, name: 'Karim Nabil', email: 'karim@sirius.dev', avatar: undefined },
                                      role: 'developer',
                                      invited_by: { id: demoUser.id, name: demoUser.name },
                                      invited_at: '2025-11-08T15:00:00.000Z',
                                  },
                              ]
                            : [],
                    userInvitations: [],
                    myInvitations: pendingInvitations,
                    userRole: 'owner',
                    searchedUser: null,
                },
            })),
    ],

    // Modules
    [
        '/projects/:project/modules',
        (params) => withProject(params, (owner) => ({ component: 'modules/Index', props: { project: owner.project, modules: owner.modules } })),
    ],
    [
        '/modules/create/:project',
        (params) =>
            withProject(params, (owner) => ({
                component: 'modules/ModulesSuggestion',
                props: { project: owner.project, generatedModules: moduleSuggestions, fromCache: true, repository: null },
            })),
    ],
    [
        '/projects/:project/modules/:module',
        (params) => withModule(params, (owner, mod) => ({ component: 'modules/ModuleShow', props: { project: owner.project, module: mod } })),
    ],
    [
        '/projects/:project/modules/:module/erd',
        (params) =>
            withModule(params, (owner, mod) => ({
                component: 'modules/DatabaseDesigner',
                props: { project: owner.project, module: withoutFeatures(mod), initialContent: mod.erd ?? undefined, moduleId: mod.id },
            })),
    ],

    // Features
    [
        '/projects/:project/features',
        (params) =>
            withProject(params, (owner) => ({
                component: 'features/Index',
                props: {
                    project: owner.project,
                    features: owner.modules.flatMap((m) => m.features ?? []),
                    modules: owner.modules,
                    projects: sidebarProjects(),
                },
            })),
    ],
    [
        '/projects/:project/modules/:module/features/create',
        (params) =>
            withModule(params, (owner, mod) => ({
                component: 'features/FeaturesSuggestion',
                props: {
                    project: owner.project,
                    module: withoutFeatures(mod),
                    generatedFeatures: featureSuggestions,
                    fromCache: true,
                    repository: null,
                },
            })),
    ],
    [
        '/projects/:project/modules/:module/features/:feature',
        (params) =>
            withFeature(params, (owner, mod, feature) => ({
                component: 'features/FeatureShow',
                props: { project: owner.project, module: withoutFeatures(mod), feature },
            })),
    ],
    [
        '/projects/:project/modules/:module/features/:feature/specs',
        (params) =>
            withFeature(params, (owner, mod, feature) => ({
                component: 'features/Specs',
                props: { project: owner.project, module: withoutFeatures(mod), feature, specsMarkdown: buildSpecsMarkdown(feature) },
            })),
    ],
    ['/features/:feature', (params) => withFeature(params, (owner, mod, feature) => ({ redirect: featureUrl(owner, mod, feature) }))],
    [
        '/features/:feature/datamodel',
        (params) =>
            withFeature(params, (owner, mod, feature) =>
                feature.datamodel
                    ? {
                          component: 'features/DatabaseDesigner',
                          props: { project: owner.project, feature, initialContent: feature.datamodel, featureId: feature.id },
                      }
                    : { redirect: featureUrl(owner, mod, feature) },
            ),
    ],
    [
        '/features/:feature/sequence-diagram',
        (params) =>
            withFeature(params, (owner, mod, feature) =>
                feature.sequence_diagram
                    ? {
                          component: 'features/SequenceDiagram',
                          props: { project: owner.project, feature, initialContent: feature.sequence_diagram, featureId: feature.id },
                      }
                    : { redirect: featureUrl(owner, mod, feature) },
            ),
    ],
    [
        '/features/:feature/wireframe',
        (params) =>
            withFeature(params, (owner, mod, feature) =>
                feature.wireframe
                    ? { component: 'features/WireframePage', props: { project: owner.project, feature, schema: JSON.parse(feature.wireframe) } }
                    : { redirect: featureUrl(owner, mod, feature) },
            ),
    ],

    // Settings
    ['/settings', () => ({ redirect: '/settings/profile' })],
    ['/settings/profile', () => ({ component: 'settings/profile', props: { mustVerifyEmail: false, status: null } })],
    ['/settings/password', () => ({ component: 'settings/password', props: {} })],
    ['/settings/usage', (_, query) => ({ component: 'settings/usage', props: usageProps(Number(query.get('page') ?? 1)) })],
];

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

const compiled = routes.map(([pattern, handler]) => {
    const keys: string[] = [];
    const source = pattern.replace(/:(\w+)/g, (_, key: string) => {
        keys.push(key);
        return '([^/]+)';
    });
    return { regex: new RegExp(`^${source}/?$`), keys, handler };
});

function resolve(pathname: string, query: URLSearchParams): Result {
    for (const { regex, keys, handler } of compiled) {
        const match = pathname.match(regex);
        if (match) {
            const params = Object.fromEntries(keys.map((key, index) => [key, decodeURIComponent(match[index + 1])]));
            return handler(params, query);
        }
    }
    return notFound();
}

function ownerForPath(pathname: string): DemoProject | undefined {
    const projectMatch = pathname.match(/^\/(?:projects|modules\/create)\/(\d+)/);
    if (projectMatch) return findProject(Number(projectMatch[1]));
    const featureMatch = pathname.match(/^\/features\/(\d+)/);
    return featureMatch ? findFeature(Number(featureMatch[1]))?.owner : undefined;
}

/** Resolves a GET visit to an Inertia page object, following mock redirects. */
export function resolveVisit(href: string): InertiaPage {
    let url = new URL(href, window.location.origin);

    for (let hops = 0; hops < 5; hops++) {
        const result = resolve(url.pathname, url.searchParams);
        if ('redirect' in result) {
            url = new URL(result.redirect, window.location.origin);
            continue;
        }
        return {
            component: result.component,
            props: { ...sharedProps(ownerForPath(url.pathname)), ...result.props, errors: {} },
            url: url.pathname + url.search,
            version: null,
            clearHistory: false,
            encryptHistory: false,
            rememberedState: {},
        };
    }

    return {
        component: 'Error',
        props: { ...sharedProps(), status: 500, errors: {} },
        url: url.pathname,
        version: null,
        clearHistory: false,
        encryptHistory: false,
        rememberedState: {},
    };
}
