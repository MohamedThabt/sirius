import AppLogoIcon from "@/components/app-logo-icon";

const Footer = () => {
  const links = {
    legal: ["Privacy", "Terms", "Security", "Compliance"],
  };

  return (
    <footer className="relative border-t border-[hsl(var(--subtle-border))] py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Logo and Description */}
          <div>
            <div className="mb-4">
              <AppLogoIcon className="h-8 w-auto" />
            </div>
            <p className="text-sm text-[hsl(var(--text-secondary))] max-w-md">
              AI-powered documentation generation for software engineers. Transform your ideas into complete technical specifications.
            </p>
          </div>

          {/* Legal Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4 capitalize text-[hsl(var(--text-primary))]">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-[hsl(var(--subtle-border))] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            © 2025 Sirius. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
              GitHub
            </a>
            <a href="#" className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
              Discord
            </a>
            <a href="#" className="text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
