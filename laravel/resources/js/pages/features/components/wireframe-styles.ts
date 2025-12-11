/**
 * Wireframe Style System
 * 
 * Centralized styling for wireframe components with dual-mode support:
 * - 'wireframe': Low-fidelity grayscale design for planning/prototyping
 * - 'preview': High-fidelity design using full theme colors
 */

export type WireframeMode = 'wireframe' | 'preview';

export interface WireframeStyleConfig {
    // Colors
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    ring: string;

    // Typography
    fontFamily: string;
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
    };
    fontWeight: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
    };

    // Spacing
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };

    // Border radius
    radius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };

    // Shadows
    shadow: {
        none: string;
        sm: string;
        md: string;
        lg: string;
    };

    // Transitions
    transition: {
        fast: string;
        normal: string;
        slow: string;
    };
}

// Low-fidelity wireframe mode - grayscale, minimal styling
export const wireframeStyles: WireframeStyleConfig = {
    // Grayscale colors for wireframe mode
    background: '#ffffff',
    foreground: '#111827',
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
    border: '#d1d5db',
    card: '#ffffff',
    cardForeground: '#111827',
    primary: '#6b7280',
    primaryForeground: '#ffffff',
    accent: '#e5e7eb',
    accentForeground: '#374151',
    destructive: '#9ca3af',
    ring: '#3b82f6',

    // Typography
    fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Spacing (in pixels)
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
    },

    // Border radius
    radius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
    },

    // Minimal shadows for wireframe
    shadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },

    // Transitions
    transition: {
        fast: 'all 0.15s ease-out',
        normal: 'all 0.2s ease-out',
        slow: 'all 0.3s ease-out',
    },
};

// High-fidelity preview mode - uses CSS variables for theme support
export const previewStyles: WireframeStyleConfig = {
    // Theme-aware colors using CSS variables
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    muted: 'hsl(var(--muted))',
    mutedForeground: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
    card: 'hsl(var(--card))',
    cardForeground: 'hsl(var(--card-foreground))',
    primary: 'hsl(var(--primary))',
    primaryForeground: 'hsl(var(--primary-foreground))',
    accent: 'hsl(var(--accent))',
    accentForeground: 'hsl(var(--accent-foreground))',
    destructive: 'hsl(var(--destructive))',
    ring: 'hsl(var(--ring))',

    // Typography - slightly larger for preview
    fontFamily: 'var(--font-sans, "Inter", system-ui, -apple-system, sans-serif)',
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Spacing (in pixels) - more generous for preview
    spacing: {
        xs: 6,
        sm: 10,
        md: 14,
        lg: 20,
        xl: 28,
    },

    // Border radius using CSS variables - softer corners
    radius: {
        sm: 'var(--radius-sm, 0.375rem)',
        md: 'var(--radius-md, 0.5rem)',
        lg: 'var(--radius-lg, 0.75rem)',
        xl: 'var(--radius-xl, 1rem)',
        full: '9999px',
    },

    // Enhanced shadows for preview - more depth and polish
    shadow: {
        none: 'none',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
        lg: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
    },

    // Smoother transitions
    transition: {
        fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
};

// Helper to get styles based on mode
export function getStyles(mode: WireframeMode): WireframeStyleConfig {
    return mode === 'preview' ? previewStyles : wireframeStyles;
}

// Typography scale for headings
export const headingStyles = {
    1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 },
    3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3 },
    4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
    5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.45 },
} as const;

// Selection styles
export function getSelectionStyles(isSelected: boolean, mode: WireframeMode): React.CSSProperties {
    if (!isSelected) return {};
    
    const styles = getStyles(mode);
    return {
        outline: `2px solid ${styles.ring}`,
        outlineOffset: '2px',
        boxShadow: mode === 'preview' 
            ? `0 0 0 4px color-mix(in srgb, ${styles.ring} 20%, transparent)`
            : '0 0 0 4px rgba(59, 130, 246, 0.15)',
    };
}

// Interactive element hover styles
export function getInteractiveStyles(mode: WireframeMode, isHovered?: boolean): React.CSSProperties {
    const styles = getStyles(mode);
    
    if (!isHovered) {
        return {
            transition: styles.transition.fast,
            cursor: 'pointer',
        };
    }
    
    return {
        transition: styles.transition.fast,
        cursor: 'pointer',
        transform: mode === 'preview' ? 'translateY(-2px) scale(1.01)' : undefined,
        boxShadow: mode === 'preview' ? styles.shadow.lg : styles.shadow.sm,
        filter: mode === 'preview' ? 'brightness(1.02)' : undefined,
    };
}

// Common component base styles
export function getBaseStyles(mode: WireframeMode): {
    container: React.CSSProperties;
    card: React.CSSProperties;
    button: React.CSSProperties;
    buttonPrimary: React.CSSProperties;
    input: React.CSSProperties;
    label: React.CSSProperties;
} {
    const s = getStyles(mode);
    
    return {
        container: {
            display: 'flex',
            flexDirection: 'column',
            gap: s.spacing.sm,
            padding: s.spacing.md,
            border: `1px solid ${s.border}`,
            borderRadius: s.radius.lg,
            background: s.background,
            color: s.foreground,
            transition: s.transition.fast,
        },
        card: {
            display: 'flex',
            flexDirection: 'column',
            gap: s.spacing.sm,
            padding: s.spacing.lg,
            border: `1px solid ${s.border}`,
            borderRadius: s.radius.lg,
            background: s.card,
            color: s.cardForeground,
            boxShadow: mode === 'preview' ? s.shadow.sm : s.shadow.none,
            transition: s.transition.fast,
        },
        button: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s.spacing.xs,
            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
            fontSize: s.fontSize.sm,
            fontWeight: s.fontWeight.medium,
            lineHeight: s.lineHeight.tight,
            border: `1px solid ${s.border}`,
            borderRadius: s.radius.md,
            background: 'transparent',
            color: s.foreground,
            cursor: 'pointer',
            transition: s.transition.fast,
        },
        buttonPrimary: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s.spacing.xs,
            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
            fontSize: s.fontSize.sm,
            fontWeight: s.fontWeight.medium,
            lineHeight: s.lineHeight.tight,
            border: 'none',
            borderRadius: s.radius.md,
            background: s.primary,
            color: s.primaryForeground,
            cursor: 'pointer',
            transition: s.transition.fast,
        },
        input: {
            width: '100%',
            padding: `${s.spacing.sm}px ${s.spacing.md}px`,
            fontSize: s.fontSize.sm,
            lineHeight: s.lineHeight.normal,
            border: `1px solid ${s.border}`,
            borderRadius: s.radius.md,
            background: s.background,
            color: s.foreground,
            transition: s.transition.fast,
        },
        label: {
            display: 'block',
            fontSize: s.fontSize.sm,
            fontWeight: s.fontWeight.medium,
            color: s.foreground,
            marginBottom: s.spacing.xs,
        },
    };
}
