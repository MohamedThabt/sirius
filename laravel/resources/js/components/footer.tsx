import AppLogo from '@/components/app-logo';
import { cn } from '@/lib/utils';

// Custom X (formerly Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// Custom Telegram icon
const TelegramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

export function Footer() {
    const company = [
        {
            title: 'Team',
            href: '/team',
        },
    ];

    const resources = [
        {
            title: 'Pricing',
            href: '/pricing',
        },
    ];

    const socialLinks = [
        {
            icon: XIcon,
            link: 'https://x.com/BuildWithSirius',
            label: 'Follow us on X (Twitter)',
        },
        {
            icon: TelegramIcon,
            link: 'https://t.me/sirius_ai_community',
            label: 'Join our Telegram community',
        },
    ];

    return (
        <footer className="relative">
            <div
                className={cn(
                    'mx-auto w-[95%] max-w-screen-2xl lg:border-x',
                    'bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.05),transparent)] dark:bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)]',
                )}
            >
                <div className="absolute inset-x-0 h-px w-full bg-border" />
                <div className="grid max-w-screen-2xl grid-cols-6 gap-6 p-4">
                    <div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
                        <a className="w-max" href="/" aria-label="Sirius - Go to homepage">
                            <AppLogo />
                        </a>
                        <p className="max-w-sm font-mono text-sm text-balance text-muted-foreground">
                            Pre-code documentation for serious engineering teams.
                        </p>
                        <div className="flex gap-2">
                            {socialLinks.map((item, index) => (
                                <a
                                    key={`social-${item.link}-${index}`}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={item.label}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    <item.icon className="size-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-xs text-muted-foreground">Resources</span>
                        <div className="mt-2 flex flex-col gap-2">
                            {resources.map(({ href, title }) => (
                                <a className="w-max text-sm hover:underline" href={href} key={title}>
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 w-full md:col-span-1">
                        <span className="text-xs text-muted-foreground">Company</span>
                        <div className="mt-2 flex flex-col gap-2">
                            {company.map(({ href, title }) => (
                                <a className="w-max text-sm hover:underline" href={href} key={title}>
                                    {title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute inset-x-0 h-px w-full bg-border" />
                <div className="flex w-full flex-col justify-between gap-2 py-4">
                    <p className="text-center text-sm font-light text-muted-foreground">
                        &copy; {new Date().getFullYear()} Sirius, All rights reserved
                    </p>
                </div>
            </div>
        </footer>
    );
}
