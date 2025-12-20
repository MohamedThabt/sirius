import * as React from 'react';

import { cn } from '@/lib/utils';

type Meteor = {
    top: number;
    left: number;
    delay: number;
    duration: number;
    size: number;
};

type MeteorsProps = {
    className?: string;
    number?: number;
    minDelay?: number;
    maxDelay?: number;
    minDuration?: number;
    maxDuration?: number;
};

export function Meteors({ className, number = 20, minDelay = 0.2, maxDelay = 1.2, minDuration = 2, maxDuration = 10 }: MeteorsProps) {
    const [meteors, setMeteors] = React.useState<Meteor[]>([]);

    React.useEffect(() => {
        const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

        const next = Array.from({ length: number }).map(() => {
            const delay = clamp(Math.random() * maxDelay, minDelay, maxDelay);
            const duration = clamp(Math.random() * maxDuration, minDuration, maxDuration);
            return {
                top: Math.random() * 100,
                left: Math.random() * 100,
                delay,
                duration,
                size: 120 + Math.random() * 160,
            };
        });

        setMeteors(next);
    }, [number, minDelay, maxDelay, minDuration, maxDuration]);

    return (
        <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
            <style>{`
@keyframes sirius-meteor {
  0% { transform: translate3d(0,0,0) rotate(-35deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translate3d(-600px, 600px, 0) rotate(-35deg); opacity: 0; }
}
      `}</style>

            {meteors.map((m, idx) => (
                <span
                    key={idx}
                    className="absolute block h-px rounded-full bg-gradient-to-r from-white/90 to-transparent"
                    style={{
                        top: `${m.top}%`,
                        left: `${m.left}%`,
                        width: `${m.size}px`,
                        animation: `sirius-meteor ${m.duration}s linear ${m.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}
