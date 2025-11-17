import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user || !!auth?.admin;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setMobileMenuOpen(false); // Close mobile menu on scroll

            // Determine active section based on scroll position
            const sections = ['features', 'action-slides', 'method', 'pricing'];
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i]);
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i]);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Call once to set initial state
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setMobileMenuOpen(false); // Close mobile menu when navigating
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Account for fixed navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                scrolled ? 'border-b border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-primary))]/80 backdrop-blur-xl' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <a href="#" onClick={handleLogoClick} className="flex items-center">
                            <AppLogoIcon className="h-8 w-auto" />
                        </a>
                    </div>

                    {/* Desktop Nav - Centered */}
                    <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
                        <a
                            href="#features"
                            onClick={(e) => handleNavClick(e, 'features')}
                            className={`text-sm transition-colors ${
                                activeSection === 'features'
                                    ? 'font-medium text-[hsl(var(--text-primary))]'
                                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                        >
                            Features
                        </a>
                        <a
                            href="#action-slides"
                            onClick={(e) => handleNavClick(e, 'action-slides')}
                            className={`text-sm transition-colors ${
                                activeSection === 'action-slides'
                                    ? 'font-medium text-[hsl(var(--text-primary))]'
                                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                        >
                            See It in Action
                        </a>
                        <a
                            href="#method"
                            onClick={(e) => handleNavClick(e, 'method')}
                            className={`text-sm transition-colors ${
                                activeSection === 'method'
                                    ? 'font-medium text-[hsl(var(--text-primary))]'
                                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                        >
                            How It Works
                        </a>
                        <a
                            href="#pricing"
                            onClick={(e) => handleNavClick(e, 'pricing')}
                            className={`text-sm transition-colors ${
                                activeSection === 'pricing'
                                    ? 'font-medium text-[hsl(var(--text-primary))]'
                                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                            }`}
                        >
                            Pricing
                        </a>
                    </div>

                    {/* Mobile Nav - Hamburger Menu */}
                    <div className="relative md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-md p-2 text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-secondary))] hover:text-[hsl(var(--text-primary))]"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            ) : (
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            )}
                        </button>
                        {mobileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40 mt-16 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-[hsl(var(--subtle-border))] bg-[hsl(var(--bg-primary))] py-2 shadow-lg">
                                    <a
                                        href="#features"
                                        onClick={(e) => handleNavClick(e, 'features')}
                                        className="block px-4 py-2 text-sm text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-secondary))] hover:text-[hsl(var(--text-primary))]"
                                    >
                                        Features
                                    </a>
                                    <a
                                        href="#action-slides"
                                        onClick={(e) => handleNavClick(e, 'action-slides')}
                                        className="block px-4 py-2 text-sm text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-secondary))] hover:text-[hsl(var(--text-primary))]"
                                    >
                                        See It in Action
                                    </a>
                                    <a
                                        href="#method"
                                        onClick={(e) => handleNavClick(e, 'method')}
                                        className="block px-4 py-2 text-sm text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-secondary))] hover:text-[hsl(var(--text-primary))]"
                                    >
                                        How It Works
                                    </a>
                                    <a
                                        href="#pricing"
                                        onClick={(e) => handleNavClick(e, 'pricing')}
                                        className="block px-4 py-2 text-sm text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-secondary))] hover:text-[hsl(var(--text-primary))]"
                                    >
                                        Pricing
                                    </a>
                                </div>
                            </>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                        {!isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] md:inline-flex"
                                asChild
                            >
                                <a href="/login">Sign In</a>
                            </Button>
                        )}
                        <Button variant="default" size="sm" className="bg-white text-black hover:bg-white/90" asChild>
                            <a href="/projects">Start Creating Documentation</a>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
