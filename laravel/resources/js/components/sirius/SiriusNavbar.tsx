import React from "react";
import { motion } from "framer-motion";
import { Link, usePage } from "@inertiajs/react";
import { type SharedData } from "@/types";

export const SiriusNavbar: React.FC = () => {
  const { auth } = usePage<SharedData>().props;
  const isAuthenticated = !!auth?.user;
  
  // Check if we're on the landing page
  const isLandingPage = typeof window !== 'undefined' && window.location.pathname === '/';

  // Handle navigation to sections - if on landing page, scroll; otherwise navigate to landing with hash
  const getSectionHref = (hash: string) => {
    return isLandingPage ? hash : `/${hash}`;
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="sirius-container">
        <nav className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center group">
            <img
              src="/images/sirius-logo.png"
              alt="Sirius"
              className="h-10 w-auto"
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href={getSectionHref("#how-it-works")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              How it Works
            </a>
            <a
              href={getSectionHref("#features")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href={getSectionHref("#teams")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              For Teams
            </a>
            <a
              href={getSectionHref("#faq")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </a>
            <Link
              href="/team"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Team
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={isAuthenticated ? "/projects" : "/login"}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Link>
            <Link
              href="/beta"
              className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Request Access
            </Link>
          </div>
        </nav>
      </div>
    </motion.header>
  );
};

export default SiriusNavbar;
