import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

import { Footer } from '@/components/footer';
import SiriusNavbar from '@/components/sirius/SiriusNavbar';
import { GridPattern } from '@/components/ui/shadcn-io/grid-pattern';
import type { TeamMember } from '@/types';
import { preloadImages } from '@/utils/image-preloader';
import { Award, Building2, Globe, GraduationCap, Linkedin, Rocket, Trophy, Users } from 'lucide-react';

// Generate DiceBear avatar URL
const getAvatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=2d3748&textColor=ffffff`;
};

// Team members - 7 engineers
const teamMembers: TeamMember[] = [
    {
        name: 'Mohamed Thabet',
        role: 'Software Engineer',
        image: '/images/team/mohamed-thabet-portrait.webp',
        website: 'https://sirthabet.dev/',
        gender: 'male',
    },
    {
        name: 'Safinaz Ahmed',
        role: 'Data & AI Engineer',
        image: '/images/team/safi-portrait.webp',
        linkedin: 'https://www.linkedin.com/in/safinaz-ahmed/',
        gender: 'female',
    },
    {
        name: 'Kyrillos Nady',
        role: 'QA & Security Engineer',
        image: '/images/team/kyrillos-portrait.webp',
        website: 'https://0xk3r0.github.io/',
        gender: 'male',
    },
    {
        name: 'Dina Mohamed',
        role: 'Software Engineer',
        image: '/images/team/dina-portrait.webp',
        linkedin: 'https://www.linkedin.com/in/dina-mohamed-8387aa267/',
        gender: 'female',
    },
    {
        name: 'Marwa Ayman',
        role: 'Software Engineer',
        image: '/images/team/marwa-portrait.webp',
        linkedin: 'https://www.linkedin.com/in/marwa-ayman-5a66a7254/',
        gender: 'female',
    },
    {
        name: 'Mohamed Sayed',
        role: 'Software Engineer',
        image: '/images/team/mohamed-sayed-portrait.webp',
        linkedin: 'https://www.linkedin.com/in/mohamed-sayed-10b892172/',
        gender: 'male',
    },
    {
        name: 'Mera Ashraf',
        role: 'Software Engineer',
        image: '/images/team/mera-portrait.webp',
        linkedin: 'https://www.linkedin.com/in/mera-ashraf-019438320/',
        gender: 'female',
    },
];

// Milestones from the team's graduation and MIE 2026 announcements.
const highlights = [
    { value: 'A+', label: 'Graduation project grade' },
    { value: '~200', label: 'Real users' },
    { value: '100+', label: 'Software products planned' },
    { value: 'Finalist', label: 'Made In Egypt (MIE) 2026' },
];

const milestones = [
    {
        icon: Users,
        when: 'Dec 2024',
        title: 'The team comes together',
        body: 'Seven engineers in their third year start building Sirius as their graduation project.',
    },
    {
        icon: Award,
        when: 'Competitions',
        title: 'Ebda3 & Made In Egypt (MIE)',
        body: 'Competed in national competitions and qualified for advanced stages.',
    },
    {
        icon: Building2,
        when: 'Incubation',
        title: 'MINT by EGBANK',
        body: 'Joined the MINT business incubator and was shortlisted several times.',
    },
    {
        icon: Rocket,
        when: 'In production',
        title: 'Real users, real problems',
        body: 'Around 200 users planned more than 100 software products, bringing real production and agentic-AI challenges.',
    },
    {
        icon: GraduationCap,
        when: '2026',
        title: 'Graduation defense: A+',
        body: 'Closed a journey of more than a year and a half with an A+ grade.',
    },
    {
        icon: Trophy,
        when: '2026',
        title: 'MIE 2026 finalist',
        body: 'Officially qualified for the final stage of the 20th Made In Egypt competition.',
    },
];

export default function Team() {
    // Preload team images when component mounts
    useEffect(() => {
        const imageSources = teamMembers.filter((member) => member.image).map((member) => member.image!);

        if (imageSources.length > 0) {
            preloadImages(imageSources, 'low');
        }
    }, []);

    return (
        <>
            <Head title="Team - Sirius" />

            <div className="min-h-screen bg-background text-foreground">
                <SiriusNavbar />

                <main>
                    <section className="sirius-section relative min-h-screen overflow-hidden">
                        {/* Grid Pattern Background */}
                        <GridPattern
                            width={40}
                            height={40}
                            x={-1}
                            y={-1}
                            className="absolute inset-0 h-full w-full [mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-primary/[0.02] stroke-border/40"
                            squares={[
                                [2, 3],
                                [5, 1],
                                [8, 4],
                                [12, 2],
                                [15, 5],
                                [3, 8],
                                [7, 6],
                                [10, 9],
                                [14, 7],
                                [18, 3],
                                [1, 12],
                                [6, 10],
                                [11, 13],
                                [16, 11],
                                [20, 8],
                                [4, 15],
                                [9, 14],
                                [13, 16],
                                [17, 12],
                                [21, 6],
                            ]}
                        />

                        {/* Subtle radial accent */}
                        <div className="absolute top-0 left-1/2 z-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

                        {/* Content */}
                        <div className="sirius-container relative z-10">
                            {/* Header */}
                            <header className="mx-auto mb-14 flex max-w-3xl flex-col items-center gap-5 pt-6 text-center">
                                <span className="text-kicker">Our Team</span>
                                <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground md:text-6xl">
                                    The people behind Sirius
                                </h1>
                                <p className="text-body max-w-xl text-muted-foreground">
                                    Seven engineers who took a graduation project all the way to real users and a national final.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[
                                        { icon: GraduationCap, label: 'A+ graduation project' },
                                        { icon: Trophy, label: 'MIE 2026 finalist' },
                                        { icon: Users, label: '~200 real users' },
                                    ].map(({ icon: Icon, label }) => (
                                        <span
                                            key={label}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur"
                                        >
                                            <Icon className="h-3.5 w-3.5 text-amber-400" />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </header>

                            {/* Team portraits */}
                            <ul className="flex flex-wrap justify-center gap-5">
                                {teamMembers.map((member) => {
                                    const primaryLink = member.linkedin || member.website;
                                    const LinkIcon = member.linkedin ? Linkedin : Globe;

                                    return (
                                        <li key={member.name} className="w-full max-w-[300px] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
                                            <a
                                                href={primaryLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${member.name}, ${member.role}`}
                                                className="group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-2xl"
                                            >
                                                <div className="relative aspect-[4/5] overflow-hidden">
                                                    <img
                                                        src={member.image || getAvatarUrl(member.name)}
                                                        alt={member.name}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover grayscale-[35%] transition duration-500 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                                                    />
                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                    {primaryLink && (
                                                        <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors group-hover:bg-white group-hover:text-black">
                                                            <LinkIcon className="h-4 w-4" />
                                                        </span>
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                                        <p className="text-lg font-semibold text-white">{member.name}</p>
                                                        <p className="mt-0.5 text-sm text-white/75">{member.role}</p>
                                                    </div>
                                                </div>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Journey & achievements */}
                            <div className="mx-auto mt-28 max-w-6xl">
                                <div className="mb-10 flex flex-col items-center gap-4 text-center">
                                    <span className="text-kicker">Our Journey</span>
                                    <h2 className="text-section-title text-foreground">From a graduation project to a national final</h2>
                                    <p className="text-body max-w-2xl text-muted-foreground">
                                        More than a year and a half of building Sirius as a real product, with real users, real production problems
                                        and real competition.
                                    </p>
                                </div>

                                <dl className="mb-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-border lg:grid-cols-4">
                                    {highlights.map((item, i) => (
                                        <div
                                            key={item.label}
                                            className={`bg-card/60 px-5 py-6 text-center ${i % 2 === 1 ? 'border-l border-border' : ''} ${i >= 2 ? 'border-t border-border lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
                                        >
                                            <dd className="text-3xl font-semibold tracking-tight text-foreground">{item.value}</dd>
                                            <dt className="mt-1 text-sm text-muted-foreground">{item.label}</dt>
                                        </div>
                                    ))}
                                </dl>

                                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
                                    <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                        <img
                                            src="/images/achievements/mie-2026-finalist.webp"
                                            alt="Sirius team announced as a finalist in the 20th Made In Egypt (MIE) competition"
                                            width={640}
                                            height={640}
                                            loading="lazy"
                                            className="aspect-square w-full object-cover"
                                        />
                                        <figcaption className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
                                            <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                                            Finalist, 20th Made In Egypt (MIE) by IEEE Egypt Section
                                        </figcaption>
                                    </figure>

                                    <ol className="relative space-y-6 border-l border-border pl-8">
                                        {milestones.map((milestone) => {
                                            const Icon = milestone.icon;
                                            return (
                                                <li key={milestone.title} className="relative">
                                                    <span className="absolute top-0 -left-[45px] flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                        {milestone.when}
                                                    </p>
                                                    <h3 className="mt-1 text-base font-semibold text-foreground">{milestone.title}</h3>
                                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{milestone.body}</p>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </div>

                                <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
                                    Special thanks to <span className="font-medium text-foreground">Khaled Sokkar</span>, who believed in the idea
                                    from the start and kept our hope in it alive throughout the journey.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
