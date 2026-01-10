import AppLogo from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	FacebookIcon,
	GithubIcon,
	InstagramIcon,
	LinkedinIcon,
	TwitterIcon,
	YoutubeIcon,
} from "lucide-react";

export function Footer() {
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
		<footer className="relative">
			<div
				className={cn(
					"mx-auto w-[95%] max-w-screen-2xl lg:border-x",
					"dark:bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)]"
				)}
			>
				<div className="absolute inset-x-0 h-px w-full bg-border" />
				<div className="grid max-w-screen-2xl grid-cols-6 gap-6 p-4">
					<div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
						<a className="w-max" href="#">
							<AppLogo />
						</a>
						<p className="max-w-sm text-balance font-mono text-muted-foreground text-sm">
							A comprehensive financial technology platform.
						</p>
						<div className="flex gap-2">
							{socialLinks.map((item, index) => (
								<Button
									key={`social-${item.link}-${index}`}
									size="icon-sm"
									variant="outline"
								>
									<a href={item.link} target="_blank">
										<item.icon className="size-3.5" />
									</a>
								</Button>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-muted-foreground text-xs">Resources</span>
						<div className="mt-2 flex flex-col gap-2">
							{resources.map(({ href, title }) => (
								<a
									className="w-max text-sm hover:underline"
									href={href}
									key={title}
								>
									{title}
								</a>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-muted-foreground text-xs">Company</span>
						<div className="mt-2 flex flex-col gap-2">
							{company.map(({ href, title }) => (
								<a
									className="w-max text-sm hover:underline"
									href={href}
									key={title}
								>
									{title}
								</a>
							))}
						</div>
					</div>
				</div>
				<div className="absolute inset-x-0 h-px w-full bg-border" />
				<div className="flex w-full flex-col justify-between gap-2 py-4">
					<p className="text-center font-light text-muted-foreground text-sm">
						&copy; {new Date().getFullYear()} efferd, All rights reserved
					</p>
				</div>
			</div>
		</footer>
	);
}
