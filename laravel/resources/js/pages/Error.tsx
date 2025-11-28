import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import './landing.css';

interface ErrorProps {
    status: number;
    message?: string;
}

export default function Error({ status, message }: ErrorProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('dark');
        setIsVisible(true);
        return () => {
            // Optional: remove dark class when leaving
        };
    }, []);

    const title = {
        503: 'Service Unavailable',
        500: 'Server Error',
        404: 'Page Not Found',
        403: 'Forbidden',
    }[status] || 'Error';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status] || message || 'An unexpected error occurred.';

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
                    <div className="hero-copy text-center w-full flex flex-col items-center" style={{ opacity: isVisible ? 1 : 0 }}>
                        
                        {/* Eyebrow with icon */}
                        <div className="hero-eyebrow mb-6 flex items-center justify-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span>{status} Error</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="hero-headline mb-6 text-center">
                            <span 
                                className="hero-headline-word"
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? "translateY(0)" : "translateY(20%)",
                                    transitionDelay: "0.1s",
                                }}
                            >
                                {title}
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p 
                            className="hero-subheadline mx-auto mb-10 max-w-2xl text-balance text-center text-lg leading-relaxed text-white/85 sm:text-xl"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateY(0)" : "translateY(16px)",
                                transitionDelay: "0.25s",
                            }}
                        >
                            {description}
                        </p>

                        {/* CTA Buttons */}
                        <div 
                            className="hero-cta mb-6 flex flex-col sm:flex-row gap-4 justify-center"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateY(0)" : "translateY(12px)",
                                transitionDelay: "0.45s",
                            }}
                        >
                            <Button 
                                size="lg" 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="hero-cta-secondary h-12 px-8 text-base border-white/20 hover:bg-white/10 text-white"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go Back
                            </Button>
                            
                            <Link href="/">
                                <Button 
                                    size="lg" 
                                    className="hero-cta-primary group h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-white border-none"
                                >
                                    <Home className="mr-2 h-4 w-4" />
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
