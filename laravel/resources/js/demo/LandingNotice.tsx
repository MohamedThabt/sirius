import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, XIcon } from 'lucide-react';
import { useState } from 'react';
import { OPEN_TOUR_EVENT } from './DemoTour';
import { useCurrentPath } from './use-current-path';

/** Warning shown on the landing page: this is a mock frontend, not the live product. */
export default function LandingNotice() {
    const path = useCurrentPath();
    const [dismissed, setDismissed] = useState(false);

    if (path !== '/' || dismissed) return null;

    return (
        <div
            role="alert"
            className="fixed bottom-16 left-1/2 z-[58] w-[min(calc(100vw-1.5rem),640px)] -translate-x-1/2 rounded-2xl border border-amber-500/40 bg-background/95 p-4 shadow-2xl backdrop-blur md:right-6 md:bottom-20 md:left-auto md:w-[440px] md:translate-x-0 md:p-5"
        >
            <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">Heads up — this is a mock frontend</p>
                        <button
                            type="button"
                            onClick={() => setDismissed(true)}
                            className="-mt-1 -mr-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Dismiss"
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Sirius is no longer running. This is the real interface kept online as a portfolio piece: every project, diagram and document
                        is sample data in your browser, nothing is saved and AI generation is turned off.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => router.visit('/architecture')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
                        >
                            Start the tour <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new Event(OPEN_TOUR_EVENT))}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                            Browse all pages
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/projects/1')}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                            Jump into the app
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
