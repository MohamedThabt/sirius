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
            {/* Background Effects - Same as welcome page */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-colors duration-500 dark:from-black dark:via-gray-900 dark:to-black"></div>
                <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-200/30 blur-3xl transition-colors duration-500 dark:bg-white/5"></div>
                <div className="absolute top-1/2 right-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-200/30 blur-3xl transition-colors delay-1000 duration-500 dark:bg-white/5"></div>
                <div className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-purple-200/30 blur-3xl transition-colors delay-2000 duration-500 dark:bg-white/5"></div>
            </div>

            <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Link href="/dashboard" className="flex items-center justify-center self-center transition-opacity hover:opacity-80">
                        <span className="text-2xl font-bold text-foreground">Sirius</span>
                    </Link>

                    <Card className="rounded-xl border-slate-200/50 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-white/20 dark:bg-black/20">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl text-slate-800 transition-colors duration-300 dark:text-white">{title}</CardTitle>
                            <CardDescription className="text-slate-600 transition-colors duration-300 dark:text-white/80">
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
