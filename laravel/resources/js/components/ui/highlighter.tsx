import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface HighlighterProps {
    children: ReactNode;
    action?: 'underline' | 'highlight' | 'box';
    color?: string;
    className?: string;
}

export function Highlighter({
    children,
    action = 'underline',
    color = 'rgba(163, 163, 163, 0.6)',
    className,
}: HighlighterProps) {
    const styles: Record<string, React.CSSProperties> = {
        underline: {
            backgroundImage: `linear-gradient(${color}, ${color})`,
            backgroundSize: '100% 2px',
            backgroundPosition: '0 100%',
            backgroundRepeat: 'no-repeat',
            paddingBottom: '2px',
        },
        highlight: {
            backgroundColor: color,
            borderRadius: '2px',
            padding: '0 4px',
        },
        box: {
            border: `2px solid ${color}`,
            borderRadius: '4px',
            padding: '0 4px',
        },
    };

    return (
        <span
            className={cn('inline', className)}
            style={styles[action]}
        >
            {children}
        </span>
    );
}
