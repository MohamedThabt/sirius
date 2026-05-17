'use client';

import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import * as React from 'react';
import { useCallback, useState } from 'react';

const navigationLinks = [
    { href: '/#how-it-works', label: 'How it Works' },
    { href: '/#features', label: 'Features' },
    { href: '/#teams', label: 'For Teams' },
    { href: '/pricing', label: 'Pricing', isInertiaLink: true },
    { href: '/#faq', label: 'FAQ' },
    { href: '/team', label: 'Team', isInertiaLink: true },
];

export const SiriusNavbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    const closeMenu = useCallback(() => setIsOpen(false), []);

    return (
        <div className="fixed top-0 right-0 left-0 z-50 flex w-full justify-center px-3 py-3 sm:px-4 sm:py-4">
            <div className="relative z-10 flex w-full max-w-4xl items-center justify-between rounded-full border border-border/50 bg-background/80 px-4 py-2.5 shadow-lg backdrop-blur-xl sm:px-6 sm:py-3">
                {/* Logo */}
                <a href="/" className="flex shrink-0 items-center">
                    <img
                        src="/images/sirius-logo.png"
                        alt="Sirius"
                        width={173}
                        height={70}
                        className="h-7 w-auto sm:h-8"
                        loading="eager"
                    />
                </a>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 md:flex">
                    {navigationLinks.map((item) =>
                        item.isInertiaLink ? (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.label}
                            </a>
                        ),
                    )}
                </nav>

                {/* Desktop CTA Buttons */}
                <div className="hidden items-center gap-2 md:flex">
                    <Link
                        href={isAuthenticated ? '/projects' : '/login'}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {isAuthenticated ? 'Projects' : 'Sign in'}
                    </Link>
                    {!isAuthenticated && (
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Sign Up
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-accent md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-background md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Mobile header */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <a href="/" className="flex items-center" onClick={closeMenu}>
                                <img src="/images/sirius-logo.png" alt="Sirius" className="h-7 w-auto" loading="eager" />
                            </a>
                            <button
                                className="flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-accent"
                                onClick={closeMenu}
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Mobile nav links */}
                        <nav className="flex flex-col px-6 pt-6">
                            {navigationLinks.map((item) => (
                                <React.Fragment key={item.label}>
                                    {item.isInertiaLink ? (
                                        <Link
                                            href={item.href}
                                            className="border-b border-border/30 py-4 text-base font-medium text-foreground transition-colors active:text-primary"
                                            onClick={closeMenu}
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <a
                                            href={item.href}
                                            className="border-b border-border/30 py-4 text-base font-medium text-foreground transition-colors active:text-primary"
                                            onClick={closeMenu}
                                        >
                                            {item.label}
                                        </a>
                                    )}
                                </React.Fragment>
                            ))}

                            <div className="flex flex-col gap-3 pt-8">
                                <Link
                                    href={isAuthenticated ? '/projects' : '/login'}
                                    className="flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-base font-medium text-foreground transition-colors active:bg-accent"
                                    onClick={closeMenu}
                                >
                                    {isAuthenticated ? 'Projects' : 'Sign in'}
                                </Link>
                                {!isAuthenticated && (
                                    <Link
                                        href="/register"
                                        className="flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-base font-medium text-primary-foreground transition-colors active:bg-primary/90"
                                        onClick={closeMenu}
                                    >
                                        Sign Up
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SiriusNavbar;
