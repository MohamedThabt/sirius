import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Compass, ListIcon, Minus, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { tourIndexFor, tourStops } from './tour';
import { useCurrentPath } from './use-current-path';

export const OPEN_TOUR_EVENT = 'sirius-demo:open-tour';

/**
 * Floating guided tour: Prev / Next through every page of the demo, plus an index
 * of all pages grouped by area. Doubles as the "this is a demo" notice.
 */
export default function DemoTour() {
    const path = useCurrentPath();
    const index = tourIndexFor(path);
    const [panelOpen, setPanelOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);

    useEffect(() => setPanelOpen(false), [path]);

    useEffect(() => {
        const open = () => {
            setMinimized(false);
            setPanelOpen(true);
        };
        window.addEventListener(OPEN_TOUR_EVENT, open);
        return () => window.removeEventListener(OPEN_TOUR_EVENT, open);
    }, []);

    const groups = useMemo(() => {
        const map = new Map<string, { path: string; title: string; index: number }[]>();
        tourStops.forEach((stop, i) => {
            map.set(stop.group, [...(map.get(stop.group) ?? []), { path: stop.path, title: stop.title, index: i }]);
        });
        return [...map.entries()];
    }, []);

    const go = (i: number) => router.visit(tourStops[i].path);
    const hasPrev = index > 0;
    const hasNext = index < tourStops.length - 1;
    const next = () => go(index === -1 ? 0 : index + 1);
    const prev = () => hasPrev && go(index - 1);

    if (minimized) {
        return (
            <button
                type="button"
                onClick={() => setMinimized(false)}
                className="fixed bottom-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur hover:bg-muted"
            >
                <Compass className="h-3.5 w-3.5" /> Demo tour
            </button>
        );
    }

    const progress = index === -1 ? 0 : ((index + 1) / tourStops.length) * 100;

    return (
        <>
            {panelOpen && <div className="fixed inset-0 z-[59]" onClick={() => setPanelOpen(false)} aria-hidden />}

            <div className="fixed bottom-3 left-1/2 z-[60] w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2">
                {panelOpen && (
                    <div className="absolute bottom-full left-1/2 mb-2 w-[min(92vw,380px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                        <div className="border-b border-border px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-foreground">Every page in this demo</span>
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(false)}
                                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label="Close page list"
                                >
                                    <XIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">Mock frontend · sample data · nothing is saved</p>
                        </div>
                        <nav className="max-h-[55vh] overflow-y-auto px-2 py-2">
                            {groups.map(([group, stops]) => (
                                <div key={group} className="mb-2">
                                    <div className="px-2 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                                        {group}
                                    </div>
                                    {stops.map((stop) => (
                                        <button
                                            key={stop.path}
                                            type="button"
                                            onClick={() => go(stop.index)}
                                            className={cn(
                                                'flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                                                stop.index === index
                                                    ? 'bg-foreground text-background'
                                                    : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'w-5 shrink-0 text-right font-mono text-[11px]',
                                                    stop.index === index ? 'text-background/70' : 'text-muted-foreground',
                                                )}
                                            >
                                                {stop.index + 1}
                                            </span>
                                            <span className="truncate">{stop.title}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </nav>
                    </div>
                )}

                <div className="relative flex items-center gap-1 overflow-hidden rounded-full border border-border bg-background/90 p-1 text-xs shadow-lg backdrop-blur">
                    <span className="absolute bottom-0 left-0 h-0.5 bg-foreground/60 transition-all duration-500" style={{ width: `${progress}%` }} />
                    <button
                        type="button"
                        onClick={prev}
                        disabled={!hasPrev}
                        className="rounded-full p-1.5 text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setPanelOpen((open) => !open)}
                        className="flex min-w-0 items-center gap-2 rounded-full px-2 py-1 hover:bg-muted"
                        aria-label="Show all pages"
                    >
                        <Compass className="h-3.5 w-3.5 shrink-0 text-foreground" />
                        <span className="font-medium whitespace-nowrap text-foreground">
                            {index === -1 ? 'Demo tour' : `${index + 1} / ${tourStops.length}`}
                        </span>
                        {index !== -1 && (
                            <span className="hidden max-w-[220px] truncate text-muted-foreground sm:inline">{tourStops[index].title}</span>
                        )}
                        <ListIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>

                    <button
                        type="button"
                        onClick={next}
                        disabled={!hasNext}
                        className="flex items-center gap-1 rounded-full bg-foreground py-1.5 pr-2 pl-3 font-medium text-background hover:opacity-90 disabled:opacity-30"
                        aria-label="Next page"
                    >
                        <span className="hidden sm:inline">{index === -1 ? 'Start' : 'Next'}</span>
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setMinimized(true)}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Minimize tour"
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </>
    );
}
