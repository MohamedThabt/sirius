"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { type SharedData } from "@/types";

// Navigation links for Sirius
const navigationLinks = [
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#features", label: "Features" },
  { href: "/#teams", label: "For Teams" },
  { href: "/#faq", label: "FAQ" },
  { href: "/team", label: "Team", isInertiaLink: true },
];

export const SiriusNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = usePage<SharedData>().props;
  const isAuthenticated = !!auth?.user;

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full py-4 px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-xl rounded-full border border-border/50 shadow-lg w-full max-w-4xl relative z-10">
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
            <img
              src="/images/sirius-logo.png"
              alt="Sirius"
              width={173}
              height={70}
              className="h-8 w-auto"
            />
          </motion.a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationLinks.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              {item.isInertiaLink ? (
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.label}
                </a>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link
              href={isAuthenticated ? "/projects" : "/login"}
              className="inline-flex items-center justify-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {isAuthenticated ? "Projects" : "Sign in"}
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
                href="/beta"
                className="inline-flex items-center justify-center px-5 py-2 text-sm text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-colors font-medium"
              >
                Request Early Access
              </Link>
            </motion.div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden flex items-center p-1"
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-foreground" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-background z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                      className="text-lg text-foreground font-medium hover:text-primary transition-colors"
                      onClick={toggleMenu}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="text-lg text-foreground font-medium hover:text-primary transition-colors"
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
                className="pt-6 flex flex-col gap-3"
              >
                <Link
                  href={isAuthenticated ? "/projects" : "/login"}
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-foreground border border-border rounded-full hover:bg-accent transition-colors font-medium"
                  onClick={toggleMenu}
                >
                  {isAuthenticated ? "Projects" : "Sign in"}
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/beta"
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-colors font-medium"
                    onClick={toggleMenu}
                  >
                    Request Early Access
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
