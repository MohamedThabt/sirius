import AppLogoIcon from "@/components/app-logo-icon";

const Footer = () => {
  return (
    <footer className="relative border-t border-[hsl(var(--subtle-border))] py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <AppLogoIcon className="h-8 w-auto" />
            </div>
            <p className="text-sm text-[hsl(var(--text-secondary))] max-w-md mb-6">
              Sirius is an AI-powered pre-code planning platform that transforms project briefs into complete technical specifications. Generate PRDs, ERDs, user stories, and wireframes in hours, then export to GitHub for AI code generators.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-[hsl(var(--text-primary))]">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#action-slides"
                  className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                >
                  See It in Action
                </a>
              </li>
              <li>
                <a
                  href="/beta"
                  className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                >
                  Join Closed Beta
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                >
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-[hsl(var(--subtle-border))] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            © 2025 Sirius. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[hsl(var(--text-tertiary))]">
            <span>Built for engineers who ship</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
