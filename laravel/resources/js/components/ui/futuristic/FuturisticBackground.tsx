import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface FuturisticBackgroundProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'subtle' | 'intense';
    showDots?: boolean;
}

/**
 * FuturisticBackground - Canvas-style gradient background component
 * Inspired by ProjectFlowCanvas design with multi-layer gradients,
 * radial glows, noise texture, and vignette effects.
 */
export function FuturisticBackground({ 
    children, 
    className,
    variant = 'default',
    showDots = true
}: FuturisticBackgroundProps) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        checkTheme();
        return () => observer.disconnect();
    }, []);

    const intensityMultiplier = variant === 'intense' ? 1.5 : variant === 'subtle' ? 0.5 : 1;

    return (
        <div className={cn("relative min-h-full w-full", className)}>
            {/* Multi-layer gradient background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Base gradient */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: isDarkMode 
                            ? 'linear-gradient(135deg, #141414 0%, #1a1a1a 25%, #171717 50%, #141414 75%, #0f0f0f 100%)'
                            : 'linear-gradient(135deg, #fafafa 0%, #e5e5e5 25%, #f5f5f5 50%, #e5e5e5 75%, #fafafa 100%)'
                    }}
                />
                
                {/* Radial glow effects */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: isDarkMode
                            ? `radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255, 255, 255, ${0.04 * intensityMultiplier}) 0%, transparent 50%),
                               radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255, 255, 255, ${0.03 * intensityMultiplier}) 0%, transparent 50%),
                               radial-gradient(ellipse 50% 30% at 50% 50%, rgba(255, 255, 255, ${0.02 * intensityMultiplier}) 0%, transparent 50%)`
                            : `radial-gradient(ellipse 80% 50% at 20% 20%, rgba(0, 0, 0, ${0.03 * intensityMultiplier}) 0%, transparent 50%),
                               radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0, 0, 0, ${0.02 * intensityMultiplier}) 0%, transparent 50%)`
                    }}
                />
                
                {/* Subtle noise texture overlay */}
                <div 
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />
                
                {/* Corner accent glows */}
                <div 
                    className="absolute -top-32 -left-32 h-64 w-64 rounded-full blur-3xl"
                    style={{
                        background: isDarkMode 
                            ? `radial-gradient(circle, rgba(255, 255, 255, ${0.06 * intensityMultiplier}) 0%, transparent 70%)`
                            : `radial-gradient(circle, rgba(0, 0, 0, ${0.04 * intensityMultiplier}) 0%, transparent 70%)`
                    }}
                />
                <div 
                    className="absolute -right-32 -bottom-32 h-64 w-64 rounded-full blur-3xl"
                    style={{
                        background: isDarkMode 
                            ? `radial-gradient(circle, rgba(255, 255, 255, ${0.05 * intensityMultiplier}) 0%, transparent 70%)`
                            : `radial-gradient(circle, rgba(0, 0, 0, ${0.03 * intensityMultiplier}) 0%, transparent 70%)`
                    }}
                />
                
                {/* Vignette effect */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: isDarkMode
                            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.2) 100%)'
                            : 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.03) 100%)'
                    }}
                />

                {/* Optional dot pattern */}
                {showDots && (
                    <div 
                        className="absolute inset-0"
                        style={{
                            backgroundImage: isDarkMode
                                ? 'radial-gradient(rgba(163, 163, 163, 0.15) 1px, transparent 1px)'
                                : 'radial-gradient(rgba(115, 115, 115, 0.1) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                )}
            </div>
            
            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

export default FuturisticBackground;
