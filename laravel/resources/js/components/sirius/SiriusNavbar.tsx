'use client';

import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

// Navigation links for Sirius
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

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="fixed top-0 right-0 left-0 z-50 flex w-full justify-center px-4 py-4">
            <div className="relative z-10 flex w-full max-w-4xl items-center justify-between rounded-full border border-border/50 bg-background/80 px-6 py-3 shadow-lg backdrop-blur-xl">
                {/* Logo */}
                <div className="flex items-center">
                    <motion.a
                        href="/"
                        className="flex items-center"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        <img src="/images/sirius-logo.png" alt="Sirius" width={173} height={70} className="h-8 w-auto" />
                    </motion.a>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden items-center space-x-6 md:flex">
                    {navigationLinks.map((item, index) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            {item.isInertiaLink ? (
                                <Link href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                                    {item.label}
                                </Link>
                            ) : (
                                <a href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                                    {item.label}
                                </a>
                            )}
                        </motion.div>
                    ))}
                </nav>

                {/* Desktop CTA Buttons */}
                <div className="hidden items-center gap-2 md:flex">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Link
                            href={isAuthenticated ? '/projects' : '/login'}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {isAuthenticated ? 'Projects' : 'Sign in'}
                        </Link>
                    </motion.div>
                    {!isAuthenticated && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Sign Up
                            </Link>
                        </motion.div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <motion.button className="flex items-center p-1 md:hidden" onClick={toggleMenu} whileTap={{ scale: 0.9 }} aria-label="Open menu">
                    <Menu className="h-6 w-6 text-foreground" />
                </motion.button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-background px-6 pt-24 md:hidden"
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <motion.button
                            className="absolute top-6 right-6 p-2"
                            onClick={toggleMenu}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6 text-foreground" />
                        </motion.button>

                        <div className="flex flex-col space-y-6">
                            {navigationLinks.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 + 0.1 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    {item.isInertiaLink ? (
                                        <Link
                                            href={item.href}
                                            className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                                            onClick={toggleMenu}
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <a
                                            href={item.href}
                                            className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                                            onClick={toggleMenu}
                                        >
                                            {item.label}
                                        </a>
                                    )}
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex flex-col gap-3 pt-6"
                            >
                                <Link
                                    href={isAuthenticated ? '/projects' : '/login'}
                                    className="inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                                    onClick={toggleMenu}
                                >
                                    {isAuthenticated ? 'Projects' : 'Sign in'}
                                </Link>
                                {!isAuthenticated && (
                                    <Link
                                        href="/register"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                        onClick={toggleMenu}
                                    >
                                        Sign Up
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SiriusNavbar;
