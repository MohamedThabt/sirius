import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiriusFooter() {
  const company = [
    {
      title: "About Us",
      href: "#",
    },
    {
      title: "Careers",
      href: "#",
    },
    {
      title: "Brand assets",
      href: "#",
    },
    {
      title: "Privacy Policy",
      href: "#",
    },
    {
      title: "Terms of Service",
      href: "#",
    },
  ];

  const resources = [
    {
      title: "Blog",
      href: "#",
    },
    {
      title: "Help Center",
      href: "#",
    },
    {
      title: "Contact Support",
      href: "#",
    },
    {
      title: "Community",
      href: "#",
    },
    {
      title: "Security",
      href: "#",
    },
  ];

  const socialLinks = [
    {
      icon: FacebookIcon,
      link: "#",
    },
    {
      icon: GithubIcon,
      link: "#",
    },
    {
      icon: InstagramIcon,
      link: "#",
    },
    {
      icon: LinkedinIcon,
      link: "#",
    },
    {
      icon: TwitterIcon,
      link: "#",
    },
    {
      icon: YoutubeIcon,
      link: "#",
    },
  ];

  return (
    <footer className="w-full bg-background">
      <div className="border-t border-border" />

      <div className="mx-auto max-w-7xl">
        <div className="border-x border-border px-6 py-12 md:py-16 lg:py-20">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-6">
              <a href="/" className="flex items-center group">
                <img
                  src="/images/sirius-logo.png"
                  alt="Sirius"
                  className="h-10 w-auto"
                />
              </a>
              <p className="text-sm leading-6 text-muted-foreground font-mono">
                Pre-code documentation for serious<br />
                engineering teams.
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-md border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    asChild
                  >
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <item.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-foreground">
                    Resources
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {resources.map(({ href, title }) => (
                      <li key={title}>
                        <a
                          href={href}
                          className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-foreground">
                    Company
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {company.map(({ href, title }) => (
                      <li key={title}>
                        <a
                          href={href}
                          className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-x border-t border-border">
          <div className="px-6 py-8">
            <p className="text-center text-sm leading-5 text-muted-foreground">
              © {new Date().getFullYear()} Sirius, All rights reserved
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />
    </footer>
  );
}

export default SiriusFooter;
