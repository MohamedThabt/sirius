import { TextShimmer } from '@/components/ui/text-shimmer';
import { RefreshCw } from 'lucide-react';

interface LoadingOverlayProps {
    isVisible: boolean;
    title: string;
    subtitle?: string;
    showRefreshIcon?: boolean;
}

/**
 * WHY: Extracted from ModulesSuggestion.tsx to create a reusable loading overlay.
 * This pattern was duplicated for "Creating Modules" and "Regenerating Modules" states.
 * Now it's a single, configurable component.
 */
export function LoadingOverlay({ isVisible, title, subtitle, showRefreshIcon = false }: LoadingOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-8 shadow-lg">
                <div className="relative">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        {showRefreshIcon ? (
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                            <div className="h-6 w-6 animate-pulse rounded-full bg-primary/20" />
                        )}
                    </div>
                </div>
                <div className="space-y-2 text-center">
                    <TextShimmer className="text-lg font-semibold">{title}</TextShimmer>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}
