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

    // System Overview & PRD Mockup - Enhanced with tabs and AI generation indicator
    const SystemOverviewMockup = () => (
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(var(--bg-secondary))]">
            {/* Sidebar with navigation */}
            <div className="flex w-14 flex-col items-center gap-2 border-r border-white/[0.08] bg-[hsl(var(--bg-secondary))] py-3">
                <div className="h-7 w-7 rounded border border-blue-500/40 bg-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
                <div className="h-7 w-7 rounded border border-white/10 bg-white/5 transition-colors hover:bg-white/10"></div>
                <div className="h-7 w-7 rounded border border-white/10 bg-white/5"></div>
                <div className="h-7 w-7 rounded border border-white/10 bg-white/5"></div>
            </div>

            <div className="flex flex-1 flex-col">
                {/* Tabs: Overview | PRD | SRS */}
                <div className="flex border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))]">
                    <div className="border-b-2 border-blue-500 px-4 py-2">
                        <span className="text-[9px] font-medium text-white/90">Overview</span>
                    </div>
                    <div className="px-4 py-2">
                        <span className="text-[9px] text-white/50">PRD</span>
                    </div>
                    <div className="px-4 py-2">
                        <span className="text-[9px] text-white/50">SRS</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-3">
                        <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-0.5">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400"></div>
                            <span className="text-[7px] text-green-400">AI Generated</span>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Version history sidebar */}
                    <div className="flex w-1/3 flex-col border-r border-white/[0.08] bg-[hsl(var(--bg-secondary))] p-2.5">
                        <div className="mb-2 text-[8px] font-medium text-white/60">Version History</div>
                        <div className="flex-1 space-y-1.5">
                            <div className="rounded border border-blue-500/30 bg-blue-500/10 p-1.5 transition-all">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/30 text-[7px] font-bold text-blue-300">v3</div>
                                    <div className="flex-1">
                                        <div className="h-1.5 w-16 rounded bg-white/25"></div>
                                        <div className="mt-0.5 h-1 w-10 rounded bg-white/10"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded border border-white/[0.06] bg-white/[0.03] p-1.5">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[7px] text-white/50">v2</div>
                                    <div className="h-1.5 w-14 rounded bg-white/10"></div>
                                </div>
                            </div>
                            <div className="rounded border border-white/[0.06] bg-white/[0.03] p-1.5">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[7px] text-white/50">v1</div>
                                    <div className="h-1.5 w-12 rounded bg-white/10"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 rounded border border-dashed border-white/20 p-1.5 text-center">
                            <span className="text-[7px] text-white/40">+ New Version</span>
                        </div>
                    </div>

                    {/* Document content */}
                    <div className="flex-1 overflow-hidden bg-[hsl(var(--bg-secondary))] p-3">
                        <div className="h-full space-y-2 rounded border border-white/[0.08] bg-[hsl(var(--bg-secondary))] p-3">
                            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                                <div className="h-2.5 w-28 rounded bg-white/25"></div>
                                <div className="flex gap-1">
                                    <div className="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-[8px] text-white/40">📋</div>
                                    <div className="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-[8px] text-white/40">⬇</div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-1.5 w-full rounded bg-white/15"></div>
                                <div className="h-1.5 w-5/6 rounded bg-white/15"></div>
                                <div className="h-1.5 w-4/5 rounded bg-white/12"></div>
                            </div>
                            {/* Mermaid diagram preview */}
                            <div className="mt-2 rounded border border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-2">
                                <div className="mb-1 text-[6px] text-white/40">flowchart TD</div>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-12 rounded bg-blue-500/20 border border-blue-500/30"></div>
                                    <div className="text-[8px] text-white/30">→</div>
                                    <div className="h-4 w-12 rounded bg-purple-500/20 border border-purple-500/30"></div>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1">
                                <div className="h-1.5 w-full rounded bg-white/12"></div>
                                <div className="h-1.5 w-3/4 rounded bg-white/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Module Discovery Mockup - DDD bounded context cards with selection
    const ModuleDiscoveryMockup = () => (
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(var(--bg-secondary))]">
            {/* Header with progress indicator */}
            <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-4 py-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-medium text-white/80">Module Discovery</span>
                        <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5">
                            <span className="text-[7px] text-blue-300">DDD Analysis</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[7px] text-white/50">4 of 8 selected</span>
                        <div className="h-1.5 w-16 rounded-full bg-white/10">
                            <div className="h-full w-1/2 rounded-full bg-blue-500"></div>
                        </div>
                    </div>
                </div>

                {/* Module cards grid */}
                <div className="flex-1 overflow-hidden p-3">
                    <div className="grid h-full grid-cols-2 gap-2">
                        {/* Selected module card */}
                        <div className="group relative rounded-lg border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-2.5 transition-all">
                            <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded bg-blue-500 text-[8px] font-bold text-white shadow-lg">1</div>
                            <div className="absolute top-1.5 right-1.5">
                                <div className="h-3 w-3 rounded border-2 border-blue-400 bg-blue-500 flex items-center justify-center">
                                    <span className="text-[6px] text-white">✓</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="text-[9px] font-semibold text-white/90">User Management</div>
                                <div className="mt-1 text-[7px] leading-tight text-white/50">Authentication, profiles, roles & permissions</div>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="rounded bg-green-500/20 px-1 py-0.5 text-[6px] text-green-400">Core</span>
                                <span className="rounded bg-white/10 px-1 py-0.5 text-[6px] text-white/50">5 features</span>
                            </div>
                        </div>

                        {/* Selected module card */}
                        <div className="group relative rounded-lg border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-2.5 transition-all">
                            <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded bg-blue-500 text-[8px] font-bold text-white shadow-lg">2</div>
                            <div className="absolute top-1.5 right-1.5">
                                <div className="h-3 w-3 rounded border-2 border-blue-400 bg-blue-500 flex items-center justify-center">
                                    <span className="text-[6px] text-white">✓</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="text-[9px] font-semibold text-white/90">Order Processing</div>
                                <div className="mt-1 text-[7px] leading-tight text-white/50">Cart, checkout, order lifecycle</div>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="rounded bg-yellow-500/20 px-1 py-0.5 text-[6px] text-yellow-400">High</span>
                                <span className="rounded bg-white/10 px-1 py-0.5 text-[6px] text-white/50">8 features</span>
                            </div>
                        </div>

                        {/* Unselected module */}
                        <div className="group relative rounded-lg border border-white/[0.08] bg-white/[0.02] p-2.5 opacity-60 transition-all hover:border-white/20 hover:opacity-80">
                            <div className="absolute top-1.5 right-1.5">
                                <div className="h-3 w-3 rounded border border-white/30 bg-transparent"></div>
                            </div>
                            <div className="mt-2">
                                <div className="text-[9px] font-semibold text-white/70">Product Catalog</div>
                                <div className="mt-1 text-[7px] leading-tight text-white/40">Categories, inventory, search</div>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="rounded bg-white/10 px-1 py-0.5 text-[6px] text-white/40">Medium</span>
                                <span className="rounded bg-white/10 px-1 py-0.5 text-[6px] text-white/40">6 features</span>
                            </div>
                        </div>

                        {/* Selected module card */}
                        <div className="group relative rounded-lg border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-2.5 transition-all">
                            <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded bg-blue-500 text-[8px] font-bold text-white shadow-lg">3</div>
                            <div className="absolute top-1.5 right-1.5">
                                <div className="h-3 w-3 rounded border-2 border-blue-400 bg-blue-500 flex items-center justify-center">
                                    <span className="text-[6px] text-white">✓</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="text-[9px] font-semibold text-white/90">Payment Gateway</div>
                                <div className="mt-1 text-[7px] leading-tight text-white/40">Transactions, refunds, invoices</div>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="rounded bg-red-500/20 px-1 py-0.5 text-[6px] text-red-400">Critical</span>
                                <span className="rounded bg-white/10 px-1 py-0.5 text-[6px] text-white/50">4 features</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer with actions */}
                <div className="flex items-center justify-between border-t border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-4 py-2">
                    <button className="rounded border border-white/20 bg-white/5 px-3 py-1 text-[8px] text-white/60">Regenerate</button>
                    <button className="rounded bg-blue-500 px-3 py-1 text-[8px] font-medium text-white shadow-lg shadow-blue-500/25">Continue →</button>
                </div>
            </div>
        </div>
    );

    // ERD & Feature Specs Mockup - Split view with ERD and feature spec
    const ERDFeatureSpecsMockup = () => (
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(var(--bg-secondary))]">
            {/* Left side - ERD Diagram */}
            <div className="flex w-1/2 flex-col border-r border-white/[0.08]">
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-3 py-1.5">
                    <span className="text-[8px] font-medium text-white/70">ERD: User Management</span>
                    <div className="flex items-center gap-1 rounded bg-purple-500/20 px-1.5 py-0.5">
                        <span className="text-[6px] text-purple-300">Mermaid</span>
                    </div>
                </div>
                <div className="relative flex-1 p-3">
                    {/* Grid background */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                            backgroundSize: '16px 16px',
                        }}
                    />
                    <div className="relative flex h-full flex-col items-center justify-center gap-3">
                        {/* Users table */}
                        <div className="w-28 rounded border border-blue-500/30 bg-[hsl(var(--bg-secondary))] shadow-lg shadow-blue-500/10">
                            <div className="border-b border-blue-500/20 bg-blue-500/10 px-2 py-1">
                                <span className="text-[8px] font-semibold text-blue-300">users</span>
                            </div>
                            <div className="space-y-0.5 p-1.5">
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-yellow-400">🔑</span>
                                    <span className="text-[7px] text-white/70">id</span>
                                    <span className="ml-auto text-[6px] text-white/40">INT</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-purple-400">•</span>
                                    <span className="text-[7px] text-white/60">email</span>
                                    <span className="ml-auto text-[6px] text-white/40">VARCHAR</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-white/30">•</span>
                                    <span className="text-[7px] text-white/50">name</span>
                                    <span className="ml-auto text-[6px] text-white/40">VARCHAR</span>
                                </div>
                            </div>
                        </div>
                        {/* Relationship line */}
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] text-white/30">1</span>
                            <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500/50 to-green-500/50"></div>
                            <span className="text-[8px] text-white/30">N</span>
                        </div>
                        {/* Roles table */}
                        <div className="w-28 rounded border border-green-500/30 bg-[hsl(var(--bg-secondary))] shadow-lg shadow-green-500/10">
                            <div className="border-b border-green-500/20 bg-green-500/10 px-2 py-1">
                                <span className="text-[8px] font-semibold text-green-300">roles</span>
                            </div>
                            <div className="space-y-0.5 p-1.5">
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-yellow-400">🔑</span>
                                    <span className="text-[7px] text-white/70">id</span>
                                    <span className="ml-auto text-[6px] text-white/40">INT</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-blue-400">↗</span>
                                    <span className="text-[7px] text-white/60">user_id</span>
                                    <span className="ml-auto text-[6px] text-white/40">FK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Feature Spec */}
            <div className="flex w-1/2 flex-col bg-[hsl(var(--bg-secondary))]">
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-3 py-1.5">
                    <span className="text-[8px] font-medium text-white/70">Feature Spec</span>
                    <div className="flex gap-1">
                        <div className="h-4 w-4 rounded border border-white/10 bg-white/5 flex items-center justify-center text-[7px] text-white/40">📋</div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden p-3">
                    <div className="space-y-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[6px] font-medium text-blue-300">FR-1</span>
                                <span className="text-[8px] font-semibold text-white/90">User Authentication</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="rounded bg-green-500/20 px-1 py-0.5 text-[5px] text-green-400">High Priority</span>
                                <span className="rounded bg-white/10 px-1 py-0.5 text-[5px] text-white/50">Core</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[7px] font-medium text-white/60">Description</span>
                            <div className="h-1.5 w-full rounded bg-white/10"></div>
                            <div className="h-1.5 w-4/5 rounded bg-white/10"></div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[7px] font-medium text-white/60">Acceptance Criteria</span>
                            <div className="space-y-0.5 pl-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-green-400">✓</span>
                                    <div className="h-1 w-24 rounded bg-white/10"></div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-green-400">✓</span>
                                    <div className="h-1 w-20 rounded bg-white/10"></div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[6px] text-green-400">✓</span>
                                    <div className="h-1 w-28 rounded bg-white/10"></div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[7px] font-medium text-white/60">Sequence Diagram</span>
                            <div className="rounded border border-white/10 bg-white/[0.02] p-1.5">
                                <div className="flex justify-around">
                                    {['User', 'API', 'DB'].map((p, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className="rounded bg-white/10 px-1.5 py-0.5 text-[5px] text-white/60">{p}</div>
                                            <div className="mt-1 h-6 w-px bg-white/20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // GitHub Export Mockup - Accurate export structure
    const GitHubExportMockup = () => (
        <div className="h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(var(--bg-secondary))]">
            <div className="flex h-full flex-col">
                {/* GitHub-style header */}
                <div className="flex items-center gap-3 border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-4 py-2">
                    <svg className="h-5 w-5 text-white/70" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    <span className="text-[10px] font-medium text-white/80">your-project / specs</span>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                            <span className="text-[7px] text-green-400">Exported</span>
                        </div>
                    </div>
                </div>

                {/* File tree - Accurate structure from ProjectSpecsExportService */}
                <div className="flex-1 overflow-hidden bg-[hsl(var(--bg-secondary))] p-4">
                    <div className="space-y-0.5 font-mono">
                        {/* specs/ folder */}
                        <div className="flex items-center gap-2 rounded px-2 py-1 text-white/70 hover:bg-white/5">
                            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                            <span className="text-[9px] font-medium">specs/</span>
                        </div>
                        
                        {/* PRD.md */}
                        <div className="ml-4 flex items-center gap-2 rounded px-2 py-1 text-white/60 hover:bg-white/5">
                            <svg className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span className="text-[9px]">PRD.md</span>
                            <span className="ml-auto rounded bg-purple-500/20 px-1.5 py-0.5 text-[6px] text-purple-300">PRD + Features</span>
                        </div>

                        {/* modules/ folder */}
                        <div className="ml-4 flex items-center gap-2 rounded px-2 py-1 text-white/70 hover:bg-white/5">
                            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                            <span className="text-[9px] font-medium">modules/</span>
                        </div>

                        {/* user-management module */}
                        <div className="ml-8 flex items-center gap-2 rounded px-2 py-1 text-white/60 hover:bg-white/5">
                            <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                            <span className="text-[9px]">user-management/</span>
                        </div>
                        <div className="ml-12 flex items-center gap-2 rounded px-2 py-1 text-white/50 hover:bg-white/5">
                            <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span className="text-[8px]">ERD.md</span>
                            <span className="ml-auto text-[6px] text-white/30">Mermaid ERD</span>
                        </div>
                        <div className="ml-12 flex items-center gap-2 rounded px-2 py-1 text-white/50 hover:bg-white/5">
                            <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span className="text-[8px]">user-authentication.md</span>
                        </div>
                        <div className="ml-12 flex items-center gap-2 rounded px-2 py-1 text-white/50 hover:bg-white/5">
                            <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span className="text-[8px]">user-profile.md</span>
                        </div>

                        {/* order-processing module */}
                        <div className="ml-8 flex items-center gap-2 rounded px-2 py-1 text-white/60 hover:bg-white/5">
                            <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                            <span className="text-[9px]">order-processing/</span>
                        </div>
                        <div className="ml-12 flex items-center gap-2 rounded px-2 py-1 text-white/50 hover:bg-white/5">
                            <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span className="text-[8px]">ERD.md</span>
                        </div>
                    </div>
                </div>

                {/* Footer with export info */}
                <div className="flex items-center justify-between border-t border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-4 py-2">
                    <span className="text-[7px] text-white/40">AI-ready for Cursor, Copilot & Claude</span>
                    <div className="flex items-center gap-1.5 text-[7px] text-white/50">
                        <span>12 files</span>
                        <span>•</span>
                        <span>4 modules</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Wireframes Mockup
    const WireframesMockup = () => (
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[hsl(var(--bg-secondary))]">
            {/* Left - Wireframe preview */}
            <div className="flex w-3/5 flex-col border-r border-white/[0.08]">
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-3 py-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-medium text-white/70">Login Page</span>
                        <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[6px] text-orange-300">Wireframe</span>
                    </div>
                    <div className="flex gap-1">
                        <div className="h-4 w-4 rounded border border-white/10 bg-white/5"></div>
                        <div className="h-4 w-4 rounded border border-white/10 bg-white/5"></div>
                    </div>
                </div>
                <div className="relative flex-1 bg-[hsl(var(--bg-secondary))] p-4">
                    {/* Dot grid background */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                            backgroundSize: '12px 12px',
                        }}
                    />
                    {/* Wireframe mockup */}
                    <div className="relative mx-auto h-full max-w-[180px] rounded border-2 border-dashed border-white/20 bg-white/[0.02] p-3">
                        {/* Logo placeholder */}
                        <div className="mx-auto mb-3 h-6 w-12 rounded bg-white/10"></div>
                        {/* Title */}
                        <div className="mx-auto mb-4 h-2 w-16 rounded bg-white/20"></div>
                        {/* Input fields */}
                        <div className="mb-2 h-5 w-full rounded border border-white/15 bg-white/5"></div>
                        <div className="mb-3 h-5 w-full rounded border border-white/15 bg-white/5"></div>
                        {/* Button */}
                        <div className="h-5 w-full rounded bg-blue-500/30 border border-blue-500/40"></div>
                        {/* Links */}
                        <div className="mt-3 flex justify-center gap-3">
                            <div className="h-1.5 w-10 rounded bg-white/10"></div>
                            <div className="h-1.5 w-12 rounded bg-white/10"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Wireframe list */}
            <div className="flex w-2/5 flex-col bg-[hsl(var(--bg-secondary))]">
                <div className="border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-3 py-1.5">
                    <span className="text-[8px] font-medium text-white/60">Generated Wireframes</span>
                </div>
                <div className="flex-1 space-y-1.5 overflow-auto p-2">
                    {/* Active wireframe */}
                    <div className="rounded border border-blue-500/40 bg-blue-500/10 p-2">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-8 rounded bg-white/10 border border-white/20"></div>
                            <div>
                                <div className="text-[8px] font-medium text-white/80">Login Page</div>
                                <div className="text-[6px] text-white/40">User Management</div>
                            </div>
                        </div>
                    </div>
                    {/* Other wireframes */}
                    <div className="rounded border border-white/[0.08] bg-white/[0.02] p-2 opacity-70">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-8 rounded bg-white/5 border border-white/10"></div>
                            <div>
                                <div className="text-[8px] text-white/60">Dashboard</div>
                                <div className="text-[6px] text-white/30">Analytics</div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded border border-white/[0.08] bg-white/[0.02] p-2 opacity-70">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-8 rounded bg-white/5 border border-white/10"></div>
                            <div>
                                <div className="text-[8px] text-white/60">Product List</div>
                                <div className="text-[6px] text-white/30">Catalog</div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded border border-white/[0.08] bg-white/[0.02] p-2 opacity-70">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-8 rounded bg-white/5 border border-white/10"></div>
                            <div>
                                <div className="text-[8px] text-white/60">Checkout</div>
                                <div className="text-[6px] text-white/30">Order Processing</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-3 py-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[7px] text-white/40">4 wireframes</span>
                        <button className="rounded bg-white/10 px-2 py-0.5 text-[7px] text-white/60">Export All</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const slides = [
        {
            id: 'overview',
            title: 'Project Overview & PRD',
            description:
                'Enter your project brief and Sirius AI generates a complete system overview, PRD, and SRS—transforming your idea into structured documentation in minutes.',
            features: ['AI-generated system overview', 'Complete PRD & SRS creation', 'Version history tracking', 'Markdown + Mermaid diagrams'],
            mockup: <SystemOverviewMockup />,
        },
        {
            id: 'modules',
            title: 'Smart Module Discovery',
            description: 'AI analyzes your project using Domain-Driven Design principles to suggest 8-12 bounded context modules. Select, customize, and enrich them with business metrics.',
            features: ['DDD-based module suggestions', 'Interactive selection UI', 'Auto-enriched descriptions', 'Implementation order planning'],
            mockup: <ModuleDiscoveryMockup />,
        },
        {
            id: 'erd',
            title: 'ERD & Feature Specs',
            description: 'Each module gets detailed feature specs with auto-generated ERDs, sequence diagrams, and technical documentation—all context-aware from your project.',
            features: ['Per-module ERD generation', 'Sequence diagrams', 'Acceptance criteria', 'Cross-module relationships'],
            mockup: <ERDFeatureSpecsMockup />,
        },
        {
            id: 'wireframes',
            title: 'Auto-Generated Wireframes',
            description: 'Visualize your features before writing code. AI generates wireframe mockups for each key screen based on feature requirements.',
            features: ['Feature-based wireframes', 'Multiple page layouts', 'Export as images', 'Design reference for devs'],
            mockup: <WireframesMockup />,
        },
        {
            id: 'github',
            title: 'Export to GitHub',
            description: 'One click exports your complete specs to GitHub. Your AI coding tools (Cursor, Copilot, Claude) get full project context for better code generation.',
            features: ['specs/PRD.md with features', 'specs/modules/{module}/ERD.md', 'Per-feature spec files', 'AI-ready documentation'],
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
        <section id="action-slides" className="space-section py-24 md:py-32 px-4">
            <div className="container mx-auto px-6">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold md:text-5xl">See It in Action</h2>
                    <p className="mx-auto max-w-3xl text-lg text-[#95A2B3]">
                        From project brief to GitHub-ready specs in 5 steps: generate PRDs, discover DDD modules, create ERDs & wireframes, and export structured documentation for AI coding tools
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
                                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-br from-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-secondary))] shadow-inner">
                                                <div className="absolute top-0 right-0 left-0 flex h-8 items-center gap-2 border-b border-white/[0.08] bg-[hsl(var(--bg-secondary))] px-3">
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
                        <CarouselPrevious 
                            className="-left-4 md:-left-12 border-white/20 bg-white/5 text-white hover:!bg-white/5 hover:!text-white hover:!border-white/20 disabled:opacity-30" 
                            onClick={(e) => {
                                handleManualNavigation();
                            }} 
                        />
                        <CarouselNext 
                            className="-right-4 md:-right-12 border-white/20 bg-white/5 text-white hover:!bg-white/5 hover:!text-white hover:!border-white/20 disabled:opacity-30" 
                            onClick={(e) => {
                                handleManualNavigation();
                            }} 
                        />
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
