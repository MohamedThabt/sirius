import { useEffect, useState } from 'react';

interface AuthVisualProps {
    variant?: 'login' | 'register';
}

export default function AuthVisual({ variant = 'login' }: AuthVisualProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    // ERD Visual
    const ERDVisual = () => (
        <div
            className="relative h-full w-full overflow-hidden rounded-xl border border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))] p-6 shadow-2xl backdrop-blur-sm"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.95)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Database Tables - Vertical layout with users at top */}
            <div className="relative flex h-full flex-col items-center justify-center gap-4">
                {/* Users Table - Center/Top */}
                <div className="relative z-20 w-[180px] rounded-lg border border-white/[0.15] bg-[hsl(var(--bg-secondary))] p-4 shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-2xl">
                    <div className="mb-3 flex items-center justify-between border-b border-white/[0.1] pb-2">
                        <div className="text-xs font-semibold text-white/95">users</div>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400/60"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400/80" title="Primary Key"></div>
                            <div className="flex-1 text-[11px] font-medium text-white/90">id</div>
                            <div className="text-[10px] text-white/50">int</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400/70" title="Unique"></div>
                            <div className="flex-1 text-[11px] text-white/80">email</div>
                            <div className="text-[10px] text-white/50">varchar</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 shrink-0"></div>
                            <div className="flex-1 text-[11px] text-white/80">name</div>
                            <div className="text-[10px] text-white/50">varchar</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 shrink-0"></div>
                            <div className="flex-1 text-[11px] text-white/80">created_at</div>
                            <div className="text-[10px] text-white/50">timestamp</div>
                        </div>
                    </div>
                </div>

                {/* Connection Lines Container */}
                <div className="relative z-10 flex h-16 w-full items-start justify-center">
                    {/* Left Connection to Products */}
                    <div className="absolute top-0 left-[calc(50%-140px)] flex flex-col items-center" style={{ width: '140px' }}>
                        {/* Vertical line down */}
                        <div className="h-6 w-0.5 bg-white/35"></div>
                        {/* Horizontal line */}
                        <div className="relative h-0.5 w-full bg-white/35">
                            {/* Arrow at end */}
                            <div className="absolute top-1/2 right-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-white/50 bg-[hsl(220_13%_8%)]"></div>
                        </div>
                        {/* Cardinality badge */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2">
                            <div className="rounded border border-white/10 bg-[hsl(var(--bg-secondary))] px-1.5 py-0.5 backdrop-blur-sm">
                                <span className="text-[9px] font-medium text-[hsl(var(--text-secondary))]">1:∞</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Connection to Orders */}
                    <div className="absolute top-0 right-[calc(50%-140px)] flex flex-col items-center" style={{ width: '140px' }}>
                        {/* Vertical line down */}
                        <div className="h-6 w-0.5 bg-white/35"></div>
                        {/* Horizontal line */}
                        <div className="relative h-0.5 w-full bg-white/35">
                            {/* Arrow at end */}
                            <div className="absolute top-1/2 right-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-white/50 bg-[hsl(220_13%_8%)]"></div>
                        </div>
                        {/* Cardinality badge */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2">
                            <div className="rounded border border-white/10 bg-[hsl(var(--bg-secondary))] px-1.5 py-0.5 backdrop-blur-sm">
                                <span className="text-[9px] font-medium text-[hsl(var(--text-secondary))]">1:∞</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Tables Row */}
                <div className="relative z-20 flex items-center justify-center gap-8">
                    {/* Products Table */}
                    <div className="w-[180px] rounded-lg border border-white/[0.15] bg-[hsl(var(--bg-secondary))] p-4 shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-2xl">
                        <div className="mb-3 flex items-center justify-between border-b border-white/[0.1] pb-2">
                            <div className="text-xs font-semibold text-white/95">products</div>
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400/60"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400/80" title="Primary Key"></div>
                                <div className="flex-1 text-[11px] font-medium text-white/90">id</div>
                                <div className="text-[10px] text-white/50">int</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/70" title="Foreign Key"></div>
                                <div className="flex-1 text-[11px] text-white/80">user_id</div>
                                <div className="text-[10px] text-white/50">int</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 shrink-0"></div>
                                <div className="flex-1 text-[11px] text-white/80">title</div>
                                <div className="text-[10px] text-white/50">varchar</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 shrink-0"></div>
                                <div className="flex-1 text-[11px] text-white/80">price</div>
                                <div className="text-[10px] text-white/50">decimal</div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="w-[180px] rounded-lg border border-white/[0.15] bg-[hsl(var(--bg-secondary))] p-4 shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-2xl">
                        <div className="mb-3 flex items-center justify-between border-b border-white/[0.1] pb-2">
                            <div className="text-xs font-semibold text-white/95">orders</div>
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-400/60"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400/80" title="Primary Key"></div>
                                <div className="flex-1 text-[11px] font-medium text-white/90">id</div>
                                <div className="text-[10px] text-white/50">int</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/70" title="Foreign Key"></div>
                                <div className="flex-1 text-[11px] text-white/80">user_id</div>
                                <div className="text-[10px] text-white/50">int</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 shrink-0"></div>
                                <div className="flex-1 text-[11px] text-white/80">total</div>
                                <div className="text-[10px] text-white/50">decimal</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 shrink-0"></div>
                                <div className="flex-1 text-[11px] text-white/80">status</div>
                                <div className="text-[10px] text-white/50">varchar</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Sequence Diagram Visual
    const SequenceDiagramVisual = () => (
        <div
            className="relative h-full w-full overflow-hidden rounded-xl border border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-secondary))] p-6 shadow-2xl backdrop-blur-sm"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.95)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <div className="relative h-full rounded-lg border border-white/[0.08] bg-[hsl(var(--bg-secondary))] p-6">
                {/* Participants with Lifelines */}
                <div className="relative mb-4 flex items-start justify-between">
                    {['User', 'API', 'Database'].map((participant, idx) => (
                        <div key={idx} className="relative flex flex-1 flex-col items-center">
                            {/* Participant Box */}
                            <div className="z-20 mb-3 flex h-8 w-24 items-center justify-center rounded border border-white/[0.18] bg-[hsl(var(--bg-secondary))] shadow-sm transition-all duration-300 hover:border-white/30 hover:shadow-md">
                                <div className="text-[10px] font-medium text-[hsl(var(--text-primary))]">{participant}</div>
                            </div>
                            {/* Lifeline */}
                            <div
                                className="absolute z-0 w-0.5 bg-white/25"
                                style={{
                                    top: '2.5rem',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    height: '140px',
                                }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Messages */}
                <div className="relative z-10" style={{ height: '140px', marginTop: '0.5rem' }}>
                    {/* Message 1: User -> API (POST /login) */}
                    <div className="absolute" style={{ top: '16px', left: '16.66%', right: '50%' }}>
                        <div className="h-0.5 bg-blue-400/80" style={{ width: 'calc(100% - 24px)', marginLeft: '24px' }}></div>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="text-[9px] font-medium text-blue-300">POST /login</div>
                        </div>
                    </div>

                    {/* Message 2: API -> Database (Query users) */}
                    <div className="absolute" style={{ top: '56px', left: '50%', right: '16.66%' }}>
                        <div className="h-0.5 bg-green-400/80" style={{ width: 'calc(100% - 24px)' }}></div>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="text-[9px] font-medium text-green-300">Query users</div>
                        </div>
                    </div>

                    {/* Message 3: Database -> API (User data) */}
                    <div className="absolute" style={{ top: '96px', left: '50%', right: '16.66%' }}>
                        <div className="h-0.5 bg-purple-400/80" style={{ width: 'calc(100% - 24px)' }}></div>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="text-[9px] font-medium text-purple-300">User data</div>
                        </div>
                    </div>

                    {/* Message 4: API -> User (200 OK) */}
                    <div className="absolute" style={{ top: '136px', left: '16.66%', right: '50%' }}>
                        <div className="h-0.5 bg-green-400/80" style={{ width: 'calc(100% - 24px)', marginLeft: '24px' }}></div>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="text-[9px] font-medium text-green-300">200 OK</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <div className="relative h-[500px] w-full">{variant === 'login' ? <ERDVisual /> : <SequenceDiagramVisual />}</div>;
}
