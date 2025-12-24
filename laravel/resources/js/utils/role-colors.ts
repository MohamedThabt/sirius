/**
 * Role Badge Colors Utility
 *
 * WHY: This function was duplicated in Team.tsx, Invitations.tsx, and AcceptInvitation.tsx.
 * Extracting ensures consistent role styling across all team-related components.
 */

export type Role = 'owner' | 'admin' | 'developer' | 'viewer';

/**
 * Returns Tailwind CSS classes for role badge styling.
 * Includes light and dark mode variants.
 */
export const getRoleBadgeColor = (role: string): string => {
    switch (role) {
        case 'owner':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30';
        case 'admin':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
        case 'developer':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
        case 'viewer':
            return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
};

/**
 * Returns an icon component type for a given role.
 * WHY: Extracted since AcceptInvitation.tsx had similar logic.
 */
export const getRoleLabel = (role: Role): string => {
    switch (role) {
        case 'owner':
            return 'Project Owner';
        case 'admin':
            return 'Admin';
        case 'developer':
            return 'Developer';
        case 'viewer':
            return 'Viewer';
        default:
            return role;
    }
};
