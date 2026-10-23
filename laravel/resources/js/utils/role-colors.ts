/**
 * Role Badge Colors Utility
 *
 * Extracted ensures consistent role styling across all team-related components.
 * Follows ElevenLabs minimal design system.
 */

export type Role = 'owner' | 'admin' | 'developer' | 'viewer';

export const getRoleBadgeColor = (role: string): string => {
    switch (role) {
        case 'owner':
            return 'bg-primary text-primary-foreground border-primary';
        case 'admin':
            return 'bg-primary/10 text-primary border-primary/20';
        case 'developer':
            return 'bg-secondary text-secondary-foreground border-border';
        case 'viewer':
            return 'bg-muted text-muted-foreground border-border';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
};

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
