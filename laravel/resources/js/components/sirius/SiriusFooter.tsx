import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TwitterIcon } from 'lucide-react';

export function SiriusFooter() {
    const socialLinks = [
        {
            icon: TwitterIcon,
            link: 'https://x.com/SirThabet',
        },
    ];

    return (
        <footer className="w-full bg-background">
            <div className="border-t border-border" />

            <div className="mx-auto max-w-7xl">
                <div className="border-x border-border px-6 py-12 md:py-16">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <a href="/" className="group flex items-center" aria-label="Sirius - Go to homepage">
                            <img src="/images/sirius-logo.png" alt="Sirius" width={173} height={70} className="h-10 w-auto" />
                        </a>
                        <p className="max-w-md font-mono text-sm leading-6 text-muted-foreground">
                            Pre-code documentation for serious engineering teams.
                        </p>
                        <div className="flex items-center gap-2">
                            {socialLinks.map((item, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="icon"
                                    className={cn('h-9 w-9 rounded-md border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground')}
                                    asChild
                                >
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label="Follow us on X (Twitter)">
                                        <item.icon className="h-4 w-4" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-x border-t border-border">
                    <div className="px-6 py-6">
                        <p className="text-center text-sm leading-5 text-muted-foreground">
                            © {new Date().getFullYear()} Sirius, All rights reserved
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-border" />
        </footer>
    );
}

export default SiriusFooter;
