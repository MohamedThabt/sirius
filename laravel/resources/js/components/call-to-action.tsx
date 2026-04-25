import { Button } from '@/components/ui/button';
import { ctaContent } from '@/lib/sirius/content';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ArrowRightIcon, PlusIcon } from 'lucide-react';

export function CallToAction() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    return (
        <div className="relative mx-auto flex w-[85%] max-w-screen-lg flex-col justify-between gap-y-4 border-y px-4 py-8 dark:bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.2),transparent)]">
            <PlusIcon className="absolute top-[-12.5px] left-[-11.5px] z-1 size-6" strokeWidth={1} />
            <PlusIcon className="absolute top-[-12.5px] right-[-11.5px] z-1 size-6" strokeWidth={1} />
            <PlusIcon className="absolute bottom-[-12.5px] left-[-11.5px] z-1 size-6" strokeWidth={1} />
            <PlusIcon className="absolute right-[-11.5px] bottom-[-12.5px] z-1 size-6" strokeWidth={1} />

            <div className="pointer-events-none absolute -inset-y-6 left-0 w-px border-l" />
            <div className="pointer-events-none absolute -inset-y-6 right-0 w-px border-r" />

            <div className="absolute top-0 left-1/2 -z-10 h-full border-l border-dashed" />

            <h2 className="text-center text-xl font-semibold md:text-3xl">{ctaContent.headline}</h2>
            <p className="text-center text-sm font-medium text-balance text-muted-foreground md:text-base">{ctaContent.body}</p>

            <div className="flex items-center justify-center gap-2">
                <Button asChild>
                    <a href={isAuthenticated ? '/projects' : ctaContent.primaryHref}>
                        {isAuthenticated ? 'Go to Projects' : ctaContent.primaryLabel} <ArrowRightIcon />
                    </a>
                </Button>
            </div>
        </div>
    );
}
