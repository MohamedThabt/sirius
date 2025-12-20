import React from 'react';

// Shared Gradients used across icons
export const IconGradients = () => (
    <defs>
        <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="violet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id="red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
    </defs>
);

interface IconProps {
    className?: string;
}

// Feature 1: PRD / Document
export const IconDocAI = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="url(#amber-gradient)"fillOpacity="0.2" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 13H16" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 17H16" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9H8" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Sparkle overlay */}
        <path d="M18 14L18.5 15L19.5 15.5L18.5 16L18 17L17.5 16L16.5 15.5L17.5 15L18 14Z" fill="#FBBF24" />
    </svg>
);

// Feature 2: Decomposition / Layers
export const IconLayersAI = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#blue-gradient)" fillOpacity="0.2" stroke="url(#blue-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="url(#blue-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="url(#blue-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="1.5" fill="#60A5FA" />
        <circle cx="12" cy="17" r="1.5" fill="#60A5FA" />
    </svg>
);

// Feature 3: Diagrams / Flow
export const IconDiagrams = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <rect x="3" y="3" width="7" height="7" rx="1" fill="url(#purple-gradient)" fillOpacity="0.2" stroke="url(#purple-gradient)" strokeWidth="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1" fill="url(#purple-gradient)" fillOpacity="0.2" stroke="url(#purple-gradient)" strokeWidth="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1" fill="url(#purple-gradient)" fillOpacity="0.2" stroke="url(#purple-gradient)" strokeWidth="1.5"/>
        <path d="M6.5 10V17.5C6.5 17.7761 6.72386 18 7 18H14" stroke="url(#purple-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 6.5H14" stroke="url(#purple-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="6.5" cy="6.5" r="1.5" fill="#C084FC" />
        <circle cx="17.5" cy="17.5" r="1.5" fill="#C084FC" />
    </svg>
);

// Feature 4: Database
export const IconDatabaseAI = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <ellipse cx="12" cy="5" rx="9" ry="3" fill="url(#emerald-gradient)" fillOpacity="0.2" stroke="url(#emerald-gradient)" strokeWidth="1.5" />
        <path d="M21 12C21 13.657 16.97 15 12 15C7.03 15 3 13.657 3 12" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 5V19C3 20.657 7.03 22 12 22C16.97 22 21 20.657 21 19V5" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M21 12V5" stroke="url(#emerald-gradient)" strokeWidth="1.5"/>
        <path d="M3 12V5" stroke="url(#emerald-gradient)" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1.5" fill="#34D399" />
        <circle cx="12" cy="5" r="1.5" fill="#34D399" />
    </svg>
);

// Feature 5: History / Versions
export const IconVersion = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" stroke="url(#violet-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 12H7" stroke="url(#violet-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 7V12L17 12" stroke="url(#violet-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 6.5C8.3 5 10.1 4 12 4" stroke="url(#violet-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
        <circle cx="12" cy="12" r="2" fill="#A78BFA" />
    </svg>
);

// Feature 6: Git / Code
export const IconGitAI = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <circle cx="6" cy="18" r="3" fill="url(#cyan-gradient)" fillOpacity="0.2" stroke="url(#cyan-gradient)" strokeWidth="1.5"/>
        <circle cx="18" cy="6" r="3" fill="url(#cyan-gradient)" fillOpacity="0.2" stroke="url(#cyan-gradient)" strokeWidth="1.5"/>
        <path d="M6 15V9" stroke="url(#cyan-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 18H12C14.2091 18 16 16.2091 16 14V9" stroke="url(#cyan-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 6L15 6" stroke="url(#cyan-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
        <circle cx="12" cy="12" r="1" fill="#22D3EE" />
    </svg>
);

// Problem: Time / Clock
export const IconTimeWarning = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <circle cx="12" cy="12" r="9" stroke="url(#red-gradient)" strokeWidth="1.5"/>
        <path d="M12 7V12L16 14" stroke="url(#red-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 3V1" stroke="url(#red-gradient)" strokeWidth="1.5"/>
        <path d="M12 23V21" stroke="url(#red-gradient)" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1.5" fill="#F87171" />
    </svg>
);

// Problem: Scattered Files
export const IconScattered = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M14 3V7C14 7.55228 14.4477 8 15 8H19" stroke="url(#red-gradient)" strokeWidth="1.5" />
        <path d="M14 3H9C7.89543 3 7 3.89543 7 5V19C7 20.1046 7.89543 21 9 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z" fill="url(#red-gradient)" fillOpacity="0.1" stroke="url(#red-gradient)" strokeWidth="1.5"/>
        <rect x="3" y="7" width="8" height="10" rx="1" fill="#FEF2F2" stroke="url(#red-gradient)" strokeWidth="1.5" transform="rotate(-15 3 7)" />
    </svg>
);

// Problem: No Visuals
export const IconNoVisuals = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#red-gradient)" strokeWidth="1.5" strokeDasharray="4 4"/>
        <path d="M9 9L15 15" stroke="url(#red-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M15 9L9 15" stroke="url(#red-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="6" stroke="url(#red-gradient)" strokeWidth="1.5" strokeOpacity="0.3"/>
    </svg>
);

// Solution: Sparkles / Magic
export const IconMagic = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#emerald-gradient)" fillOpacity="0.2" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M18 2L19 5L22 6L19 7L18 10L17 7L14 6L17 5L18 2Z" fill="#34D399" />
    </svg>
);

// Solution: Centralized / Zap
export const IconCentral = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <circle cx="12" cy="12" r="10" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeOpacity="0.5"/>
        <circle cx="12" cy="12" r="6" fill="url(#emerald-gradient)" fillOpacity="0.2" stroke="url(#emerald-gradient)" strokeWidth="1.5"/>
        <path d="M13 8L10 12H14L11 16" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Solution: Sync
export const IconSync = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M20 10C20 6.68629 17.3137 4 14 4H12" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4 14C4 17.3137 6.68629 20 10 20H12" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 4L20 8L16 12" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 20L4 16L8 12" stroke="url(#emerald-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="9" y="9" width="6" height="6" rx="1" fill="#34D399" fillOpacity="0.3" stroke="url(#emerald-gradient)" strokeWidth="1.5"/>
    </svg>
);

// Testimonials: Quote
export const IconQuote = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M10 11H6C5.46957 11 4.96086 11.2107 4.58579 11.5858C4.21071 11.9609 4 12.4696 4 13V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H10V11Z" fill="url(#amber-gradient)" fillOpacity="0.1" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 11V6C10 5.46957 9.78929 4.96086 9.41421 4.58579C9.03914 4.21071 8.53043 4 8 4" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 11H16C15.4696 11 14.9609 11.2107 14.5858 11.5858C14.2107 11.9609 14 12.4696 14 13V19C14 19.5304 14.2107 20.0391 14.5858 20.4142C14.9609 20.7893 15.4696 21 16 21H20V11Z" fill="url(#amber-gradient)" fillOpacity="0.1" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 11V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4" stroke="url(#amber-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Hero: Sparkles (Small)
export const IconSparklesSmall = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <IconGradients />
        <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" fill="url(#indigo-gradient)" fillOpacity="0.2" stroke="url(#blue-gradient)" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
);
