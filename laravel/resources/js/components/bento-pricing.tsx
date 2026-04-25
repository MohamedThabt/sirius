'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { CheckIcon, SparklesIcon } from 'lucide-react';

type PricingCardProps = {
    titleBadge: string;
    priceLabel: string;
    priceSuffix?: string;
    features: string[];
    cta?: string;
    ctaHref?: string;
    className?: string;
};

function FilledCheck() {
    return (
        <div className="rounded-full bg-primary p-0.5 text-primary-foreground">
            <CheckIcon className="size-3" strokeWidth={3} />
        </div>
    );
}

function PricingCard({ titleBadge, priceLabel, priceSuffix = '/month', features, cta = 'Subscribe', ctaHref, className }: PricingCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-md border border-foreground/10 bg-background',
                'backdrop-blur supports-[backdrop-filter]:bg-background/10',
                className,
            )}
        >
            <div className="flex items-center gap-3 p-4">
                <Badge variant="secondary">{titleBadge}</Badge>
                <div className="ml-auto">
                    {ctaHref ? (
                        <Link href={ctaHref}>
                            <Button variant="outline">{cta}</Button>
                        </Link>
                    ) : (
                        <Button variant="outline">{cta}</Button>
                    )}
                </div>
            </div>

            <div className="flex items-end gap-2 px-4 py-2">
                <span className="font-mono text-5xl font-semibold tracking-tight">{priceLabel}</span>
                {priceLabel.toLowerCase() !== 'free' && <span className="text-sm text-muted-foreground">{priceSuffix}</span>}
            </div>

            <ul className="grid gap-4 p-4 text-sm text-muted-foreground">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <FilledCheck />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function BentoPricing() {
    const freePlanFeatures = [
        'PRDs & Technical Specs',
        'AI Brainstorming',
        'Modules & Features Management',
        'Team Sync',
        'ERDs & Sequence Diagrams',
        'GitHub Export',
        '100 Free AI Credits',
    ];

    /** Pro = every Free feature, with 2000 AI credits instead of the free-tier credits line. */
    const proPlanFeatures = freePlanFeatures.map((f) => (f === '100 AI credits' ? '2000 AI credits' : f));

    return (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-8">
            <div
                className={cn(
                    'relative w-full overflow-hidden rounded-md border border-foreground/10 bg-background',
                    'backdrop-blur supports-[backdrop-filter]:bg-background/10',
                    'lg:col-span-5',
                )}
            >
                <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                        <div
                            aria-hidden="true"
                            className={cn(
                                'absolute inset-0 size-full mix-blend-overlay',
                                'bg-[linear-gradient(to_right,--theme(--color-foreground/.1)_1px,transparent_1px)]',
                                'bg-[size:24px]',
                            )}
                        />
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-3 p-4">
                    <Badge variant="secondary">PRO</Badge>
                    <Badge variant="outline" className="hidden border-primary text-primary lg:flex">
                        <SparklesIcon className="me-1 size-3" /> Beta Exclusive
                    </Badge>
                    <div className="ml-auto">
                        <Link href="/upgrade/pro">
                            <Button>Upgrade to Pro</Button>
                        </Link>
                    </div>
                </div>
                <div className="relative z-10 flex h-full flex-col p-4 lg:flex-row">
                    <div className="pb-4 lg:w-[30%]">
                        <div className="flex flex-col">
                            <span className="mb-2 w-fit rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Instead of $15</span>
                            <div className="flex items-baseline">
                                <span className="font-mono text-5xl font-semibold tracking-tight">200</span>
                                <span className="ml-1 text-lg font-semibold">EGP</span>
                            </div>
                            <span className="mt-1 text-sm text-muted-foreground">/month</span>
                        </div>
                    </div>
                    <ul className="grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:w-[70%] lg:pl-6">
                        {proPlanFeatures.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <FilledCheck />
                                <span className="leading-relaxed">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <PricingCard
                titleBadge="FREE"
                priceLabel="0"
                priceSuffix=" EGP /month"
                features={freePlanFeatures}
                className="lg:col-span-3"
                cta="Get Started"
                ctaHref="/projects"
            />
        </div>
    );
}
