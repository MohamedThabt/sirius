import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <>
            {/* Background Effects - Atmospheric orbs from ElevenLabs */}
            <div className="fixed inset-0 -z-10 bg-background overflow-hidden">
                <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-mint/30 blur-3xl transition-colors duration-500"></div>
                <div className="absolute top-1/2 right-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-sky/30 blur-3xl transition-colors delay-1000 duration-500"></div>
                <div className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-gradient-lavender/30 blur-3xl transition-colors delay-2000 duration-500"></div>
            </div>

            <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Link href="/dashboard" className="flex items-center justify-center self-center transition-opacity hover:opacity-80">
                        <span className="text-2xl font-bold text-foreground">Sirius</span>
                    </Link>

                    <Card className="rounded-xl border-border bg-card/80 backdrop-blur-xl transition-colors duration-300">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl text-foreground transition-colors duration-300">{title}</CardTitle>
                            <CardDescription className="text-muted-foreground transition-colors duration-300">
                                {description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
