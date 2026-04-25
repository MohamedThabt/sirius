'use client';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, SparklesIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

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
		<div className="bg-primary text-primary-foreground rounded-full p-0.5">
			<CheckIcon className="size-3" strokeWidth={3} />
		</div>
	);
}

function PricingCard({
	titleBadge,
	priceLabel,
	priceSuffix = '/month',
	features,
	cta = 'Subscribe',
	ctaHref,
	className,
}: PricingCardProps) {
	return (
		<div
			className={cn(
				'bg-background border-foreground/10 relative overflow-hidden rounded-md border',
				'supports-[backdrop-filter]:bg-background/10 backdrop-blur',
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
				<span className="font-mono text-5xl font-semibold tracking-tight">
					{priceLabel}
				</span>
				{priceLabel.toLowerCase() !== 'free' && (
					<span className="text-muted-foreground text-sm">{priceSuffix}</span>
				)}
			</div>

			<ul className="text-muted-foreground grid gap-4 p-4 text-sm">
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
	const proPlanFeatures = freePlanFeatures.map((f) =>
		f === '100 AI credits' ? '2000 AI credits' : f,
	);

	return (
		<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-8 max-w-6xl mx-auto">
			<div
				className={cn(
					'bg-background border-foreground/10 relative w-full overflow-hidden rounded-md border',
					'supports-[backdrop-filter]:bg-background/10 backdrop-blur',
					'lg:col-span-5',
				)}
			>
				<div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
					<div className="from-primary/10 to-primary/5 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
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
				<div className="flex items-center gap-3 p-4 relative z-10">
					<Badge variant="secondary">PRO</Badge>
					<Badge variant="outline" className="hidden lg:flex border-primary text-primary">
						<SparklesIcon className="me-1 size-3" /> Beta Exclusive
					</Badge>
					<div className="ml-auto">
						<Link href="/upgrade/pro">
							<Button>Upgrade to Pro</Button>
						</Link>
					</div>
				</div>
				<div className="flex flex-col p-4 lg:flex-row relative z-10 h-full">
					<div className="pb-4 lg:w-[30%]">
						<div className="flex flex-col">
							<span className="mb-2 w-fit rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
								Instead of $15
							</span>
							<div className="flex items-baseline">
								<span className="font-mono text-5xl font-semibold tracking-tight">
									200
								</span>
								<span className="text-lg font-semibold ml-1">EGP</span>
							</div>
							<span className="text-muted-foreground text-sm mt-1">/month</span>
						</div>
					</div>
					<ul className="text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm lg:w-[70%] lg:pl-6">
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
