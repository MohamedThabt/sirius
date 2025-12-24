import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useForceTheme } from '@/hooks/use-force-theme';
import './landing.css';

interface ErrorProps {
    status: number;
    message?: string;
}

const ERROR_MESSAGES: Record<number, { title: string; description: string }> = {
    503: {
        title: 'Service Unavailable',
        description: 'Sorry, we are doing some maintenance. Please check back soon.',
    },
    500: {
        title: 'Server Error',
        description: 'Whoops, something went wrong on our servers.',
    },
    404: {
        title: 'Page Not Found',
        description: 'Sorry, the page you are looking for could not be found.',
    },
    403: {
        title: 'Forbidden',
        description: 'Sorry, you are forbidden from accessing this page.',
    },
};

export default function Error({ status, message }: ErrorProps) {
    useForceTheme('dark');

    const defaultError = {
        title: 'Error',
        description: message || 'An unexpected error occurred.',
    };

    const { title, description } = ERROR_MESSAGES[status] || defaultError;

    return (
        <div className="linear-landing dark min-h-screen bg-background text-foreground flex flex-col">
            <Head title={`${status}: ${title}`} />
            


            <main className="flex-1 flex items-center justify-center sirius-hero min-h-[80vh] relative overflow-hidden">
                <div className="hero-gradient" aria-hidden="true" />
                <div className="hero-stars hero-stars--one" aria-hidden="true" />
                <div className="hero-stars hero-stars--two" aria-hidden="true" />
                <div className="hero-stars hero-stars--three" aria-hidden="true" />
                <div className="hero-nebula hero-nebula--left" aria-hidden="true" />
                <div className="hero-nebula hero-nebula--right" aria-hidden="true" />
                
                <div className="hero-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="hero-copy text-center w-full flex flex-col items-center animate-in fade-in zoom-in duration-700">
                        
                        {/* Eyebrow with icon */}
                        <div className="hero-eyebrow mb-6 flex items-center justify-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <span>{status} Error</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="hero-headline mb-6 text-center">
                            <span 
                                className="hero-headline-word"
                            >
                                {title}
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p 
                            className="hero-subheadline mx-auto mb-10 max-w-2xl text-balance text-center text-lg leading-relaxed text-white/85 sm:text-xl"
                        >
                            {description}
                        </p>

                        {/* CTA Buttons */}
                        <div 
                            className="hero-cta mb-6 flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Button 
                                size="lg" 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="hero-cta-secondary h-12 px-8 text-base border-white/20 hover:bg-white/10 text-white"
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                Go Back
                            </Button>
                            
                            <Link href="/">
                                <Button 
                                    size="lg" 
                                    className="hero-cta-primary group h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-white border-none"
                                >
                                    <Home className="mr-2 h-5 w-5" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>


        </div>
    );
}
