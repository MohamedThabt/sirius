import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';

const ActionSlidesSection = () => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // System Overview Mockup
    const SystemOverviewMockup = () => (
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(220_13%_8%)]">
            <div className="flex w-16 flex-col items-center gap-2 border-r border-white/[0.08] bg-[hsl(220_13%_6%)] py-3">
                <div className="h-8 w-8 rounded border border-white/10 bg-white/5"></div>
                <div className="h-8 w-8 rounded border border-white/20 bg-white/10"></div>
                <div className="h-8 w-8 rounded border border-white/10 bg-white/5"></div>
            </div>

            <div className="flex flex-1">
                <div className="flex w-2/5 flex-col border-r border-white/[0.08] bg-[hsl(220_13%_7%)] p-3">
                    <div className="mb-3 border-b border-white/[0.08] pb-2">
                        <div className="mb-1 h-3 w-20 rounded bg-white/10"></div>
                        <div className="h-2 w-32 rounded bg-white/5"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="rounded border border-blue-500/30 bg-blue-500/10 p-2">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[8px] text-white/70">v1</div>
                                <div className="h-2 flex-1 rounded bg-white/20"></div>
                            </div>
                            <div className="h-1.5 w-24 rounded bg-white/10 text-[6px]"></div>
                        </div>
                        <div className="rounded border border-white/[0.08] bg-white/5 p-2">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[8px] text-white/50">v2</div>
                                <div className="h-2 flex-1 rounded bg-white/10"></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 border-t border-white/[0.08] pt-2">
                        <div className="h-6 rounded border border-white/10 bg-white/5"></div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-[hsl(220_13%_8%)] p-4">
                    <div className="h-full space-y-3 rounded border border-white/[0.08] bg-[hsl(220_13%_9%)] p-4">
                        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                            <div className="h-3 w-32 rounded bg-white/20"></div>
                            <div className="flex gap-1">
                                <div className="h-6 w-6 rounded border border-white/10 bg-white/5"></div>
                                <div className="h-6 w-6 rounded border border-white/10 bg-white/5"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full rounded bg-white/15"></div>
                            <div className="h-2 w-5/6 rounded bg-white/15"></div>
                            <div className="h-2 w-4/5 rounded bg-white/15"></div>
                            <div className="mt-3 flex h-16 items-center justify-center rounded border border-white/10 bg-white/5">
                                <div className="text-[8px] text-white/40">```mermaid diagram```</div>
                            </div>
                            <div className="mt-3 h-2 w-full rounded bg-white/15"></div>
                            <div className="h-2 w-3/4 rounded bg-white/15"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ERD Mockup
    const ERDMockup = () => (
        <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(220_13%_8%)]">
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                }}
            />

            <div className="relative flex h-full items-center justify-center gap-6 p-6">
                <div className="min-w-[140px] rounded-lg border border-white/[0.12] bg-[hsl(220_13%_10%)] p-3">
                    <div className="mb-2 border-b border-white/[0.08] pb-1.5 text-[10px] font-semibold text-white/90">users</div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-yellow-400/60"></div>
                            <div className="flex-1 text-[8px] text-white/70">id</div>
                            <div className="text-[7px] text-white/40">int</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-purple-400/60"></div>
                            <div className="flex-1 text-[8px] text-white/70">email</div>
                            <div className="text-[7px] text-white/40">varchar</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1"></div>
                            <div className="flex-1 text-[8px] text-white/70">name</div>
                            <div className="text-[7px] text-white/40">varchar</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="h-8 w-0.5 bg-white/20"></div>
                    <div className="h-0.5 w-8 bg-white/20"></div>
                    <div className="h-8 w-0.5 bg-white/20"></div>
                </div>

                <div className="min-w-[140px] rounded-lg border border-white/[0.12] bg-[hsl(220_13%_10%)] p-3">
                    <div className="mb-2 border-b border-white/[0.08] pb-1.5 text-[10px] font-semibold text-white/90">products</div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-yellow-400/60"></div>
                            <div className="flex-1 text-[8px] text-white/70">id</div>
                            <div className="text-[7px] text-white/40">int</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-blue-400/60"></div>
                            <div className="flex-1 text-[8px] text-white/70">user_id</div>
                            <div className="text-[7px] text-white/40">int</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1"></div>
                            <div className="flex-1 text-[8px] text-white/70">title</div>
                            <div className="text-[7px] text-white/40">varchar</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Sequence Diagram Mockup
    const SequenceDiagramMockup = () => {
        return (
            <div className="h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(220_13%_8%)] p-4">
                <div className="relative h-full rounded border border-white/[0.08] bg-[hsl(220_13%_9%)] p-5">
                    <div className="relative mb-3 flex items-start justify-between">
                        {['User', 'API', 'Database'].map((participant, idx) => (
                            <div key={idx} className="relative flex flex-1 flex-col items-center">
                                <div className="z-20 mb-2.5 flex h-7 w-20 items-center justify-center rounded border border-white/[0.18] bg-[hsl(220_13%_11%)]">
                                    <div className="text-[9px] font-medium text-white/85">{participant}</div>
                                </div>
                                <div
                                    className="absolute z-0 w-0.5 bg-white/20"
                                    style={{
                                        top: '2.75rem',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        height: '120px',
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10" style={{ height: '120px', marginTop: '0.5rem' }}>
                        <div className="absolute" style={{ top: '12px', left: '16.66%', right: '50%' }}>
                            <div className="h-0.5 bg-blue-400/80" style={{ width: 'calc(100% - 20px)', marginLeft: '20px' }}></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div className="text-[8px] text-white/80">POST /login</div>
                            </div>
                        </div>

                        <div className="absolute" style={{ top: '44px', left: '50%', right: '16.66%' }}>
                            <div className="h-0.5 bg-green-400/80" style={{ width: 'calc(100% - 20px)' }}></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div className="text-[8px] text-white/80">Query users</div>
                            </div>
                        </div>

                        <div className="absolute" style={{ top: '76px', left: '50%', right: '16.66%' }}>
                            <div className="h-0.5 bg-purple-400/80" style={{ width: 'calc(100% - 20px)' }}></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div className="text-[8px] text-white/80">User data</div>
                            </div>
                        </div>

                        <div className="absolute" style={{ top: '108px', left: '16.66%', right: '50%' }}>
                            <div className="h-0.5 bg-green-400/80" style={{ width: 'calc(100% - 20px)', marginLeft: '20px' }}></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div className="text-[8px] text-white/80">200 OK</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // GitHub Export Mockup
    const GitHubExportMockup = () => (
        <div className="h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(220_13%_8%)]">
            <div className="flex h-full flex-col bg-[hsl(220_13%_9%)]">
                <div className="flex items-center gap-3 border-b border-white/[0.08] p-3">
                    <div className="h-5 w-5 rounded bg-white/10"></div>
                    <div className="h-3 w-32 rounded bg-white/20"></div>
                    <div className="ml-auto flex gap-2">
                        <div className="h-6 w-16 rounded border border-white/20 bg-white/10"></div>
                        <div className="h-6 w-16 rounded border border-white/20 bg-white/10"></div>
                    </div>
                </div>

                <div className="flex-1 space-y-1 p-4">
                    <div className="flex items-center gap-2 text-[9px] text-white/60">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                        </svg>
                        <span>specs</span>
                    </div>
                    <div className="ml-5 space-y-1">
                        <div className="flex items-center gap-2 text-[9px] text-white/70">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span>prd.md</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-white/70">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span>DatabaseDesign.md</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[9px] text-white/60">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                            </svg>
                            <span>features</span>
                        </div>
                        <div className="ml-5 space-y-1">
                            <div className="flex items-center gap-2 text-[9px] text-white/70">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <span>FR-1-user-authentication.md</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-white/70">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <span>FR-2-payment-processing.md</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] text-white/60">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span>README.md</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const slides = [
        {
            id: 'overview',
            title: 'System Overview',
            description:
                'Complete system architecture generated from your project description with AI-powered version control and collaborative editing',
            features: ['AI-generated overviews', 'Version history', 'Markdown rendering', 'Mermaid diagrams'],
            mockup: <SystemOverviewMockup />,
        },
        {
            id: 'erd',
            title: 'ERD & Database',
            description: 'Intelligent database schema design with visual ERD editor, relationships, and constraint management',
            features: ['Visual ERD designer', 'Entity relationships', 'Table structures', 'Migration-ready schemas'],
            mockup: <ERDMockup />,
        },
        {
            id: 'wireframe',
            title: 'Wireframes & Sequence',
            description: 'Visual sequence diagrams and user flow diagrams generated from feature descriptions',
            features: ['Mermaid sequence diagrams', 'User flows', 'API interactions', 'Real-time preview'],
            mockup: <SequenceDiagramMockup />,
        },
        {
            id: 'github',
            title: 'GitHub Export',
            description: 'Export complete project specifications to GitHub repositories for AI code generator context',
            features: ['Structured documentation', 'Version control', 'AI-ready context', 'Repository organization'],
            mockup: <GitHubExportMockup />,
        },
    ];

    // Track current slide
    useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap());

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap());
        });

        return () => {
            api.off('select');
        };
    }, [api]);

    // Auto-scroll functionality
    useEffect(() => {
        if (!api || isPaused) {
            return;
        }

        const interval = setInterval(() => {
            if (api.canScrollNext()) {
                api.scrollNext();
            } else {
                // Loop back to the first slide
                api.scrollTo(0);
            }
        }, 5000); // Auto-scroll every 5 seconds

        return () => clearInterval(interval);
    }, [api, isPaused]);

    // Pause auto-scroll when user manually navigates via buttons
    const handleManualNavigation = useCallback(() => {
        setIsPaused(true);
        
        // Clear any existing timeout
        if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
        }
        
        // Resume auto-scroll after 8 seconds
        pauseTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
            pauseTimeoutRef.current = null;
        }, 8000);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
            }
        };
    }, []);

    return (
        <section id="action-slides" className="bg-gradient-to-b from-transparent to-white/[0.02] py-24">
            <div className="container mx-auto px-6">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold md:text-5xl">See It in Action</h2>
                    <p className="text-lg text-[#95A2B3]">
                        See how Sirius transforms project briefs into comprehensive documentation and exports to GitHub
                    </p>
                </div>

                <div
                    className="mx-auto max-w-6xl"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <Carousel setApi={setApi} opts={{ align: 'start', loop: true }} className="w-full">
                        <CarouselContent>
                            {slides.map((slide, index) => (
                                <CarouselItem key={slide.id}>
                                    <div className="grid gap-8 md:grid-cols-5">
                                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:border-white/[0.12] md:col-span-3">
                                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-br from-[hsl(220_13%_6%)] to-[hsl(220_13%_8%)] shadow-inner">
                                                <div className="absolute top-0 right-0 left-0 flex h-8 items-center gap-2 border-b border-white/[0.08] bg-[hsl(220_13%_6%)] px-3">
                                                    <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
                                                    <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
                                                    <div className="h-2 w-2 rounded-full bg-green-500/50"></div>
                                                    <div className="ml-2 h-4 max-w-xs flex-1 rounded border border-white/10 bg-white/5"></div>
                                                </div>
                                                <div className="absolute inset-0 pt-10">{slide.mockup}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 md:col-span-2">
                                            <div>
                                                <h3 className="mb-3 text-2xl font-bold">{slide.title}</h3>
                                                <p className="leading-relaxed text-[hsl(var(--text-secondary))]">{slide.description}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold tracking-wider text-[hsl(var(--text-tertiary))] uppercase">
                                                    Key Features
                                                </h4>
                                                {slide.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--text-primary))]"></div>
                                                        <span className="text-[hsl(var(--text-secondary))]">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-4 md:-left-12" onClick={handleManualNavigation} />
                        <CarouselNext className="-right-4 md:-right-12" onClick={handleManualNavigation} />
                    </Carousel>

                    {/* Slide indicators */}
                    <div className="mt-8 flex justify-center gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    api?.scrollTo(index);
                                    handleManualNavigation();
                                }}
                                className={`h-2 rounded-full transition-all ${
                                    current === index ? 'w-8 bg-white/80' : 'w-2 bg-white/30'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ActionSlidesSection;
