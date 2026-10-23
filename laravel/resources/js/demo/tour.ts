/** Every page of the demo, in the order the guided tour walks through them. */
export interface TourStop {
    path: string;
    title: string;
    group: string;
}

export const tourStops: TourStop[] = [
    { group: 'Start here', path: '/', title: 'Landing page' },
    { group: 'Start here', path: '/architecture', title: 'How Sirius is built' },
    { group: 'Start here', path: '/pricing', title: 'Pricing' },
    { group: 'Start here', path: '/team', title: 'Team' },

    { group: 'Workspace', path: '/projects', title: 'All projects' },
    { group: 'Workspace', path: '/projects/invitations', title: 'Invitations' },

    { group: 'Sample project · E-Commerce', path: '/projects/1', title: 'Project dashboard' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/brainstorming', title: 'Brainstorming board' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/system-overview', title: 'System overview + AI chat' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/technology', title: 'Technical details' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/modules', title: 'Modules' },
    { group: 'Sample project · E-Commerce', path: '/modules/create/1', title: 'AI module suggestions' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/modules/13', title: 'Module: Cart & Checkout' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/modules/13/erd', title: 'Module database schema' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/features', title: 'All features' },
    { group: 'Sample project · E-Commerce', path: '/projects/1/modules/13/features/create', title: 'AI feature suggestions' },

    { group: 'Feature · Guest Checkout', path: '/projects/1/modules/13/features/108', title: 'Feature details' },
    { group: 'Feature · Guest Checkout', path: '/projects/1/modules/13/features/108/specs', title: 'Feature specs' },
    { group: 'Feature · Guest Checkout', path: '/features/108/datamodel', title: 'Feature data model' },
    { group: 'Feature · Guest Checkout', path: '/features/108/sequence-diagram', title: 'Sequence diagram' },
    { group: 'Feature · Guest Checkout', path: '/features/108/wireframe', title: 'Wireframes' },

    { group: 'Project-level documents', path: '/projects/1/prd', title: 'Product requirements (PRD)' },
    { group: 'Project-level documents', path: '/projects/1/c4', title: 'C4 architecture' },
    { group: 'Project-level documents', path: '/projects/1/erd', title: 'Project ERD' },
    { group: 'Project-level documents', path: '/projects/1/team', title: 'Team & roles' },

    { group: 'Other project states', path: '/projects/2', title: 'Project in progress' },
    { group: 'Other project states', path: '/projects/2/c4', title: 'Not generated yet (empty state)' },
    { group: 'Other project states', path: '/projects/3/prepare', title: 'New project intake wizard' },

    { group: 'Account', path: '/settings/profile', title: 'Profile settings' },
    { group: 'Account', path: '/settings/password', title: 'Password settings' },
    { group: 'Account', path: '/settings/usage', title: 'Credits & usage' },
    { group: 'Account', path: '/not-a-real-page', title: '404 page' },
];

export function tourIndexFor(pathname: string): number {
    const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    return tourStops.findIndex((stop) => stop.path === normalized);
}
