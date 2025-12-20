import * as React from 'react';

import { cn } from '@/lib/utils';

type MarqueeProps = {
    className?: string;
    pauseOnHover?: boolean;
    reverse?: boolean;
    repeat?: number;
    children: React.ReactNode;
};

export function Marquee({ className, pauseOnHover = false, reverse = false, repeat = 2, children }: MarqueeProps) {
    const copies = Array.from({ length: Math.max(2, repeat) });

    return (
        <div
            className={cn(
                'relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
                className,
            )}
            data-marquee=""
            data-marquee-reverse={reverse ? 'true' : 'false'}
            data-marquee-pause={pauseOnHover ? 'true' : 'false'}
        >
            <style>{`
@keyframes sirius-marquee-x {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
[data-marquee] [data-marquee-track] {
  animation: sirius-marquee-x var(--marquee-duration, 20s) linear infinite;
}
[data-marquee][data-marquee-reverse="true"] [data-marquee-track] {
  animation-direction: reverse;
}
[data-marquee][data-marquee-pause="true"]:hover [data-marquee-track] {
  animation-play-state: paused;
}
      `}</style>

            <div
                className="flex min-w-full shrink-0 items-center gap-4"
                data-marquee-track=""
                style={{
                    width: '200%',
                }}
            >
                {copies.map((_, idx) => (
                    <div key={idx} className="flex w-1/2 shrink-0 items-center gap-4">
                        {children}
                    </div>
                ))}
            </div>
        </div>
    );
}
